import { Badge } from "@/components/ui/badge";
import { SendPlannedTouchpointButton } from "./send-planned-touchpoint-button";

interface Touchpoint {
  id: string;
  channel: string;
  status: string;
  sentAt: Date | null;
  plannedFor: Date | null;
  subject: string | null;
  content: string | null;
  createdAt: Date;
  draft: {
    id: string;
    variantKey: string;
    subject: string | null;
  } | null;
}

interface TouchpointsListProps {
  touchpoints: Touchpoint[];
  leadId?: string;
  leadEmail?: string | null;
  isPaused?: boolean;
}

export function TouchpointsList({
  touchpoints,
  leadEmail,
  isPaused = false,
}: TouchpointsListProps) {
  if (touchpoints.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No touchpoints recorded.</p>
    );
  }

  const sortedTouchpoints = [...touchpoints].sort((a, b) => {
    if (a.status === "planned" && b.status === "sent") return -1;
    if (a.status === "sent" && b.status === "planned") return 1;
    const dateA = a.plannedFor || a.sentAt || a.createdAt;
    const dateB = b.plannedFor || b.sentAt || b.createdAt;
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="space-y-3">
      {isPaused && (
        <p className="text-muted-foreground mb-2 text-sm italic">
          Follow-ups are paused for this lead.
        </p>
      )}
      {sortedTouchpoints.map((tp) => (
        <div
          key={tp.id}
          className={`rounded-lg border p-3 ${
            isPaused && tp.status === "planned"
              ? "border-gray-200 bg-gray-50 opacity-60"
              : tp.status === "planned"
                ? "border-amber-200 bg-amber-50"
                : "border-green-200 bg-green-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{tp.channel}</Badge>
              <Badge
                variant={tp.status === "sent" ? "default" : "secondary"}
                className={
                  tp.status === "sent"
                    ? "bg-green-600"
                    : "bg-amber-500 text-white"
                }
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
              {tp.status === "sent" && tp.sentAt
                ? `Sent ${tp.sentAt.toLocaleDateString()}`
                : tp.plannedFor
                  ? `Scheduled for ${tp.plannedFor.toLocaleDateString()}`
                  : tp.createdAt.toLocaleDateString()}
            </span>
          </div>

          {tp.subject && (
            <div className="mt-2">
              <p className="text-sm font-medium">Subject: {tp.subject}</p>
            </div>
          )}

          {tp.content && (
            <div className="mt-2">
              <p className="line-clamp-3 text-sm whitespace-pre-wrap">
                {tp.content}
              </p>
            </div>
          )}

          {tp.status === "planned" && tp.content && tp.channel === "email" && (
            <div className="mt-3 flex items-center gap-2">
              <SendPlannedTouchpointButton
                touchpointId={tp.id}
                leadEmail={leadEmail ?? null}
                subject={tp.subject}
                isPaused={isPaused}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
