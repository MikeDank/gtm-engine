import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PipelineStatus } from "@/app/leads/actions";

const statusConfig: Record<
  PipelineStatus,
  { label: string; className: string }
> = {
  new: {
    label: "New",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  contacted: {
    label: "Contacted",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  replied: {
    label: "Replied",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  meeting_booked: {
    label: "Meeting Booked",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  not_interested: {
    label: "Not Interested",
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

interface PipelineStatusBadgeProps {
  status: PipelineStatus;
  className?: string;
}

export function PipelineStatusBadge({
  status,
  className,
}: PipelineStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.new;

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
