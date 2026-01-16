import type { Angle } from "./angles";

interface ClassificationResult {
  angle: Angle | null;
  reasons: string[];
}

interface AngleRule {
  angle: Angle;
  keywords: string[];
  priority: number;
}

const ANGLE_RULES: AngleRule[] = [
  {
    angle: "incident_reduction",
    keywords: [
      "incident",
      "rollback",
      "outage",
      "downtime",
      "failure",
      "crash",
      "alert",
    ],
    priority: 1,
  },
  {
    angle: "policy_enforcement",
    keywords: ["policy", "enforce", "review", "approval", "gate", "governance"],
    priority: 2,
  },
  {
    angle: "migration_risk",
    keywords: [
      "migrate",
      "microservices",
      "auth",
      "legacy",
      "modernize",
      "rewrite",
      "refactor",
    ],
    priority: 3,
  },
  {
    angle: "developer_experience",
    keywords: [
      "developer experience",
      "devex",
      "productivity",
      "friction",
      "onboarding",
      "dx",
      "velocity",
    ],
    priority: 4,
  },
  {
    angle: "compliance_auditability",
    keywords: [
      "compliance",
      "audit",
      "regulation",
      "soc2",
      "gdpr",
      "hipaa",
      "security",
    ],
    priority: 5,
  },
  {
    angle: "speed_vs_safety",
    keywords: [
      "speed",
      "velocity",
      "fast",
      "safe",
      "safety",
      "trade-off",
      "tradeoff",
      "balance",
    ],
    priority: 6,
  },
];

export function classifyAngleFromSignal(excerpt: string): ClassificationResult {
  const excerptLower = excerpt.toLowerCase();
  const matches: { angle: Angle; keyword: string; priority: number }[] = [];

  for (const rule of ANGLE_RULES) {
    for (const keyword of rule.keywords) {
      if (excerptLower.includes(keyword)) {
        matches.push({
          angle: rule.angle,
          keyword,
          priority: rule.priority,
        });
        break;
      }
    }
  }

  if (matches.length === 0) {
    return { angle: null, reasons: ["No matching keywords found"] };
  }

  matches.sort((a, b) => a.priority - b.priority);

  const reasons = matches.map((m) => `Matched "${m.keyword}" → ${m.angle}`);

  return {
    angle: matches[0].angle,
    reasons,
  };
}
