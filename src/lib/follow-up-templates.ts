interface LeadInfo {
  name: string | null;
  company: string | null;
}

interface SignalInfo {
  excerpt: string;
  angle?: string | null;
}

export interface FollowUpOutput {
  subject: string;
  content: string;
}

export interface GeneratedFollowUps {
  followUp1: FollowUpOutput;
  followUp2: FollowUpOutput;
}

function getFirstName(name: string | null): string {
  if (!name) return "there";
  return name.split(" ")[0];
}

function truncateExcerpt(excerpt: string, maxLength: number): string {
  if (excerpt.length <= maxLength) return excerpt;
  return excerpt.slice(0, maxLength).trim() + "...";
}

function getAngleDisplay(angle: string | null | undefined): string {
  if (!angle) return "your recent activity";
  const angleLabels: Record<string, string> = {
    incident_reduction: "incident reduction",
    speed_vs_safety: "balancing speed and safety",
    policy_enforcement: "policy enforcement",
    migration_risk: "migration challenges",
    developer_experience: "developer experience",
    compliance_auditability: "compliance and auditability",
  };
  return angleLabels[angle] || "your recent activity";
}

export function generateFollowUpTemplates(
  lead: LeadInfo,
  signal: SignalInfo
): GeneratedFollowUps {
  const firstName = getFirstName(lead.name);
  const companyName = lead.company || "your company";
  const angleDisplay = getAngleDisplay(signal.angle);
  const excerptShort = truncateExcerpt(signal.excerpt, 60);

  const followUp1: FollowUpOutput = {
    subject: `Following up`,
    content: `Hi ${firstName},

Wanted to quickly follow up on my previous message about ${angleDisplay}. Would love to hear your thoughts when you have a moment.

Best`,
  };

  const followUp2: FollowUpOutput = {
    subject: `One more thought for ${companyName}`,
    content: `Hi ${firstName},

Following up on my earlier outreach regarding "${excerptShort}".

${companyName} seems like a great fit for what we're building. Happy to share more specifics if helpful.

Let me know if you'd like to connect.

Best`,
  };

  return { followUp1, followUp2 };
}
