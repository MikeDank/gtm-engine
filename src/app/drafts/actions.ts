"use server";

import { db } from "@/lib/db";
import { generateDraft } from "@/lib/template-generator";

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
