export type LlmProvider = "openai" | "anthropic";

export interface LlmConfig {
  provider: LlmProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey: string;
}

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface DraftOutput {
  subject?: string;
  content: string;
  variantKey: string;
  citations_used: string[];
  angle?: string | null;
  hypothesis?: string | null;
}

export interface LeadContext {
  name: string | null;
  role: string | null;
  company: string | null;
}

export interface SignalContext {
  excerpt: string;
  sourceUrl: string;
  capturedAt: Date;
  angle?: string | null;
}

export interface IcpContext {
  score: number;
  reasons: string[];
}

export type DraftChannel = "email" | "linkedin";
export type DraftTone = "short" | "technical" | "direct";
