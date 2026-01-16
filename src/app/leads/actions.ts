"use server";

import { db } from "@/lib/db";
import { enrichWithApollo } from "@/lib/apollo";
import {
  upsertCompany,
  upsertPerson,
  addNoteToPerson,
} from "@/lib/attio/client";
import { getActiveContextDoc } from "@/app/context/actions";
import { scoreLeadWithIcp } from "@/lib/icp-scoring";
import { revalidatePath } from "next/cache";
import { generateFollowUps as generateFollowUpsLib } from "@/lib/llm/generate-follow-ups";
import { sendEmail } from "@/lib/email/resend";

export async function createLeadFromSignal(
  signalId: string,
  data: { name: string; role?: string; company?: string }
) {
  const lead = await db.lead.create({
    data: {
      name: data.name,
      role: data.role || null,
      company: data.company || null,
      signalId,
    },
  });

  await db.signal.update({
    where: { id: signalId },
    data: { status: "converted" },
  });

  return lead;
}

export async function getLeads() {
  const leads = await db.lead.findMany({
    include: { signal: true },
    orderBy: { createdAt: "desc" },
  });
  return leads;
}

export async function getLeadById(id: string) {
  const lead = await db.lead.findUnique({
    where: { id },
    include: { signal: true },
  });
  return lead;
}

export type PipelineStatus =
  | "new"
  | "contacted"
  | "replied"
  | "meeting_booked"
  | "not_interested";

export async function updateLeadPipelineStatus(
  leadId: string,
  status: PipelineStatus
) {
  const updateData: {
    pipelineStatus: PipelineStatus;
    lastContactedAt?: Date;
    lastRepliedAt?: Date;
  } = {
    pipelineStatus: status,
  };

  if (status === "contacted") {
    updateData.lastContactedAt = new Date();
  } else if (
    status === "replied" ||
    status === "meeting_booked" ||
    status === "not_interested"
  ) {
    updateData.lastRepliedAt = new Date();
  }

  const lead = await db.lead.update({
    where: { id: leadId },
    data: updateData,
  });

  revalidatePath(`/leads/${leadId}`);
  return lead;
}

export async function updateLeadContactInfo(
  leadId: string,
  data: { email?: string | null; linkedinUrl?: string | null }
) {
  const lead = await db.lead.update({
    where: { id: leadId },
    data: {
      email: data.email ?? null,
      linkedinUrl: data.linkedinUrl ?? null,
      enrichedAt: new Date(),
      enrichmentSource: "manual",
    },
  });

  revalidatePath(`/leads/${leadId}`);
  return lead;
}

export async function enrichLeadWithApollo(leadId: string) {
  const lead = await db.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) {
    return { success: false, error: "Lead not found" };
  }

  const result = await enrichWithApollo(lead.company, lead.name, lead.role);

  if (!result.success || !result.data) {
    return { success: false, error: result.error };
  }

  await db.lead.update({
    where: { id: leadId },
    data: {
      email: result.data.email,
      linkedinUrl: result.data.linkedinUrl,
      enrichedAt: new Date(),
      enrichmentSource: "apollo",
    },
  });

  revalidatePath(`/leads/${leadId}`);
  return { success: true, data: result.data };
}

export interface SyncToAttioResult {
  success: boolean;
  personId?: string;
  companyId?: string;
  error?: string;
}

function buildAttioNoteMarkdown(
  lead: {
    name: string;
    role: string | null;
    company: string | null;
    email: string | null;
    linkedinUrl: string | null;
  },
  icpScore: { score: number; reasons: string[] },
  signal: {
    excerpt: string;
    source: string;
    capturedAt: Date;
    angle: string | null;
  } | null,
  drafts: {
    channel: string;
    angle: string | null;
    variantKey: string;
    hypothesis: string | null;
    content: string;
  }[],
  touchpoints: {
    channel: string;
    status: string;
    sentAt: Date | null;
  }[]
): string {
  const lines: string[] = [];

  lines.push("## Lead Summary");
  lines.push(`- **Name:** ${lead.name}`);
  if (lead.role) lines.push(`- **Role:** ${lead.role}`);
  if (lead.company) lines.push(`- **Company:** ${lead.company}`);
  if (lead.email) lines.push(`- **Email:** ${lead.email}`);
  if (lead.linkedinUrl) lines.push(`- **LinkedIn:** ${lead.linkedinUrl}`);
  lines.push("");

  lines.push("## ICP Score");
  lines.push(`**Score:** ${icpScore.score}/100`);
  lines.push("");
  lines.push("**Reasons:**");
  for (const reason of icpScore.reasons) {
    lines.push(`- ${reason}`);
  }
  lines.push("");

  if (signal) {
    lines.push("## Source Signal");
    lines.push(`- **Source URL:** ${signal.source}`);
    lines.push(
      `- **Captured At:** ${signal.capturedAt.toISOString().split("T")[0]}`
    );
    if (signal.angle) lines.push(`- **Angle:** ${signal.angle}`);
    lines.push("");
    lines.push("**Excerpt:**");
    lines.push(
      `> ${signal.excerpt.slice(0, 500)}${signal.excerpt.length > 500 ? "..." : ""}`
    );
    lines.push("");
  }

  if (drafts.length > 0) {
    lines.push("## Drafts");
    for (const draft of drafts) {
      lines.push(`### ${draft.channel} - ${draft.variantKey}`);
      if (draft.angle) lines.push(`- **Angle:** ${draft.angle}`);
      if (draft.hypothesis) lines.push(`- **Hypothesis:** ${draft.hypothesis}`);
      lines.push("");
      lines.push("**Content:**");
      lines.push(
        `> ${draft.content.slice(0, 300)}${draft.content.length > 300 ? "..." : ""}`
      );
      lines.push("");
    }
  }

  if (touchpoints.length > 0) {
    lines.push("## Touchpoints");
    for (const tp of touchpoints) {
      const sentInfo = tp.sentAt
        ? `Sent ${tp.sentAt.toISOString().split("T")[0]}`
        : tp.status;
      lines.push(`- **${tp.channel}:** ${sentInfo}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export async function syncLeadToAttio(
  leadId: string
): Promise<SyncToAttioResult> {
  try {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: {
        signal: true,
        drafts: true,
        touchpoints: true,
      },
    });

    if (!lead) {
      return { success: false, error: "Lead not found" };
    }

    const icpDoc = await getActiveContextDoc("icp");
    const icpScore = scoreLeadWithIcp(
      { name: lead.name, role: lead.role, company: lead.company },
      lead.signal ? { excerpt: lead.signal.excerpt } : null,
      icpDoc?.content || null
    );

    let companyId: string | null = null;
    if (lead.company) {
      const companyResult = await upsertCompany({ name: lead.company });
      if (!companyResult.success) {
        return {
          success: false,
          error: companyResult.error || "Failed to upsert company",
        };
      }
      companyId = companyResult.data?.id || null;
    }

    const personResult = await upsertPerson({
      name: lead.name,
      email: lead.email,
      linkedinUrl: lead.linkedinUrl,
      companyName: lead.company,
      title: lead.role,
    });

    if (!personResult.success || !personResult.data) {
      return {
        success: false,
        error: personResult.error || "Failed to upsert person",
      };
    }

    const personId = personResult.data.id;

    const noteMarkdown = buildAttioNoteMarkdown(
      lead,
      icpScore,
      lead.signal,
      lead.drafts,
      lead.touchpoints
    );

    const noteResult = await addNoteToPerson(personId, noteMarkdown);
    if (!noteResult.success) {
      return {
        success: false,
        error: noteResult.error || "Failed to add note",
      };
    }

    await db.lead.update({
      where: { id: leadId },
      data: {
        attioPersonId: personId,
        attioCompanyId: companyId,
        attioSyncedAt: new Date(),
      },
    });

    revalidatePath(`/leads/${leadId}`);

    return {
      success: true,
      personId,
      companyId: companyId || undefined,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export interface GenerateFollowUpsResult {
  success: boolean;
  touchpoints?: { id: string; plannedFor: Date; subject: string }[];
  usedLlm?: boolean;
  error?: string;
}

export async function generateFollowUpsAction(
  leadId: string
): Promise<GenerateFollowUpsResult> {
  try {
    const result = await generateFollowUpsLib(leadId);

    const now = new Date();
    const followUp1Date = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const followUp2Date = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    const touchpoint1 = await db.touchpoint.create({
      data: {
        leadId,
        channel: "email",
        status: "planned",
        plannedFor: followUp1Date,
        subject: result.followUps.followUp1.subject,
        content: result.followUps.followUp1.content,
      },
    });

    const touchpoint2 = await db.touchpoint.create({
      data: {
        leadId,
        channel: "email",
        status: "planned",
        plannedFor: followUp2Date,
        subject: result.followUps.followUp2.subject,
        content: result.followUps.followUp2.content,
      },
    });

    revalidatePath(`/leads/${leadId}`);

    return {
      success: true,
      touchpoints: [
        {
          id: touchpoint1.id,
          plannedFor: touchpoint1.plannedFor!,
          subject: touchpoint1.subject!,
        },
        {
          id: touchpoint2.id,
          plannedFor: touchpoint2.plannedFor!,
          subject: touchpoint2.subject!,
        },
      ],
      usedLlm: result.usedLlm,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export interface SendPlannedTouchpointResult {
  success: boolean;
  error?: string;
  shouldOfferAttioSync?: boolean;
  leadId?: string;
}

export async function sendPlannedTouchpointAction(
  touchpointId: string
): Promise<SendPlannedTouchpointResult> {
  try {
    const touchpoint = await db.touchpoint.findUnique({
      where: { id: touchpointId },
      include: { lead: true },
    });

    if (!touchpoint) {
      return { success: false, error: "Touchpoint not found" };
    }

    if (touchpoint.status !== "planned") {
      return { success: false, error: "Touchpoint is not in planned status" };
    }

    if (!touchpoint.content) {
      return { success: false, error: "Touchpoint has no content to send" };
    }

    if (!touchpoint.lead.email) {
      return { success: false, error: "Lead has no email address" };
    }

    const emailFrom = process.env.EMAIL_FROM;
    if (!emailFrom) {
      return {
        success: false,
        error: "EMAIL_FROM is not configured in environment",
      };
    }

    const result = await sendEmail({
      to: touchpoint.lead.email,
      from: emailFrom,
      subject: touchpoint.subject || "Following up",
      text: touchpoint.content,
    });

    if (result.status === "error") {
      return { success: false, error: result.error };
    }

    await db.touchpoint.update({
      where: { id: touchpointId },
      data: {
        status: "sent",
        sentAt: new Date(),
      },
    });

    if (touchpoint.lead.pipelineStatus === "new") {
      await db.lead.update({
        where: { id: touchpoint.leadId },
        data: {
          pipelineStatus: "contacted",
          lastContactedAt: new Date(),
        },
      });
    }

    revalidatePath(`/leads/${touchpoint.leadId}`);

    return {
      success: true,
      shouldOfferAttioSync: !!touchpoint.lead.attioPersonId,
      leadId: touchpoint.leadId,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
