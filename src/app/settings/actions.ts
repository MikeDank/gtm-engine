"use server";

import { db } from "@/lib/db";
import type { LlmProvider } from "@/lib/llm/types";
import { getApiKey } from "@/lib/llm";

const DEFAULT_SETTINGS_ID = "default";

export interface LlmSettings {
  id: string;
  provider: LlmProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  dailyCostLimit: number;
}

export async function getLlmSettings(): Promise<LlmSettings> {
  const settings = await db.llmSettings.findUnique({
    where: { id: DEFAULT_SETTINGS_ID },
  });

  if (!settings) {
    return {
      id: DEFAULT_SETTINGS_ID,
      provider: "openai",
      model: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 1024,
      dailyCostLimit: 10.0,
    };
  }

  return {
    id: settings.id,
    provider: settings.provider as LlmProvider,
    model: settings.model,
    temperature: settings.temperature,
    maxTokens: settings.maxTokens,
    dailyCostLimit: settings.dailyCostLimit,
  };
}

export async function upsertLlmSettings(data: {
  provider: LlmProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  dailyCostLimit: number;
}): Promise<LlmSettings> {
  const settings = await db.llmSettings.upsert({
    where: { id: DEFAULT_SETTINGS_ID },
    update: {
      provider: data.provider,
      model: data.model,
      temperature: data.temperature,
      maxTokens: data.maxTokens,
      dailyCostLimit: data.dailyCostLimit,
    },
    create: {
      id: DEFAULT_SETTINGS_ID,
      provider: data.provider,
      model: data.model,
      temperature: data.temperature,
      maxTokens: data.maxTokens,
      dailyCostLimit: data.dailyCostLimit,
    },
  });

  return {
    id: settings.id,
    provider: settings.provider as LlmProvider,
    model: settings.model,
    temperature: settings.temperature,
    maxTokens: settings.maxTokens,
    dailyCostLimit: settings.dailyCostLimit,
  };
}

export async function checkApiKeyStatus(): Promise<{
  openai: boolean;
  anthropic: boolean;
}> {
  return {
    openai: !!getApiKey("openai"),
    anthropic: !!getApiKey("anthropic"),
  };
}
