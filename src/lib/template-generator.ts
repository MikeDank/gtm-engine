type Channel = "email" | "linkedin";
type Variant = "short_cold_opener" | "value_first";

interface LeadInfo {
  name: string | null;
  role: string | null;
  company: string | null;
}

interface SignalInfo {
  excerpt: string;
  source: string;
}

interface GeneratedDraft {
  channel: Channel;
  subject: string | null;
  content: string;
  variantKey: string;
}

function getGreeting(name: string | null): string {
  return name ? `Hey ${name}` : "Hey there";
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

export const VARIANTS: { key: Variant; label: string }[] = [
  { key: "short_cold_opener", label: "Short Cold Opener" },
  { key: "value_first", label: "Value-First" },
];

export const CHANNELS: { key: Channel; label: string }[] = [
  { key: "email", label: "Email" },
  { key: "linkedin", label: "LinkedIn" },
];
