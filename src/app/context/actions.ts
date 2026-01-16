"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type ContextDocType = "signals" | "icp" | "tone";

export interface ContextDoc {
  id: string;
  type: ContextDocType;
  title: string | null;
  content: string;
  isActive: boolean;
  createdAt: Date;
}

export async function createContextDoc(data: {
  type: ContextDocType;
  title?: string;
  content: string;
}): Promise<ContextDoc> {
  // Deactivate any existing active doc of this type
  await db.contextDoc.updateMany({
    where: { type: data.type, isActive: true },
    data: { isActive: false },
  });

  // Create new doc as active
  const doc = await db.contextDoc.create({
    data: {
      type: data.type,
      title: data.title || null,
      content: data.content,
      isActive: true,
    },
  });

  revalidatePath("/context");
  revalidatePath("/leads");

  return {
    id: doc.id,
    type: doc.type as ContextDocType,
    title: doc.title,
    content: doc.content,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
  };
}

export async function listContextDocs(
  type: ContextDocType
): Promise<ContextDoc[]> {
  const docs = await db.contextDoc.findMany({
    where: { type },
    orderBy: { createdAt: "desc" },
  });

  return docs.map((doc) => ({
    id: doc.id,
    type: doc.type as ContextDocType,
    title: doc.title,
    content: doc.content,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
  }));
}

export async function getActiveContextDoc(
  type: ContextDocType
): Promise<ContextDoc | null> {
  const doc = await db.contextDoc.findFirst({
    where: { type, isActive: true },
  });

  if (!doc) return null;

  return {
    id: doc.id,
    type: doc.type as ContextDocType,
    title: doc.title,
    content: doc.content,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
  };
}

export async function setActiveContextDoc(id: string): Promise<void> {
  const doc = await db.contextDoc.findUnique({ where: { id } });
  if (!doc) throw new Error("Context doc not found");

  // Deactivate all docs of this type
  await db.contextDoc.updateMany({
    where: { type: doc.type, isActive: true },
    data: { isActive: false },
  });

  // Activate the selected doc
  await db.contextDoc.update({
    where: { id },
    data: { isActive: true },
  });

  revalidatePath("/context");
  revalidatePath("/leads");
}

export async function getAllActiveContextDocs(): Promise<{
  signals: ContextDoc | null;
  icp: ContextDoc | null;
  tone: ContextDoc | null;
}> {
  const [signals, icp, tone] = await Promise.all([
    getActiveContextDoc("signals"),
    getActiveContextDoc("icp"),
    getActiveContextDoc("tone"),
  ]);

  return { signals, icp, tone };
}
