import type { LlmConfig, LlmMessage, LlmResponse, LlmProvider } from "./types";
import * as openai from "./openai";
import * as anthropic from "./anthropic";

export class LlmError extends Error {
  constructor(
    message: string,
    public readonly code: "missing_api_key" | "api_error" | "invalid_response"
  ) {
    super(message);
    this.name = "LlmError";
  }
}

export function getApiKey(provider: LlmProvider): string | null {
  if (provider === "openai") {
    return process.env.OPENAI_API_KEY || null;
  }
  if (provider === "anthropic") {
    return process.env.ANTHROPIC_API_KEY || null;
  }
  return null;
}

export async function chat(
  config: Omit<LlmConfig, "apiKey"> & { provider: LlmProvider },
  messages: LlmMessage[]
): Promise<LlmResponse> {
  const apiKey = getApiKey(config.provider);

  if (!apiKey) {
    throw new LlmError(
      `Missing API key for ${config.provider}. Set ${config.provider === "openai" ? "OPENAI_API_KEY" : "ANTHROPIC_API_KEY"} in your environment.`,
      "missing_api_key"
    );
  }

  const fullConfig: LlmConfig = {
    ...config,
    apiKey,
  };

  try {
    if (config.provider === "openai") {
      return await openai.chatCompletion(fullConfig, messages);
    }
    if (config.provider === "anthropic") {
      return await anthropic.chatCompletion(fullConfig, messages);
    }
    throw new LlmError(`Unknown provider: ${config.provider}`, "api_error");
  } catch (error) {
    if (error instanceof LlmError) {
      throw error;
    }
    throw new LlmError(
      error instanceof Error ? error.message : "Unknown LLM error",
      "api_error"
    );
  }
}

export { type LlmConfig, type LlmMessage, type LlmResponse, type LlmProvider };
