import { Badge } from "@/components/ui/badge";

interface Touchpoint {
  id: string;
  channel: string;
  status: string;
  sentAt: Date | null;
  createdAt: Date;
  draft: {
    id: string;
    variantKey: string;
    subject: string | null;
  } | null;
}

interface TouchpointsListProps {
  touchpoints: Touchpoint[];
}

export function TouchpointsList({ touchpoints }: TouchpointsListProps) {
  if (touchpoints.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No touchpoints recorded.</p>
    );
  }

  return (
    <div className="space-y-2">
      {touchpoints.map((tp) => (
        <div
          key={tp.id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div className="flex items-center gap-2">
            <Badge variant="outline">{tp.channel}</Badge>
            <Badge
              variant={tp.status === "sent" ? "default" : "secondary"}
              className={tp.status === "sent" ? "bg-green-600" : ""}
            >
              {tp.status}
            </Badge>
            {tp.draft && (
              <span className="text-muted-foreground text-sm">
                {tp.draft.variantKey}
              </span>
            )}
          </div>
          <span className="text-muted-foreground text-sm">
            {tp.sentAt
              ? `Sent ${tp.sentAt.toLocaleString()}`
              : tp.createdAt.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
