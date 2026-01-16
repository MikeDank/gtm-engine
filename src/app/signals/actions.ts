"use server";

import { db } from "@/lib/db";

export async function getSignals(status?: string) {
  const signals = await db.signal.findMany({
    where: status && status !== "all" ? { status } : undefined,
    orderBy: { capturedAt: "desc" },
  });
  return signals;
}

export async function getSignalById(id: string) {
  const signal = await db.signal.findUnique({
    where: { id },
  });
  return signal;
}

export async function updateSignalStatus(id: string, status: string) {
  const signal = await db.signal.update({
    where: { id },
    data: { status },
  });
  return signal;
}
