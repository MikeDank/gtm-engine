"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createDraft } from "@/app/drafts/actions";
import { CHANNELS, VARIANTS } from "@/lib/template-generator";

interface DraftMessageDialogProps {
  leadId: string;
  hasSignal: boolean;
}

export function DraftMessageDialog({
  leadId,
  hasSignal,
}: DraftMessageDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<"email" | "linkedin">("email");
  const [variant, setVariant] = useState<"short_cold_opener" | "value_first">(
    "short_cold_opener"
  );
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const draft = await createDraft(leadId, channel, variant);
      setOpen(false);
      router.push(`/drafts/${draft.id}`);
    } catch (error) {
      console.error("Failed to create draft:", error);
      setIsLoading(false);
    }
  }

  if (!hasSignal) {
    return (
      <Button disabled variant="outline">
        Draft Message (No Signal)
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Draft Message</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Draft Message</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Channel</Label>
            <div className="flex gap-2">
              {CHANNELS.map((ch) => (
                <Button
                  key={ch.key}
                  type="button"
                  variant={channel === ch.key ? "default" : "outline"}
                  onClick={() => setChannel(ch.key)}
                >
                  {ch.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Variant</Label>
            <div className="flex gap-2">
              {VARIANTS.map((v) => (
                <Button
                  key={v.key}
                  type="button"
                  variant={variant === v.key ? "default" : "outline"}
                  onClick={() => setVariant(v.key)}
                >
                  {v.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Draft"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
