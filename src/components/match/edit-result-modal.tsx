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

  // Per-set game scores for detailed score entry
  const [gameScores, setGameScores] = useState<{ t1: string; t2: string }[]>([
    { t1: "", t2: "" },
    { t1: "", t2: "" },
    { t1: "", t2: "" },
  ]);

  const editMatchResult = useEditMatchResult();

  const updateGameScore = (setIdx: number, team: "t1" | "t2", value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "").slice(0, 2);
    setGameScores((prev) => {
      const next = [...prev];
      next[setIdx] = { ...next[setIdx], [team]: cleaned };

      // Auto-calculate set tally
      let s1 = 0, s2 = 0;
      for (const gs of next) {
        const g1 = parseInt(gs.t1) || 0;
        const g2 = parseInt(gs.t2) || 0;
        if (g1 === 0 && g2 === 0) continue;
        if (g1 > g2) s1++;
        else if (g2 > g1) s2++;
      }
      setTeam1Score(s1);
      setTeam2Score(s2);
      return next;
    });
  };

  const hasGameScores = gameScores.some((gs) => gs.t1 !== "" || gs.t2 !== "");

  // Initialize form with existing scores
  useEffect(() => {
    if (match && open) {
      setTeam1Score(match.team1Score ?? 0);
      setTeam2Score(match.team2Score ?? 0);
      setReason("");

      // Pre-populate per-set game scores from existing match scores
      if (match.scores && match.scores.length > 0) {
        const sorted = [...match.scores].sort((a, b) => a.setNumber - b.setNumber);
        const populated = [
          { t1: "", t2: "" },
          { t1: "", t2: "" },
          { t1: "", t2: "" },
        ];
        for (const score of sorted) {
          const idx = score.setNumber - 1;
          if (idx >= 0 && idx < 3) {
            populated[idx] = {
              t1: score.player1Games > 0 ? String(score.player1Games) : "",
              t2: score.player2Games > 0 ? String(score.player2Games) : "",
            };
          }
        }
        setGameScores(populated);
      } else {
        setGameScores([
          { t1: "", t2: "" },
          { t1: "", t2: "" },
          { t1: "", t2: "" },
        ]);
      }
    }
  }, [match, open]);

  const handleSubmit = async () => {
    if (!match || !reason.trim()) return;

    // Build setScores payload from game scores
    const setScoresPayload = hasGameScores
      ? gameScores
          .map((gs, idx) => ({
            setNumber: idx + 1,
            team1Games: parseInt(gs.t1) || 0,
            team2Games: parseInt(gs.t2) || 0,
          }))
          .filter((s) => s.team1Games > 0 || s.team2Games > 0)
      : undefined;

    // Auto-determine outcome from set tally
    const outcome = team1Score > team2Score
      ? "team1"
      : team2Score > team1Score
        ? "team2"
        : undefined;

    if (!outcome) {
      toast.error("Scores must have a clear winner (cannot be tied)");
      return;
    }

    try {
      await editMatchResult.mutateAsync({
        matchId: match.id,
        team1Score,
        team2Score,
        setScores: setScoresPayload,
        outcome,
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

  const team1Name = getTeamLabel("team1");
  const team2Name = getTeamLabel("team2");

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
            Enter the correct game scores per set. Set tally is auto-calculated.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Per-set game score inputs */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Game Scores (per set)
              </Label>
            </div>

            {/* Header row */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground w-16 shrink-0" />
              <span className="text-xs text-muted-foreground w-14 text-center truncate">{team1Name.split(" ")[0]}</span>
              <span className="text-xs text-muted-foreground w-4" />
              <span className="text-xs text-muted-foreground w-14 text-center truncate">{team2Name.split(" ")[0]}</span>
            </div>

            {[0, 1, 2].map((setIdx) => (
              <div key={setIdx} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16 shrink-0">
                  Set {setIdx + 1}{setIdx === 2 ? " (opt)" : ""}
                </span>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0"
                  value={gameScores[setIdx].t1}
                  onChange={(e) => updateGameScore(setIdx, "t1", e.target.value)}
                  className="h-8 w-14 text-center text-sm font-bold font-mono"
                />
                <span className="text-sm text-muted-foreground/50">-</span>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0"
                  value={gameScores[setIdx].t2}
                  onChange={(e) => updateGameScore(setIdx, "t2", e.target.value)}
                  className="h-8 w-14 text-center text-sm font-bold font-mono"
                />
              </div>
            ))}
          </div>

          {/* Auto-calculated set tally */}
          <div className="flex items-center gap-3 pt-2 border-t border-border/50">
            <div className="flex-1 space-y-1">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {team1Name} (sets)
              </Label>
              <Input
                type="text"
                value={team1Score}
                readOnly={hasGameScores}
                onChange={(e) => !hasGameScores && setTeam1Score(parseInt(e.target.value) || 0)}
                className="h-10 text-center text-xl font-bold"
              />
            </div>
            <span className="text-xl font-bold text-muted-foreground pt-5">-</span>
            <div className="flex-1 space-y-1">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {team2Name} (sets)
              </Label>
              <Input
                type="text"
                value={team2Score}
                readOnly={hasGameScores}
                onChange={(e) => !hasGameScores && setTeam2Score(parseInt(e.target.value) || 0)}
                className="h-10 text-center text-xl font-bold"
              />
            </div>
          </div>

          {hasGameScores && (
            <p className="text-xs text-muted-foreground text-center">
              Set tally auto-calculated from game scores
            </p>
          )}

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
            disabled={editMatchResult.isPending || !reason.trim() || team1Score === team2Score}
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
