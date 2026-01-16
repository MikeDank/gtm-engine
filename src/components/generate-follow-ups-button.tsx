"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateFollowUpsAction } from "@/app/leads/actions";
import { useRouter } from "next/navigation";

interface GenerateFollowUpsButtonProps {
  leadId: string;
}

export function GenerateFollowUpsButton({
  leadId,
}: GenerateFollowUpsButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const result = await generateFollowUpsAction(leadId);

    setIsLoading(false);

    if (result.success) {
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || "Failed to generate follow-ups");
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleClick} disabled={isLoading} variant="outline">
        {isLoading ? "Generating..." : "Generate Follow-ups"}
      </Button>
      {success && (
        <p className="text-sm text-green-600">
          Follow-ups generated successfully!
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
