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
import {
  sendPlannedTouchpointAction,
  syncLeadToAttio,
} from "@/app/leads/actions";
import { useRouter } from "next/navigation";

interface SendPlannedTouchpointButtonProps {
  touchpointId: string;
  leadEmail: string | null;
  subject?: string | null;
  isPaused?: boolean;
}

export function SendPlannedTouchpointButton({
  touchpointId,
  leadEmail,
  subject,
  isPaused = false,
}: SendPlannedTouchpointButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAttioSync, setShowAttioSync] = useState(false);
  const [attioSyncLeadId, setAttioSyncLeadId] = useState<string | null>(null);
  const [syncingAttio, setSyncingAttio] = useState(false);
  const router = useRouter();

  const disabled = !leadEmail || isPaused;

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await sendPlannedTouchpointAction(touchpointId);
      if (result.success) {
        if (result.shouldOfferAttioSync && result.leadId) {
          setShowAttioSync(true);
          setAttioSyncLeadId(result.leadId);
        } else {
          setOpen(false);
          router.refresh();
        }
      } else {
        setError(result.error || "Failed to send email");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  const handleAttioSync = async () => {
    if (!attioSyncLeadId) return;
    setSyncingAttio(true);
    try {
      await syncLeadToAttio(attioSyncLeadId);
    } finally {
      setSyncingAttio(false);
      setOpen(false);
      router.refresh();
    }
  };

  const handleSkipAttioSync = () => {
    setOpen(false);
    router.refresh();
  };

  if (disabled) {
    return (
      <Button disabled variant="outline" size="sm">
        {isPaused ? "Paused" : "Send Now (No email)"}
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
        {showAttioSync ? (
          <>
            <DialogHeader>
              <DialogTitle>Email Sent Successfully</DialogTitle>
              <DialogDescription>
                Would you like to sync this lead to Attio to update the CRM?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleSkipAttioSync}
                disabled={syncingAttio}
              >
                Skip
              </Button>
              <Button onClick={handleAttioSync} disabled={syncingAttio}>
                {syncingAttio ? "Syncing..." : "Sync to Attio"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Send Follow-up Email</DialogTitle>
              <DialogDescription>
                Send this follow-up to{" "}
                <span className="text-foreground font-medium">{leadEmail}</span>
                ?
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
