"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConvertToLeadDialog } from "@/components/convert-to-lead-dialog";
import { updateSignalStatus, updateSignalAngle } from "../actions";
import { ANGLES, type Angle } from "@/lib/angles";

interface SignalActionsProps {
  signalId: string;
  currentStatus: string;
  currentAngle: Angle | null;
}

export function SignalActions({
  signalId,
  currentStatus,
  currentAngle,
}: SignalActionsProps) {
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    await updateSignalStatus(signalId, newStatus);
    router.refresh();
  };

  const handleAngleChange = async (newAngle: string) => {
    const angle = newAngle === "none" ? null : (newAngle as Angle);
    await updateSignalAngle(signalId, angle);
    router.refresh();
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">Angle:</span>
        <Select
          value={currentAngle ?? "none"}
          onValueChange={handleAngleChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select angle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No angle</SelectItem>
            {ANGLES.map((angle) => (
              <SelectItem key={angle.key} value={angle.key}>
                {angle.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
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
          <Button
            variant="outline"
            onClick={() => handleStatusChange("pending")}
          >
            Reset to Pending
          </Button>
        )}
      </div>
    </div>
  );
}
