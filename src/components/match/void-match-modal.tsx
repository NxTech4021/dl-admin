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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Match } from "@/constants/zod/match-schema";
import { useVoidMatch } from "@/hooks/use-queries";
import { IconBan, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";

interface VoidMatchModalProps {
  match: Match | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function VoidMatchModal({
  match,
  open,
  onOpenChange,
  onSuccess,
}: VoidMatchModalProps) {
  const [reason, setReason] = useState("");
  const [notifyParticipants, setNotifyParticipants] = useState(true);

  const voidMatch = useVoidMatch();

  const handleSubmit = async () => {
    if (!match || !reason.trim()) return;

    try {
      await voidMatch.mutateAsync({
        matchId: match.id,
        reason: reason.trim(),
        notifyParticipants,
      });
      toast.success("Match voided successfully");
      onOpenChange(false);
      setReason("");
      onSuccess?.();
    } catch {
      toast.error("Failed to void match");
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setReason("");
      setNotifyParticipants(true);
    }
    onOpenChange(isOpen);
  };

  if (!match) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10">
              <IconBan className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>Void Match</DialogTitle>
          </div>
          <DialogDescription>
            This action will void the match and mark it as invalid. This cannot
            be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for voiding *</Label>
            <Textarea
              id="reason"
              placeholder="Enter the reason for voiding this match..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="notify"
              checked={notifyParticipants}
              onCheckedChange={(checked) =>
                setNotifyParticipants(checked as boolean)
              }
            />
            <Label
              htmlFor="notify"
              className="text-sm font-normal cursor-pointer"
            >
              Notify participants about this change
            </Label>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={voidMatch.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={voidMatch.isPending || !reason.trim()}
          >
            {voidMatch.isPending ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Voiding...
              </>
            ) : (
              "Void Match"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
