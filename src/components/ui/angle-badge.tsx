"use client";

import { Badge } from "@/components/ui/badge";
import { getAngleLabel, type Angle } from "@/lib/angles";
import { cn } from "@/lib/utils";

const ANGLE_COLORS: Record<Angle, string> = {
  speed_vs_safety: "bg-yellow-100 text-yellow-800 border-yellow-300",
  policy_enforcement: "bg-purple-100 text-purple-800 border-purple-300",
  migration_risk: "bg-orange-100 text-orange-800 border-orange-300",
  incident_reduction: "bg-red-100 text-red-800 border-red-300",
  developer_experience: "bg-blue-100 text-blue-800 border-blue-300",
  compliance_auditability: "bg-green-100 text-green-800 border-green-300",
};

interface AngleBadgeProps {
  angle: Angle | null | undefined;
  className?: string;
}

export function AngleBadge({ angle, className }: AngleBadgeProps) {
  if (!angle) {
    return (
      <Badge
        variant="outline"
        className={cn("text-muted-foreground", className)}
      >
        No angle
      </Badge>
    );
  }

  return (
    <Badge className={cn(ANGLE_COLORS[angle], className)}>
      {getAngleLabel(angle)}
    </Badge>
  );
}
