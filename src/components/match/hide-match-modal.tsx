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
import { Match } from "@/constants/zod/match-schema";
import { useHideMatch } from "@/hooks/queries";
import { IconEyeOff, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";

interface HideMatchModalProps {
  match: Match | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function HideMatchModal({
  match,
  open,
  onOpenChange,
  onSuccess,
}: HideMatchModalProps) {
  const [reason, setReason] = useState("");

  const hideMatch = useHideMatch();

  const handleSubmit = async () => {
    if (!match || !reason.trim()) return;

    try {
      await hideMatch.mutateAsync({
        matchId: match.id,
        reason: reason.trim(),
      });
      toast.success("Match hidden from public view");
      onOpenChange(false);
      setReason("");
      onSuccess?.();
    } catch {
      toast.error("Failed to hide match");
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setReason("");
    }
    onOpenChange(isOpen);
  };

  if (!match) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
              <IconEyeOff className="h-5 w-5 text-muted-foreground" />
            </div>
            <DialogTitle>Hide Match from Public</DialogTitle>
          </div>
          <DialogDescription>
            This will hide the match from public view. The match will still be
            visible to admins and participants.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for hiding *</Label>
            <Textarea
              id="reason"
              placeholder="Enter the reason for hiding this match..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={hideMatch.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={hideMatch.isPending || !reason.trim()}
          >
            {hideMatch.isPending ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Hiding...
              </>
            ) : (
              "Hide Match"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
