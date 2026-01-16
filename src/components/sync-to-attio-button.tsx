"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { syncLeadToAttio } from "@/app/leads/actions";

interface SyncToAttioButtonProps {
  leadId: string;
  attioSyncedAt: Date | null;
}

export function SyncToAttioButton({
  leadId,
  attioSyncedAt,
}: SyncToAttioButtonProps) {
  const [loading, setLoading] = useState(false);
  const [syncedAt, setSyncedAt] = useState<Date | null>(attioSyncedAt);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await syncLeadToAttio(leadId);
      if (result.success) {
        setSyncedAt(new Date());
      } else {
        setError(result.error || "Sync failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button onClick={handleClick} disabled={loading} variant="outline">
        {loading ? "Syncing..." : "Sync to Attio"}
      </Button>
      {syncedAt && !error && (
        <span className="text-sm text-green-600">
          ✅ Synced {syncedAt.toLocaleString()}
        </span>
      )}
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
