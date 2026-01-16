"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { sendPlannedTouchpointAction } from "@/app/leads/actions";
import { useRouter } from "next/navigation";

interface SendPlannedTouchpointButtonProps {
  touchpointId: string;
  leadEmail: string | null;
  subject?: string | null;
}

export function SendPlannedTouchpointButton({
  touchpointId,
  leadEmail,
  subject,
}: SendPlannedTouchpointButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const disabled = !leadEmail;

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await sendPlannedTouchpointAction(touchpointId);
      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error || "Failed to send email");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  if (disabled) {
    return (
      <Button disabled variant="outline" size="sm">
        Send Now (No email)
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          Send Now
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Follow-up Email</DialogTitle>
          <DialogDescription>
            Send this follow-up to{" "}
            <span className="text-foreground font-medium">{leadEmail}</span>?
            {subject && (
              <>
                <br />
                <span className="text-muted-foreground mt-1 block">
                  Subject: {subject}
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? "Sending..." : "Confirm Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
