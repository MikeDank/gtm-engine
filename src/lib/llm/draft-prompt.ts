import type {
  LeadContext,
  SignalContext,
  DraftChannel,
  DraftOutput,
  LlmMessage,
  IcpContext,
} from "./types";
import { getAngleLabel, isValidAngle, type Angle } from "../angles";

const SYSTEM_PROMPT = `You are a professional outreach message writer. Your job is to write personalized, evidence-based messages for sales outreach.

CRITICAL RULES:
1. ONLY use facts from the provided lead and signal information
2. NEVER invent, assume, or hallucinate any facts about the person or company
3. ALWAYS cite the source when referencing the signal
4. If information is missing, either omit that line or ask a safe question
5. Keep messages concise and professional
6. For LinkedIn: max 80 words
7. For Email: max 120 words

ANGLE-BASED FRAMING:
When an angle is provided, use it to frame your message:
- incident_reduction: Focus on reducing incidents/outages
- speed_vs_safety: Balance between moving fast and staying safe
- policy_enforcement: Automated policy and governance
- migration_risk: Safe migrations and modernization
- developer_experience: Improving developer productivity
- compliance_auditability: Meeting compliance requirements

Create a hypothesis explaining why this angle will resonate, based ONLY on the signal excerpt and ICP information provided.

OUTPUT FORMAT:
You must respond with valid JSON in this exact format:
{
  "subject": "string or null (required for email, null for LinkedIn)",
  "content": "string (the message body)",
  "variantKey": "string (unique identifier for this variant)",
  "citations_used": ["array of strings referencing excerpt/sourceUrl used"],
  "angle": "string or null (the angle used)",
  "hypothesis": "string or null (why this angle will resonate, based on signal/ICP)"
}

Do NOT include any text outside the JSON object.`;

type AngleFraming = "metric" | "risk";

interface GenerateDraftPromptParams {
  lead: LeadContext;
  signal: SignalContext;
  channel: DraftChannel;
  tone?: string;
  variantNumber: number;
  framing?: AngleFraming;
  icp?: IcpContext;
}

export function generateDraftPrompt(
  params: GenerateDraftPromptParams
): LlmMessage[] {
  const {
    lead,
    signal,
    channel,
    tone = "short, technical, direct",
    variantNumber,
    framing,
    icp,
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
      ? `\nANGLE: ${signal.angle} (${getAngleLabel(signal.angle as Angle)})`
      : "";

  const framingInfo = framing
    ? `\nFRAMING: ${framing} (use ${framing === "metric" ? "metric-based benefits" : "risk-based concerns"} in your hook)`
    : "";

  const icpInfo =
    icp && icp.reasons.length > 0
      ? `\nICP SCORING REASONS:\n${icp.reasons.map((r) => `- ${r}`).join("\n")}`
      : "";

  const signalInfo = `Excerpt: "${signal.excerpt}"
Source URL: ${signal.sourceUrl}
Captured: ${signal.capturedAt.toISOString()}${angleInfo}`;

  const userPrompt = `Write a ${channel} outreach message (variant ${variantNumber}) with the following context:

LEAD INFORMATION:
${leadInfo || "No lead details available - use a generic greeting"}

SIGNAL INFORMATION:
${signalInfo}${icpInfo}

CHANNEL: ${channel}
TONE: ${tone}${framingInfo}
VARIANT: ${variantNumber} (create a unique angle/approach)

${channel === "linkedin" ? "Keep under 80 words. No subject needed." : "Keep under 120 words. Include a subject line."}

${signal.angle ? `Use the ${signal.angle} angle to frame your message. Generate a hypothesis explaining why this angle will resonate based on the signal excerpt and ICP reasons above.` : ""}

Remember: ONLY reference facts from the lead/signal above. Do not make up any details.`;

  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];
}

export function parseDraftResponse(response: string): DraftOutput {
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse LLM response: no JSON found");
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    if (typeof parsed.content !== "string" || !parsed.content) {
      throw new Error("Missing or invalid 'content' field");
    }
    if (typeof parsed.variantKey !== "string" || !parsed.variantKey) {
      throw new Error("Missing or invalid 'variantKey' field");
    }
    if (!Array.isArray(parsed.citations_used)) {
      throw new Error("Missing or invalid 'citations_used' field");
    }

    return {
      subject: parsed.subject || undefined,
      content: parsed.content,
      variantKey: parsed.variantKey,
      citations_used: parsed.citations_used,
      angle: parsed.angle || null,
      hypothesis: parsed.hypothesis || null,
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
