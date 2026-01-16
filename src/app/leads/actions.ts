"use server";

import { db } from "@/lib/db";

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
