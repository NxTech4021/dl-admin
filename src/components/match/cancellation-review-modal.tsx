"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Match } from "@/constants/zod/match-schema";
import { useReviewCancellation } from "@/hooks/queries";
import {
  IconClock,
  IconLoader2,
  IconCheck,
  IconX,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { formatTableDate } from "@/components/data-table/constants";

interface CancellationReviewModalProps {
  match: Match | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const PENALTY_SEVERITIES = [
  { value: "WARNING", label: "Warning (No points deduction)" },
  { value: "POINTS_DEDUCTION", label: "Points Deduction" },
  { value: "SUSPENSION", label: "Suspension" },
];

export function CancellationReviewModal({
  match,
  open,
  onOpenChange,
  onSuccess,
}: CancellationReviewModalProps) {
  const [approved, setApproved] = useState(false);
  const [applyPenalty, setApplyPenalty] = useState(false);
  const [penaltySeverity, setPenaltySeverity] = useState<string>("WARNING");
  const [reason, setReason] = useState("");

  const reviewCancellation = useReviewCancellation();

  const handleSubmit = async () => {
    if (!match) return;

    try {
      await reviewCancellation.mutateAsync({
        matchId: match.id,
        approved,
        applyPenalty: !approved && applyPenalty,
        penaltySeverity: !approved && applyPenalty ? penaltySeverity : undefined,
        reason: reason.trim() || undefined,
      });
      toast.success(
        approved
          ? "Late cancellation approved"
          : applyPenalty
          ? "Cancellation denied - penalty applied"
          : "Late cancellation denied"
      );
      handleClose(false);
      onSuccess?.();
    } catch {
      toast.error("Failed to review cancellation");
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setApproved(false);
      setApplyPenalty(false);
      setPenaltySeverity("WARNING");
      setReason("");
    }
    onOpenChange(isOpen);
  };

  if (!match) return null;

  // Get cancelling player info
  const cancelledBy = match.participants.find(
    (p) => p.userId === match.cancelledById
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100">
              <IconClock className="h-5 w-5 text-orange-600" />
            </div>
            <DialogTitle>Review Late Cancellation</DialogTitle>
          </div>
          <DialogDescription>
            Review this late cancellation and decide whether to approve it or apply a penalty.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Match Info */}
          <div className="rounded-lg border p-4 space-y-2 bg-muted/30">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Match Date:</span>
              <span className="font-medium">{formatTableDate(match.matchDate)}</span>
            </div>
            {cancelledBy && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cancelled By:</span>
                <span className="font-medium">
                  {cancelledBy.user?.name || cancelledBy.user?.username || "Unknown"}
                </span>
              </div>
            )}
            {match.cancellationReason && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reason:</span>
                <span className="font-medium capitalize">
                  {match.cancellationReason.toLowerCase().replace(/_/g, " ")}
                </span>
              </div>
            )}
            {match.cancellationComment && (
              <div className="text-sm">
                <span className="text-muted-foreground">Comment:</span>
                <p className="mt-1 text-sm">{match.cancellationComment}</p>
              </div>
            )}
          </div>

          {/* Decision */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Decision</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={approved ? "default" : "outline"}
                className={approved ? "bg-green-600 hover:bg-green-700" : ""}
                onClick={() => {
                  setApproved(true);
                  setApplyPenalty(false);
                }}
              >
                <IconCheck className="size-4 mr-2" />
                Approve
              </Button>
              <Button
                type="button"
                variant={!approved ? "destructive" : "outline"}
                onClick={() => setApproved(false)}
              >
                <IconX className="size-4 mr-2" />
                Deny
              </Button>
            </div>
          </div>

          {/* Penalty Options (only when denying) */}
          {!approved && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="apply-penalty" className="text-sm font-medium">
                    Apply Penalty
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Issue a penalty to the cancelling player
                  </p>
                </div>
                <Switch
                  id="apply-penalty"
                  checked={applyPenalty}
                  onCheckedChange={setApplyPenalty}
                />
              </div>

              {applyPenalty && (
                <div className="space-y-2">
                  <Label htmlFor="severity">Penalty Severity</Label>
                  <Select value={penaltySeverity} onValueChange={setPenaltySeverity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      {PENALTY_SEVERITIES.map((severity) => (
                        <SelectItem key={severity.value} value={severity.value}>
                          {severity.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {applyPenalty && (
                <Alert>
                  <IconAlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    A penalty notification will be sent to the player and this action will be logged.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Admin Notes (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Add any notes about this decision..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={reviewCancellation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={reviewCancellation.isPending}
            variant={approved ? "default" : "destructive"}
          >
            {reviewCancellation.isPending ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : approved ? (
              "Approve Cancellation"
            ) : applyPenalty ? (
              "Deny & Apply Penalty"
            ) : (
              "Deny Cancellation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
