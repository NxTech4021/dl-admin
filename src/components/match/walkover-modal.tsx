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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Match, WalkoverReason } from "@/constants/zod/match-schema";
import { useConvertToWalkover } from "@/hooks/queries";
import { IconWalk, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";

interface WalkoverModalProps {
  match: Match | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const WALKOVER_REASONS: { value: WalkoverReason; label: string }[] = [
  { value: "NO_SHOW", label: "No Show" },
  { value: "LATE_CANCELLATION", label: "Late Cancellation" },
  { value: "INJURY", label: "Injury" },
  { value: "PERSONAL_EMERGENCY", label: "Personal Emergency" },
  { value: "OTHER", label: "Other" },
];

export function WalkoverModal({
  match,
  open,
  onOpenChange,
  onSuccess,
}: WalkoverModalProps) {
  const [reason, setReason] = useState<WalkoverReason | "">("");
  const [defaultingPlayerId, setDefaultingPlayerId] = useState("");
  const [notifyParticipants, setNotifyParticipants] = useState(true);

  const convertToWalkover = useConvertToWalkover();

  // Get unique players/teams from participants
  const getParticipantOptions = () => {
    if (!match) return [];

    if (match.matchType === "SINGLES") {
      return match.participants.map((p) => ({
        id: p.userId,
        label: p.user?.name || p.user?.username || "Unknown",
      }));
    } else {
      // For doubles, group by team
      const team1 = match.participants.filter((p) => p.team === "team1");
      const team2 = match.participants.filter((p) => p.team === "team2");

      const options = [];
      if (team1.length > 0) {
        const names = team1
          .map((p) => p.user?.name || p.user?.username || "Unknown")
          .join(" & ");
        options.push({
          id: team1[0].userId,
          label: `Team 1: ${names}`,
        });
      }
      if (team2.length > 0) {
        const names = team2
          .map((p) => p.user?.name || p.user?.username || "Unknown")
          .join(" & ");
        options.push({
          id: team2[0].userId,
          label: `Team 2: ${names}`,
        });
      }
      return options;
    }
  };

  const getWinningPlayerId = () => {
    if (!match || !defaultingPlayerId) return "";
    const options = getParticipantOptions();
    const winner = options.find((o) => o.id !== defaultingPlayerId);
    return winner?.id || "";
  };

  const handleSubmit = async () => {
    if (!match || !reason || !defaultingPlayerId) return;

    const winningPlayerId = getWinningPlayerId();
    if (!winningPlayerId) {
      toast.error("Could not determine winning player");
      return;
    }

    try {
      await convertToWalkover.mutateAsync({
        matchId: match.id,
        reason,
        defaultingPlayerId,
        winningPlayerId,
        notifyParticipants,
      });
      toast.success("Match converted to walkover successfully");
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    } catch {
      toast.error("Failed to convert match to walkover");
    }
  };

  const resetForm = () => {
    setReason("");
    setDefaultingPlayerId("");
    setNotifyParticipants(true);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  if (!match) return null;

  const participantOptions = getParticipantOptions();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <IconWalk className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Convert to Walkover</DialogTitle>
          </div>
          <DialogDescription>
            A walkover awards the match to one player/team when the opponent
            cannot or does not participate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="defaulting">Defaulting Player/Team *</Label>
            <Select
              value={defaultingPlayerId}
              onValueChange={setDefaultingPlayerId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select who defaulted" />
              </SelectTrigger>
              <SelectContent>
                {participantOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Select
              value={reason}
              onValueChange={(value) => setReason(value as WalkoverReason)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select walkover reason" />
              </SelectTrigger>
              <SelectContent>
                {WALKOVER_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="notify-walkover"
              checked={notifyParticipants}
              onCheckedChange={(checked) =>
                setNotifyParticipants(checked as boolean)
              }
            />
            <Label
              htmlFor="notify-walkover"
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
            disabled={convertToWalkover.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              convertToWalkover.isPending || !reason || !defaultingPlayerId
            }
          >
            {convertToWalkover.isPending ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              "Convert to Walkover"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
