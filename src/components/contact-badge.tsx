import { Badge } from "@/components/ui/badge";

interface ContactBadgeProps {
  hasEmail: boolean;
  hasLinkedin: boolean;
}

export function ContactBadge({ hasEmail, hasLinkedin }: ContactBadgeProps) {
  const hasContact = hasEmail || hasLinkedin;

  if (!hasContact) {
    return (
      <Badge variant="secondary" className="text-muted-foreground">
        No contact
      </Badge>
    );
  }

  const parts: string[] = [];
  if (hasEmail) parts.push("Email");
  if (hasLinkedin) parts.push("LinkedIn");

  return (
    <Badge variant="default" className="bg-green-600">
      {parts.join(" + ")}
    </Badge>
  );
}
