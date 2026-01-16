"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateLeadContactInfo,
  enrichLeadWithApollo,
} from "@/app/leads/actions";

interface ContactInfoFormProps {
  leadId: string;
  initialEmail: string | null;
  initialLinkedinUrl: string | null;
  enrichedAt: Date | null;
  enrichmentSource: string | null;
}

export function ContactInfoForm({
  leadId,
  initialEmail,
  initialLinkedinUrl,
  enrichedAt,
  enrichmentSource,
}: ContactInfoFormProps) {
  const [email, setEmail] = useState(initialEmail || "");
  const [linkedinUrl, setLinkedinUrl] = useState(initialLinkedinUrl || "");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        await updateLeadContactInfo(leadId, {
          email: email || null,
          linkedinUrl: linkedinUrl || null,
        });
        setMessage({ type: "success", text: "Contact info saved" });
      } catch {
        setMessage({ type: "error", text: "Failed to save contact info" });
      }
    });
  };

  const handleEnrich = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await enrichLeadWithApollo(leadId);
      if (result.success && result.data) {
        if (result.data.email) setEmail(result.data.email);
        if (result.data.linkedinUrl) setLinkedinUrl(result.data.linkedinUrl);
        setMessage({ type: "success", text: "Enrichment successful" });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Enrichment failed",
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
          <Input
            id="linkedinUrl"
            type="url"
            placeholder="https://linkedin.com/in/..."
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            disabled={isPending}
          />
        </div>
      </div>

      {enrichedAt && (
        <p className="text-muted-foreground text-sm">
          Last enriched: {enrichedAt.toLocaleString()}
          {enrichmentSource && ` (${enrichmentSource})`}
        </p>
      )}

      {message && (
        <p
          className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}
        >
          {message.text}
        </p>
      )}

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save Contact Info"}
        </Button>
        <Button variant="outline" onClick={handleEnrich} disabled={isPending}>
          {isPending ? "Enriching..." : "Enrich with Apollo"}
        </Button>
      </div>
    </div>
  );
}
