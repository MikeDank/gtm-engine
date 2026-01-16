import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SignalStatus = "pending" | "reviewed" | "converted" | "discarded";

const statusStyles: Record<SignalStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  reviewed: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  converted: "bg-green-100 text-green-800 hover:bg-green-100",
  discarded: "bg-gray-100 text-gray-800 hover:bg-gray-100",
};

interface SignalStatusBadgeProps {
  status: string;
}

export function SignalStatusBadge({ status }: SignalStatusBadgeProps) {
  const validStatus = (
    ["pending", "reviewed", "converted", "discarded"].includes(status)
      ? status
      : "pending"
  ) as SignalStatus;

  return (
    <Badge variant="secondary" className={cn(statusStyles[validStatus])}>
      {status}
    </Badge>
  );
}
