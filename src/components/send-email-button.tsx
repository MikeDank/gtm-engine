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
import { sendEmailDraft } from "@/app/drafts/actions";

interface SendEmailButtonProps {
  draftId: string;
  leadEmail: string | null;
  emailFrom: string | null;
  onSuccess?: (messageId: string) => void;
  onError?: (error: string) => void;
}

export function SendEmailButton({
  draftId,
  leadEmail,
  emailFrom,
  onSuccess,
  onError,
}: SendEmailButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const disabled = !leadEmail;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const result = await sendEmailDraft(draftId);
      if (result.success && result.messageId) {
        setOpen(false);
        onSuccess?.(result.messageId);
      } else {
        onError?.(result.error || "Failed to send email");
      }
    } catch (error) {
      onError?.(
        error instanceof Error ? error.message : "Failed to send email"
      );
    } finally {
      setLoading(false);
    }
  };

  if (disabled) {
    return (
      <div className="flex flex-col items-start gap-1">
        <Button disabled variant="outline">
          Send Email
        </Button>
        <span className="text-muted-foreground text-xs">
          Add email on lead first
        </span>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Send Email</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
          <DialogDescription>
            Send this email to{" "}
            <span className="text-foreground font-medium">{leadEmail}</span>
            {emailFrom && (
              <>
                {" "}
                from{" "}
                <span className="text-foreground font-medium">{emailFrom}</span>
              </>
            )}
            ?
          </DialogDescription>
        </DialogHeader>
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
