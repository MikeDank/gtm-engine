"use server";

import { db } from "@/lib/db";
import { enrichWithApollo } from "@/lib/apollo";
import { revalidatePath } from "next/cache";

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
