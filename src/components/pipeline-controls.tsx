"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  updateLeadPipelineStatus,
  type PipelineStatus,
} from "@/app/leads/actions";
import { PipelineStatusBadge } from "./pipeline-status-badge";

interface PipelineControlsProps {
  leadId: string;
  currentStatus: PipelineStatus;
}

export function PipelineControls({
  leadId,
  currentStatus,
}: PipelineControlsProps) {
  const [status, setStatus] = useState<PipelineStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleStatusChange(newStatus: PipelineStatus) {
    setIsUpdating(true);
    try {
      await updateLeadPipelineStatus(leadId, newStatus);
      setStatus(newStatus);
    } catch (error) {
      console.error("Failed to update pipeline status:", error);
    } finally {
      setIsUpdating(false);
    }
  }

  const isPaused =
    status === "replied" ||
    status === "meeting_booked" ||
    status === "not_interested";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">Current status:</span>
        <PipelineStatusBadge status={status} />
      </div>

      {!isPaused && (
        <div className="flex flex-wrap gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={isUpdating}>
                Mark as Replied
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Mark as Replied?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will pause all follow-ups for this lead. The lead will be
                  marked as having replied to your outreach.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleStatusChange("replied")}
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={isUpdating}>
                Mark as Meeting Booked
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Mark as Meeting Booked?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will pause all follow-ups for this lead. Use this when
                  you&apos;ve successfully scheduled a meeting.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleStatusChange("meeting_booked")}
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={isUpdating}>
                Mark as Not Interested
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Mark as Not Interested?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will pause all follow-ups for this lead. Use this when
                  the lead has indicated they&apos;re not interested.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleStatusChange("not_interested")}
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {isPaused && (
        <div className="text-muted-foreground text-sm">
          Follow-ups are paused for this lead.
        </div>
      )}
    </div>
  );
}
