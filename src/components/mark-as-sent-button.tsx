"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { markDraftAsSent } from "@/app/touchpoints/actions";

interface MarkAsSentButtonProps {
  draftId: string;
  leadId: string;
}

export function MarkAsSentButton({ draftId, leadId }: MarkAsSentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      await markDraftAsSent(draftId, leadId);
      setSent(true);
    } catch (error) {
      console.error("Failed to mark as sent:", error);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <span
        className="text-sm text-green-600"
        onClick={(e) => e.preventDefault()}
      >
        ✓ Sent
      </span>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={loading}
      className="text-xs"
    >
      {loading ? "..." : "Mark Sent"}
    </Button>
  );
}
