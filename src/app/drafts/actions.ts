"use server";

import { db } from "@/lib/db";
import { generateDraft } from "@/lib/template-generator";
import { chat, LlmError } from "@/lib/llm";
import {
  generateDraftPrompt,
  parseDraftResponse,
} from "@/lib/llm/draft-prompt";
import { getLlmSettings } from "@/app/settings/actions";
import { getActiveContextDoc } from "@/app/context/actions";
import type { DraftChannel } from "@/lib/llm/types";

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
    { excerpt: lead.signal.excerpt, source: lead.signal.source },
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
    },
  });

  return draft;
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

  const toneGuidelines = toneDoc?.content || "short, technical, direct";

  const leadContext = {
    name: lead.name,
    role: lead.role,
    company: lead.company,
  };

  const signalContext = {
    excerpt: lead.signal.excerpt,
    sourceUrl: lead.signal.source,
    capturedAt: lead.signal.capturedAt,
  };

  const drafts: LlmDraftResult["drafts"] = [];

  for (const variantNumber of [1, 2]) {
    const messages = generateDraftPrompt({
      lead: leadContext,
      signal: signalContext,
      channel,
      tone: toneGuidelines,
      variantNumber,
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

      const draft = await db.draft.create({
        data: {
          leadId,
          channel,
          subject: parsed.subject || null,
          content: parsed.content,
          variantKey: `llm_${parsed.variantKey}_v${variantNumber}`,
        },
      });

      drafts.push({
        id: draft.id,
        channel: draft.channel,
        subject: draft.subject,
        content: draft.content,
        variantKey: draft.variantKey,
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
