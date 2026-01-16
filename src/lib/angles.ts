export const ANGLES = [
  { key: "speed_vs_safety", label: "Speed vs Safety" },
  { key: "policy_enforcement", label: "Policy Enforcement" },
  { key: "migration_risk", label: "Migration Risk" },
  { key: "incident_reduction", label: "Incident Reduction" },
  { key: "developer_experience", label: "Developer Experience" },
  { key: "compliance_auditability", label: "Compliance & Auditability" },
] as const;

export type Angle = (typeof ANGLES)[number]["key"];

export const ANGLE_KEYS: Angle[] = ANGLES.map((a) => a.key);

export function isValidAngle(value: string): value is Angle {
  return ANGLE_KEYS.includes(value as Angle);
}

export function getAngleLabel(angle: Angle): string {
  const found = ANGLES.find((a) => a.key === angle);
  return found?.label ?? angle;
}
