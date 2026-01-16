import type { Angle } from "./angles";
import { getAngleLabel } from "./angles";

type Channel = "email" | "linkedin";
type Variant = "short_cold_opener" | "value_first";
type AngleFraming = "metric" | "risk";

interface LeadInfo {
  name: string | null;
  role: string | null;
  company: string | null;
}

interface SignalInfo {
  excerpt: string;
  source: string;
  angle?: Angle | null;
}

interface IcpInfo {
  score: number;
  reasons: string[];
}

interface GeneratedDraft {
  channel: Channel;
  subject: string | null;
  content: string;
  variantKey: string;
  angle: Angle | null;
  hypothesis: string | null;
}

function getGreeting(name: string | null): string {
  return name ? `Hey ${name}` : "Hey there";
}

function generateHypothesis(
  angle: Angle | null,
  signal: SignalInfo,
  icp?: IcpInfo
): string | null {
  if (!angle) return null;

  const angleLabel = getAngleLabel(angle);
  const excerptSummary = signal.excerpt.slice(0, 50).trim();

  let reason = `the signal mentions "${excerptSummary}..."`;
  if (icp && icp.reasons.length > 0) {
    const icpReason = icp.reasons[0].replace(/\s*\(\+\d+\)/, "");
    reason = `${reason} and ${icpReason.toLowerCase()}`;
  }

  return `Angle=${angleLabel} will resonate because ${reason}`;
}

function getAngleHook(angle: Angle, framing: AngleFraming): string {
  const hooks: Record<Angle, { metric: string; risk: string }> = {
    incident_reduction: {
      metric:
        "Teams using our approach see 40% fewer incidents within the first quarter.",
      risk: "Without proper safeguards, incidents can cascade into major outages.",
    },
    speed_vs_safety: {
      metric:
        "Companies balance speed and safety, shipping 2x faster with fewer rollbacks.",
      risk: "Rushing releases without guardrails often leads to costly mistakes.",
    },
    policy_enforcement: {
      metric:
        "Automated policy checks reduce review cycles by 60% while maintaining compliance.",
      risk: "Manual policy enforcement creates bottlenecks and inconsistencies.",
    },
    migration_risk: {
      metric:
        "Structured migrations complete 30% faster with built-in validation.",
      risk: "Unplanned migrations can disrupt services for weeks.",
    },
    developer_experience: {
      metric:
        "Developer productivity improves 25% when friction is systematically reduced.",
      risk: "Poor developer experience leads to attrition and slower delivery.",
    },
    compliance_auditability: {
      metric: "Automated audit trails reduce compliance prep time by 50%.",
      risk: "Gaps in audit trails can result in failed compliance reviews.",
    },
  };

  return hooks[angle][framing];
}

function generateShortColdOpener(
  lead: LeadInfo,
  signal: SignalInfo,
  channel: Channel
): GeneratedDraft {
  const greeting = getGreeting(lead.name);
  const companyMention = lead.company ? ` at ${lead.company}` : "";
  const roleMention = lead.role ? ` as ${lead.role}` : "";

  const content =
    channel === "linkedin"
      ? `${greeting},

I came across this and thought of you${roleMention}${companyMention}:

"${signal.excerpt}"

Would love to connect and hear your thoughts.`
      : `${greeting},

I came across this and thought of you${roleMention}${companyMention}:

"${signal.excerpt}"

Source: ${signal.source}

Would love to connect and hear your thoughts.

Best regards`;

  const subject =
    channel === "email"
      ? `Quick note${companyMention ? ` re: ${lead.company}` : ""}`
      : null;

  return {
    channel,
    subject,
    content,
    variantKey: "short_cold_opener_v1",
    angle: signal.angle ?? null,
    hypothesis: null,
  };
}

function generateValueFirst(
  lead: LeadInfo,
  signal: SignalInfo,
  channel: Channel
): GeneratedDraft {
  const greeting = getGreeting(lead.name);
  const companyMention = lead.company ? `${lead.company}` : "your team";
  const roleMention = lead.role ? `${lead.role}` : "professional";

  const content =
    channel === "linkedin"
      ? `${greeting},

I noticed something that might be relevant to ${companyMention}:

"${signal.excerpt}"

As a ${roleMention}, you might find this interesting. I'd love to share some ideas on how to leverage this.

Open to a quick chat?`
      : `${greeting},

I noticed something that might be relevant to ${companyMention}:

"${signal.excerpt}"

Source: ${signal.source}

As a ${roleMention}, you might find this interesting. I'd love to share some ideas on how to leverage this.

Would you be open to a quick chat?

Best regards`;

  const subject = channel === "email" ? `Insight for ${companyMention}` : null;

  return {
    channel,
    subject,
    content,
    variantKey: "value_first_v1",
    angle: signal.angle ?? null,
    hypothesis: null,
  };
}

function generateAngleBasedDraft(
  lead: LeadInfo,
  signal: SignalInfo,
  channel: Channel,
  framing: AngleFraming,
  icp?: IcpInfo
): GeneratedDraft {
  const angle = signal.angle;
  if (!angle) {
    return generateValueFirst(lead, signal, channel);
  }

  const greeting = getGreeting(lead.name);
  const companyMention = lead.company ? `${lead.company}` : "your team";
  const hook = getAngleHook(angle, framing);
  const hypothesis = generateHypothesis(angle, signal, icp);

  const content =
    channel === "linkedin"
      ? `${greeting},

I noticed this about ${companyMention}:

"${signal.excerpt}"

${hook}

Would love to share how we help teams address this. Open to a quick chat?`
      : `${greeting},

I noticed this about ${companyMention}:

"${signal.excerpt}"

Source: ${signal.source}

${hook}

Would love to share how we help teams address this. Are you open to a quick chat?

Best regards`;

  const framingLabel = framing === "metric" ? "Metric" : "Risk";
  const subject =
    channel === "email"
      ? `${framingLabel}-based insight for ${companyMention}`
      : null;

  return {
    channel,
    subject,
    content,
    variantKey: `${angle}_${framing}_v1`,
    angle,
    hypothesis,
  };
}

export function generateDraft(
  lead: LeadInfo,
  signal: SignalInfo,
  channel: Channel,
  variant: Variant
): GeneratedDraft {
  if (variant === "short_cold_opener") {
    return generateShortColdOpener(lead, signal, channel);
  }
  return generateValueFirst(lead, signal, channel);
}

export function generateAngleDrafts(
  lead: LeadInfo,
  signal: SignalInfo,
  channel: Channel,
  icp?: IcpInfo
): GeneratedDraft[] {
  const metricDraft = generateAngleBasedDraft(
    lead,
    signal,
    channel,
    "metric",
    icp
  );
  const riskDraft = generateAngleBasedDraft(lead, signal, channel, "risk", icp);
  return [metricDraft, riskDraft];
}

export const VARIANTS: { key: Variant; label: string }[] = [
  { key: "short_cold_opener", label: "Short Cold Opener" },
  { key: "value_first", label: "Value-First" },
];

export const ANGLE_FRAMINGS: { key: AngleFraming; label: string }[] = [
  { key: "metric", label: "Metric Framing" },
  { key: "risk", label: "Risk Framing" },
];

export const CHANNELS: { key: Channel; label: string }[] = [
  { key: "email", label: "Email" },
  { key: "linkedin", label: "LinkedIn" },
];
