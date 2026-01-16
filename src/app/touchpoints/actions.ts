"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createTouchpoint(data: {
  leadId: string;
  channel: "email" | "linkedin";
  draftId?: string;
  status?: "planned" | "sent";
  sentAt?: Date;
}) {
  const touchpoint = await db.touchpoint.create({
    data: {
      leadId: data.leadId,
      channel: data.channel,
      draftId: data.draftId || null,
      status: data.status || "planned",
      sentAt: data.sentAt || null,
    },
  });

  revalidatePath(`/leads/${data.leadId}`);
  return touchpoint;
}

export async function markDraftAsSent(draftId: string, leadId: string) {
  const draft = await db.draft.findUnique({
    where: { id: draftId },
  });

  if (!draft) {
    throw new Error("Draft not found");
  }

  const touchpoint = await db.touchpoint.create({
    data: {
      leadId: leadId,
      channel: draft.channel as "email" | "linkedin",
      draftId: draftId,
      status: "sent",
      sentAt: new Date(),
    },
  });

  revalidatePath(`/leads/${leadId}`);
  return touchpoint;
}

export async function getTouchpointsForLead(leadId: string) {
  return db.touchpoint.findMany({
    where: { leadId },
    include: {
      draft: {
        select: {
          id: true,
          variantKey: true,
          subject: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
