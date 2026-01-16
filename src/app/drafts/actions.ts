"use server";

import { db } from "@/lib/db";
import { generateDraft, generateAngleDrafts } from "@/lib/template-generator";
import { chat, LlmError } from "@/lib/llm";
import {
  generateDraftPrompt,
  parseDraftResponse,
} from "@/lib/llm/draft-prompt";
import { getLlmSettings } from "@/app/settings/actions";
import { getActiveContextDoc } from "@/app/context/actions";
import { scoreLeadWithIcp } from "@/lib/icp-scoring";
import type { DraftChannel } from "@/lib/llm/types";
import type { Angle } from "@/lib/angles";

type Channel = "email" | "linkedin";
type Variant = "short_cold_opener" | "value_first";

export async function createDraft(
  leadId: string,
  channel: Channel,
  variant: Variant
) {
  const lead = await db.lead.findUnique({
    where: { id: leadId },
    include: { signal: true },
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  if (!lead.signal) {
    throw new Error("Lead has no source signal");
  }

  const generated = generateDraft(
    { name: lead.name, role: lead.role, company: lead.company },
    {
      excerpt: lead.signal.excerpt,
      source: lead.signal.source,
      angle: (lead.signal.angle as Angle) ?? null,
    },
    channel,
    variant
  );

  const draft = await db.draft.create({
    data: {
      leadId,
      channel: generated.channel,
      subject: generated.subject,
      content: generated.content,
      variantKey: generated.variantKey,
      angle: generated.angle,
      hypothesis: generated.hypothesis,
    },
  });

  return draft;
}

export async function createAngleDrafts(leadId: string, channel: Channel) {
  const lead = await db.lead.findUnique({
    where: { id: leadId },
    include: { signal: true },
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  if (!lead.signal) {
    throw new Error("Lead has no source signal");
  }

  const icpDoc = await getActiveContextDoc("icp");
  const icpScore = scoreLeadWithIcp(
    { name: lead.name, role: lead.role, company: lead.company },
    { excerpt: lead.signal.excerpt },
    icpDoc?.content || null
  );

  const generatedDrafts = generateAngleDrafts(
    { name: lead.name, role: lead.role, company: lead.company },
    {
      excerpt: lead.signal.excerpt,
      source: lead.signal.source,
      angle: (lead.signal.angle as Angle) ?? null,
    },
    channel,
    { score: icpScore.score, reasons: icpScore.reasons }
  );

  const createdDrafts = [];
  for (const generated of generatedDrafts) {
    const draft = await db.draft.create({
      data: {
        leadId,
        channel: generated.channel,
        subject: generated.subject,
        content: generated.content,
        variantKey: generated.variantKey,
        angle: generated.angle,
        hypothesis: generated.hypothesis,
      },
    });
    createdDrafts.push(draft);
  }

  return createdDrafts;
}

export async function getDraftsForLead(leadId: string) {
  const drafts = await db.draft.findMany({
    where: { leadId },
    orderBy: { createdAt: "desc" },
  });
  return drafts;
}

export async function getDraftById(id: string) {
  const draft = await db.draft.findUnique({
    where: { id },
    include: { lead: true },
  });
  return draft;
}

export async function updateDraft(
  id: string,
  data: { subject?: string | null; content: string }
) {
  const draft = await db.draft.update({
    where: { id },
    data: {
      subject: data.subject,
      content: data.content,
    },
  });
  return draft;
}

export async function getLatestLinkedInDraft(leadId: string) {
  const draft = await db.draft.findFirst({
    where: { leadId, channel: "linkedin" },
    orderBy: { createdAt: "desc" },
    include: { lead: true },
  });
  return draft;
}

export interface LlmDraftResult {
  drafts: Array<{
    id: string;
    channel: string;
    subject: string | null;
    content: string;
    variantKey: string;
    angle: string | null;
    hypothesis: string | null;
  }>;
  error?: string;
}

export async function createLlmDrafts(
  leadId: string,
  channel: DraftChannel
): Promise<LlmDraftResult> {
  const lead = await db.lead.findUnique({
    where: { id: leadId },
    include: { signal: true },
  });

  if (!lead) {
    return { drafts: [], error: "Lead not found" };
  }

  if (!lead.signal) {
    return { drafts: [], error: "Lead has no source signal" };
  }

  const settings = await getLlmSettings();
  const toneDoc = await getActiveContextDoc("tone");
  const icpDoc = await getActiveContextDoc("icp");

  const toneGuidelines = toneDoc?.content || "short, technical, direct";

  const icpScore = scoreLeadWithIcp(
    { name: lead.name, role: lead.role, company: lead.company },
    lead.signal ? { excerpt: lead.signal.excerpt } : null,
    icpDoc?.content || null
  );

  const leadContext = {
    name: lead.name,
    role: lead.role,
    company: lead.company,
  };

  const signalAngle = lead.signal.angle as string | null;

  const signalContext = {
    excerpt: lead.signal.excerpt,
    sourceUrl: lead.signal.source,
    capturedAt: lead.signal.capturedAt,
    angle: signalAngle,
  };

  const icpContext = {
    score: icpScore.score,
    reasons: icpScore.reasons,
  };

  const framings: Array<"metric" | "risk"> = ["metric", "risk"];
  const drafts: LlmDraftResult["drafts"] = [];

  for (let i = 0; i < framings.length; i++) {
    const framing = framings[i];
    const variantNumber = i + 1;

    const messages = generateDraftPrompt({
      lead: leadContext,
      signal: signalContext,
      channel,
      tone: toneGuidelines,
      variantNumber,
      framing,
      icp: icpContext,
    });

    try {
      const response = await chat(
        {
          provider: settings.provider,
          model: settings.model,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
        },
        messages
      );

      const parsed = parseDraftResponse(response.content);

      const angleFromSignal = signalAngle;
      const variantKeyWithFraming = signalAngle
        ? `${signalAngle}_${framing}_llm_v${variantNumber}`
        : `llm_${parsed.variantKey}_v${variantNumber}`;

      const draft = await db.draft.create({
        data: {
          leadId,
          channel,
          subject: parsed.subject || null,
          content: parsed.content,
          variantKey: variantKeyWithFraming,
          angle: parsed.angle || angleFromSignal,
          hypothesis: parsed.hypothesis || null,
        },
      });

      drafts.push({
        id: draft.id,
        channel: draft.channel,
        subject: draft.subject,
        content: draft.content,
        variantKey: draft.variantKey,
        angle: draft.angle,
        hypothesis: draft.hypothesis,
      });
    } catch (error) {
      if (error instanceof LlmError) {
        return { drafts, error: error.message };
      }
      return {
        drafts,
        error:
          error instanceof Error ? error.message : "Failed to generate draft",
      };
    }
  }

  return { drafts };
}
