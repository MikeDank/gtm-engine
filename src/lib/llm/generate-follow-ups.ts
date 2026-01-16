import { db } from "../db";
import { chat, getApiKey, LlmError } from "./index";
import {
  generateFollowUpPrompt,
  parseFollowUpResponse,
  type ParsedFollowUps,
} from "./follow-up-prompt";
import {
  generateFollowUpTemplates,
  type GeneratedFollowUps,
} from "../follow-up-templates";
import { getActiveContextDoc } from "@/app/context/actions";

export interface FollowUpGenerationResult {
  followUps: GeneratedFollowUps;
  usedLlm: boolean;
}

export async function generateFollowUps(
  leadId: string
): Promise<FollowUpGenerationResult> {
  const lead = await db.lead.findUnique({
    where: { id: leadId },
    include: {
      signal: true,
      touchpoints: {
        where: { status: "sent" },
        orderBy: { sentAt: "asc" },
      },
    },
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  const llmSettings = await db.llmSettings.findUnique({
    where: { id: "default" },
  });

  const provider = llmSettings?.provider ?? "openai";
  const apiKey = getApiKey(provider as "openai" | "anthropic");

  if (!apiKey) {
    return {
      followUps: generateFollowUpTemplates(
        { name: lead.name, company: lead.company },
        {
          excerpt: lead.signal?.excerpt ?? "",
          angle: lead.signal?.angle,
        }
      ),
      usedLlm: false,
    };
  }

  try {
    const toneDoc = await getActiveContextDoc("tone");
    const tone = toneDoc?.content;

    const previousMessages = lead.touchpoints
      .filter((tp) => tp.content)
      .map((tp) => tp.content as string);

    const messages = generateFollowUpPrompt({
      lead: {
        name: lead.name,
        role: lead.role,
        company: lead.company,
      },
      signal: {
        excerpt: lead.signal?.excerpt ?? "",
        sourceUrl: lead.signal?.source ?? "",
        capturedAt: lead.signal?.capturedAt ?? new Date(),
        angle: lead.signal?.angle,
      },
      tone,
      previousMessages,
    });

    const response = await chat(
      {
        provider: provider as "openai" | "anthropic",
        model: llmSettings?.model ?? "gpt-4o-mini",
        temperature: llmSettings?.temperature ?? 0.7,
        maxTokens: llmSettings?.maxTokens ?? 1024,
      },
      messages
    );

    const parsed: ParsedFollowUps = parseFollowUpResponse(response.content);

    return {
      followUps: {
        followUp1: parsed.followUp1,
        followUp2: parsed.followUp2,
      },
      usedLlm: true,
    };
  } catch (error) {
    if (error instanceof LlmError && error.code === "missing_api_key") {
      return {
        followUps: generateFollowUpTemplates(
          { name: lead.name, company: lead.company },
          {
            excerpt: lead.signal?.excerpt ?? "",
            angle: lead.signal?.angle,
          }
        ),
        usedLlm: false,
      };
    }
    throw error;
  }
}
