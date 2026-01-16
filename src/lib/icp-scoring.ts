import { extractIcpConfig } from "./markdown";

export interface Lead {
  name: string;
  role: string | null;
  company: string | null;
}

export interface Signal {
  excerpt: string;
}

export interface IcpScore {
  score: number;
  reasons: string[];
}

const DEFAULT_ROLE_KEYWORDS = [
  "platform",
  "security",
  "devex",
  "developer experience",
  "infrastructure",
  "devops",
  "sre",
  "engineering",
  "architect",
  "cto",
  "vp engineering",
  "head of",
  "director",
];

const DEFAULT_URGENCY_TERMS = [
  "incident",
  "rollback",
  "policy",
  "outage",
  "urgent",
  "critical",
  "breaking",
  "failed",
  "failure",
  "downtime",
  "breach",
  "vulnerability",
];

export function scoreLeadWithIcp(
  lead: Lead,
  signal: Signal | null,
  icpDocContent: string | null
): IcpScore {
  const reasons: string[] = [];
  let score = 0;

  let roleKeywords = DEFAULT_ROLE_KEYWORDS;
  let urgencyTerms = DEFAULT_URGENCY_TERMS;

  if (icpDocContent) {
    const config = extractIcpConfig(icpDocContent);
    if (config?.keywords && config.keywords.length > 0) {
      roleKeywords = config.keywords;
    }
    if (config?.urgencyTerms && config.urgencyTerms.length > 0) {
      urgencyTerms = config.urgencyTerms;
    }
  }

  if (lead.role) {
    const roleLower = lead.role.toLowerCase();
    const matchedKeyword = roleKeywords.find((kw) => roleLower.includes(kw));
    if (matchedKeyword) {
      score += 30;
      reasons.push(`Role contains "${matchedKeyword}" (+30)`);
    }
  }

  if (lead.company) {
    score += 20;
    reasons.push(`Company present: "${lead.company}" (+20)`);
  }

  if (signal?.excerpt) {
    const excerptLower = signal.excerpt.toLowerCase();
    const matchedTerm = urgencyTerms.find((term) =>
      excerptLower.includes(term)
    );
    if (matchedTerm) {
      score += 10;
      reasons.push(`Signal contains urgency term "${matchedTerm}" (+10)`);
    }
  }

  if (reasons.length === 0) {
    reasons.push("No strong ICP match");
  }

  return {
    score: Math.min(score, 100),
    reasons,
  };
}
