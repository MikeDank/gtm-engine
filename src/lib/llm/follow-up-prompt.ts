import type {
  LeadContext,
  SignalContext,
  IcpContext,
  LlmMessage,
} from "./types";
import { getAngleLabel, isValidAngle, type Angle } from "../angles";

const SYSTEM_PROMPT = `You are a professional sales follow-up writer. Your job is to write brief, personalized follow-up messages for outreach sequences.

CRITICAL RULES:
1. ONLY use facts from the provided lead, signal, and previous message information
2. NEVER invent, assume, or hallucinate any facts about the person or company
3. Keep follow-ups SHORT and to the point
4. Reference the previous outreach naturally without being pushy
5. Be professional but human

FOLLOW-UP TYPES:
1. Short Bump (max 50 words): Brief check-in that references the previous message
2. Value-Add Bump (max 80 words): Provide an additional insight or value point

OUTPUT FORMAT:
You must respond with valid JSON in this exact format:
{
  "followUp1": {
    "subject": "string (email subject for short bump)",
    "content": "string (the short bump message body, max 50 words)"
  },
  "followUp2": {
    "subject": "string (email subject for value-add bump)",
    "content": "string (the value-add message body, max 80 words)"
  }
}

Do NOT include any text outside the JSON object.`;

export interface FollowUpPromptParams {
  lead: LeadContext;
  signal: SignalContext;
  tone?: string;
  icp?: IcpContext;
  previousMessages?: string[];
}

export function generateFollowUpPrompt(
  params: FollowUpPromptParams
): LlmMessage[] {
  const {
    lead,
    signal,
    tone = "short, professional, friendly",
    icp,
    previousMessages = [],
  } = params;

  const leadInfo = [
    lead.name ? `Name: ${lead.name}` : null,
    lead.role ? `Role: ${lead.role}` : null,
    lead.company ? `Company: ${lead.company}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const angleInfo =
    signal.angle && isValidAngle(signal.angle)
      ? `\nAngle: ${signal.angle} (${getAngleLabel(signal.angle as Angle)})`
      : "";

  const icpInfo =
    icp && icp.reasons.length > 0
      ? `\nICP Score: ${icp.score}/100\nReasons:\n${icp.reasons.map((r) => `- ${r}`).join("\n")}`
      : "";

  const previousMessagesInfo =
    previousMessages.length > 0
      ? `\nPREVIOUS MESSAGES SENT:\n${previousMessages.map((m, i) => `Message ${i + 1}:\n${m}`).join("\n\n")}`
      : "\nNo previous messages sent yet (assume this is after the initial outreach).";

  const userPrompt = `Generate 2 email follow-up messages for this lead:

LEAD INFORMATION:
${leadInfo || "No lead details available - use a generic greeting"}

SIGNAL CONTEXT:
Excerpt: "${signal.excerpt}"
Source URL: ${signal.sourceUrl}${angleInfo}

${icpInfo}
${previousMessagesInfo}

TONE: ${tone}

Generate:
1. Short Bump (max 50 words): A brief, friendly check-in referencing the previous outreach
2. Value-Add Bump (max 80 words): Provide additional insight or value, reference the signal context

Remember: ONLY use facts provided above. Do not invent details.`;

  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];
}

export interface ParsedFollowUps {
  followUp1: { subject: string; content: string };
  followUp2: { subject: string; content: string };
}

export function parseFollowUpResponse(response: string): ParsedFollowUps {
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse LLM response: no JSON found");
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.followUp1 || !parsed.followUp2) {
      throw new Error("Missing followUp1 or followUp2 in response");
    }

    if (
      typeof parsed.followUp1.content !== "string" ||
      typeof parsed.followUp2.content !== "string"
    ) {
      throw new Error("Missing content in follow-up messages");
    }

    return {
      followUp1: {
        subject: parsed.followUp1.subject || "Following up",
        content: parsed.followUp1.content,
      },
      followUp2: {
        subject: parsed.followUp2.subject || "One more thought",
        content: parsed.followUp2.content,
      },
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `Failed to parse LLM response: invalid JSON - ${error.message}`
      );
    }
    throw error;
  }
}
