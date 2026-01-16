"use server";

import { db } from "@/lib/db";

export async function getSignals() {
  const signals = await db.signal.findMany({
    orderBy: { capturedAt: "desc" },
  });
  return signals;
}
