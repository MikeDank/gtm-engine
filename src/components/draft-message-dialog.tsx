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
import {
  createDraft,
  createLlmDrafts,
  createAngleDrafts,
} from "@/app/drafts/actions";
import { CHANNELS, VARIANTS } from "@/lib/template-generator";

interface DraftMessageDialogProps {
  leadId: string;
  hasSignal: boolean;
  signalAngle?: string | null;
}

type DraftMode = "template" | "angle" | "llm";

export function DraftMessageDialog({
  leadId,
  hasSignal,
  signalAngle,
}: DraftMessageDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<DraftMode>(
    signalAngle ? "angle" : "template"
  );
  const [channel, setChannel] = useState<"email" | "linkedin">("email");
  const [variant, setVariant] = useState<"short_cold_opener" | "value_first">(
    "short_cold_opener"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === "template") {
        const draft = await createDraft(leadId, channel, variant);
        setOpen(false);
        router.push(`/drafts/${draft.id}`);
      } else if (mode === "angle") {
        const drafts = await createAngleDrafts(leadId, channel);
        if (drafts.length > 0) {
          setOpen(false);
          router.refresh();
        }
      } else {
        const result = await createLlmDrafts(leadId, channel);
        if (result.error) {
          setError(result.error);
          setIsLoading(false);
          return;
        }
        if (result.drafts.length > 0) {
          setOpen(false);
          router.refresh();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create draft");
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
            <Label>Generation Mode</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={mode === "template" ? "default" : "outline"}
                onClick={() => setMode("template")}
                size="sm"
              >
                Template
              </Button>
              {signalAngle && (
                <Button
                  type="button"
                  variant={mode === "angle" ? "default" : "outline"}
                  onClick={() => setMode("angle")}
                  size="sm"
                >
                  Angle-Based
                </Button>
              )}
              <Button
                type="button"
                variant={mode === "llm" ? "default" : "outline"}
                onClick={() => setMode("llm")}
                size="sm"
              >
                LLM Draft
              </Button>
            </div>
            {mode === "angle" && (
              <p className="text-muted-foreground text-sm">
                Generates 2 variants: metric framing + risk framing.
              </p>
            )}
            {mode === "llm" && (
              <p className="text-muted-foreground text-sm">
                Uses AI to generate 2 evidence-locked variants with angle.
              </p>
            )}
          </div>

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

          {mode === "template" && (
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
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? mode === "llm" || mode === "angle"
                  ? "Generating..."
                  : "Creating..."
                : mode === "llm"
                  ? "Generate LLM Variants"
                  : mode === "angle"
                    ? "Generate Angle Variants"
                    : "Create Draft"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
