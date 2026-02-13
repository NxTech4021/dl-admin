"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Match } from "@/constants/zod/match-schema";
import { useEditMatchResult } from "@/hooks/queries";
import { IconEdit, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";

interface EditResultModalProps {
  match: Match | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditResultModal({
  match,
  open,
  onOpenChange,
  onSuccess,
}: EditResultModalProps) {
  const [team1Score, setTeam1Score] = useState<number>(0);
  const [team2Score, setTeam2Score] = useState<number>(0);
  const [reason, setReason] = useState("");

  const editMatchResult = useEditMatchResult();

  // Initialize form with existing scores
  useEffect(() => {
    if (match && open) {
      setTeam1Score(match.team1Score ?? 0);
      setTeam2Score(match.team2Score ?? 0);
      setReason("");
    }
  }, [match, open]);

  const handleSubmit = async () => {
    if (!match || !reason.trim()) return;

    try {
      await editMatchResult.mutateAsync({
        matchId: match.id,
        team1Score,
        team2Score,
        reason: reason.trim(),
      });
      toast.success("Match result updated successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("Failed to update match result");
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setReason("");
    }
    onOpenChange(isOpen);
  };

  if (!match) return null;

  // Get team labels from participants
  const getTeamLabel = (team: "team1" | "team2") => {
    if (match.matchType === "SINGLES") {
      const participant = match.participants.find((p) => p.team === team);
      return (
        participant?.user?.name || participant?.user?.username || `Team ${team.slice(-1)}`
      );
    } else {
      const teamMembers = match.participants
        .filter((p) => p.team === team)
        .map((p) => p.user?.name || p.user?.username || "Unknown");
      return teamMembers.length > 0
        ? teamMembers.join(" & ")
        : `Team ${team.slice(-1)}`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <IconEdit className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Edit Match Result</DialogTitle>
          </div>
          <DialogDescription>
            Update the match score. A reason is required for audit purposes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Score Inputs */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="space-y-2">
              <Label htmlFor="team1" className="text-xs text-center block">
                {getTeamLabel("team1")}
              </Label>
              <Input
                id="team1"
                type="number"
                min="0"
                value={team1Score}
                onChange={(e) => setTeam1Score(parseInt(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                className="text-center text-2xl font-bold h-14"
              />
            </div>
            <div className="text-center text-2xl font-bold text-muted-foreground">
              -
            </div>
            <div className="space-y-2">
              <Label htmlFor="team2" className="text-xs text-center block">
                {getTeamLabel("team2")}
              </Label>
              <Input
                id="team2"
                type="number"
                min="0"
                value={team2Score}
                onChange={(e) => setTeam2Score(parseInt(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                className="text-center text-2xl font-bold h-14"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for edit *</Label>
            <Textarea
              id="reason"
              placeholder="Enter the reason for editing this result..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              This will be recorded in the match history for audit purposes.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={editMatchResult.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={editMatchResult.isPending || !reason.trim()}
          >
            {editMatchResult.isPending ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
