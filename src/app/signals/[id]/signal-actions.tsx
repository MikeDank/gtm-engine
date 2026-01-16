"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConvertToLeadDialog } from "@/components/convert-to-lead-dialog";
import { updateSignalStatus } from "../actions";

interface SignalActionsProps {
  signalId: string;
  currentStatus: string;
}

export function SignalActions({ signalId, currentStatus }: SignalActionsProps) {
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    await updateSignalStatus(signalId, newStatus);
    router.refresh();
  };

  return (
    <div className="flex gap-2">
      {currentStatus !== "reviewed" && (
        <Button
          variant="outline"
          onClick={() => handleStatusChange("reviewed")}
        >
          Mark as Reviewed
        </Button>
      )}
      {currentStatus !== "converted" && (
        <ConvertToLeadDialog signalId={signalId} />
      )}
      {currentStatus !== "discarded" && (
        <Button
          variant="outline"
          onClick={() => handleStatusChange("discarded")}
        >
          Discard
        </Button>
      )}
      {currentStatus !== "pending" && (
        <Button variant="outline" onClick={() => handleStatusChange("pending")}>
          Reset to Pending
        </Button>
      )}
    </div>
  );
}
