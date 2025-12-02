"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  IconGavel,
  IconLoader2,
  IconCheck,
  IconX,
  IconEdit,
  IconBan,
  IconTrophy,
  IconQuestionMark,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useResolveDispute } from "@/hooks/use-queries";
import {
  Dispute,
  DisputeResolutionAction,
  getResolutionActionLabel,
} from "@/constants/zod/dispute-schema";

interface DisputeResolveModalProps {
  dispute: Dispute | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const RESOLUTION_ACTIONS: {
  value: DisputeResolutionAction;
  label: string;
  description: string;
  icon: typeof IconCheck;
  requiresScore?: boolean;
}[] = [
  {
    value: "UPHOLD_ORIGINAL",
    label: "Uphold Original Score",
    description: "Keep the originally submitted match result",
    icon: IconCheck,
  },
  {
    value: "UPHOLD_DISPUTER",
    label: "Accept Disputer's Claim",
    description: "Accept the score claimed by the disputing player",
    icon: IconTrophy,
    requiresScore: true,
  },
  {
    value: "CUSTOM_SCORE",
    label: "Set Custom Score",
    description: "Manually set a different score based on evidence",
    icon: IconEdit,
    requiresScore: true,
  },
  {
    value: "AWARD_WALKOVER",
    label: "Award Walkover",
    description: "Award a walkover to one of the parties",
    icon: IconTrophy,
    requiresScore: true,
  },
  {
    value: "VOID_MATCH",
    label: "Void Match",
    description: "Void the match entirely (no winner/loser recorded)",
    icon: IconBan,
  },
  {
    value: "REQUEST_MORE_INFO",
    label: "Request More Information",
    description: "Request additional evidence before deciding",
    icon: IconQuestionMark,
  },
];

export function DisputeResolveModal({
  dispute,
  open,
  onOpenChange,
  onSuccess,
}: DisputeResolveModalProps) {
  const [selectedAction, setSelectedAction] = useState<DisputeResolutionAction | null>(null);
  const [reason, setReason] = useState("");
  const [team1Score, setTeam1Score] = useState<number>(0);
  const [team2Score, setTeam2Score] = useState<number>(0);
  const [notifyPlayers, setNotifyPlayers] = useState(true);

  const resolveDispute = useResolveDispute();

  const selectedActionConfig = RESOLUTION_ACTIONS.find((a) => a.value === selectedAction);
  const requiresScore = selectedActionConfig?.requiresScore || false;

  const handleSubmit = async () => {
    if (!dispute || !selectedAction) return;

    if (!reason.trim()) {
      toast.error("Please provide a reason for this resolution");
      return;
    }

    try {
      const finalScore = requiresScore
        ? {
            team1Score,
            team2Score,
          }
        : undefined;

      await resolveDispute.mutateAsync({
        disputeId: dispute.id,
        action: selectedAction,
        finalScore,
        reason: reason.trim(),
        notifyPlayers,
      });

      toast.success("Dispute resolved successfully");
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to resolve dispute");
    }
  };

  const resetForm = () => {
    setSelectedAction(null);
    setReason("");
    setTeam1Score(0);
    setTeam2Score(0);
    setNotifyPlayers(true);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!dispute) return null;

  const match = dispute.match;
  const team1 = match?.participants?.filter((p) => p.team === "team1") || [];
  const team2 = match?.participants?.filter((p) => p.team === "team2") || [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <IconGavel className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Resolve Dispute</DialogTitle>
              <DialogDescription>
                Select a resolution action and provide your reasoning
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Match Info */}
          {match && (
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Current Match Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {team1.slice(0, 2).map((p) => (
                      <Avatar key={p.id} className="size-8">
                        <AvatarImage src={p.user?.image || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(p.user?.name || "?")}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    <span className="text-sm font-medium">
                      {team1.map((p) => p.user?.name?.split(" ")[0]).join(" & ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold">{match.team1Score ?? "-"}</span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="text-2xl font-bold">{match.team2Score ?? "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {team2.map((p) => p.user?.name?.split(" ")[0]).join(" & ")}
                    </span>
                    {team2.slice(0, 2).map((p) => (
                      <Avatar key={p.id} className="size-8">
                        <AvatarImage src={p.user?.image || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(p.user?.name || "?")}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Disputer's Claim */}
          {dispute.claimedScore && (
            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <IconAlertTriangle className="size-4 text-amber-600" />
                  Disputer Claims Score Should Be
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">
                    {dispute.claimedScore.team1Score ?? "?"}
                  </span>
                  <span className="text-muted-foreground">-</span>
                  <span className="text-2xl font-bold">
                    {dispute.claimedScore.team2Score ?? "?"}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Resolution Actions */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Resolution Action</Label>
            <RadioGroup
              value={selectedAction || ""}
              onValueChange={(val) => setSelectedAction(val as DisputeResolutionAction)}
              className="space-y-2"
            >
              {RESOLUTION_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <div
                    key={action.value}
                    className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedAction === action.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedAction(action.value)}
                  >
                    <RadioGroupItem value={action.value} id={action.value} className="mt-0.5" />
                    <div className="flex-1">
                      <Label
                        htmlFor={action.value}
                        className="flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <Icon className="size-4" />
                        {action.label}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Score Input (if required) */}
          {requiresScore && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Final Score</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label className="text-sm text-muted-foreground mb-1 block">
                    {team1.map((p) => p.user?.name?.split(" ")[0]).join(" & ") || "Team 1"}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={team1Score}
                    onChange={(e) => setTeam1Score(Number(e.target.value))}
                    className="text-center text-lg font-bold"
                  />
                </div>
                <span className="text-2xl text-muted-foreground pt-6">-</span>
                <div className="flex-1">
                  <Label className="text-sm text-muted-foreground mb-1 block">
                    {team2.map((p) => p.user?.name?.split(" ")[0]).join(" & ") || "Team 2"}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={team2Score}
                    onChange={(e) => setTeam2Score(Number(e.target.value))}
                    className="text-center text-lg font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-base font-semibold">
              Resolution Reason *
            </Label>
            <Textarea
              id="reason"
              placeholder="Explain the reasoning behind this resolution decision..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              This will be recorded in the audit log and visible to affected players
            </p>
          </div>

          {/* Notify Players */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notify-players"
              checked={notifyPlayers}
              onCheckedChange={(checked) => setNotifyPlayers(checked as boolean)}
            />
            <Label htmlFor="notify-players" className="text-sm font-normal cursor-pointer">
              Notify all match participants about this resolution
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={resolveDispute.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={resolveDispute.isPending || !selectedAction || !reason.trim()}
          >
            {resolveDispute.isPending ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Resolving...
              </>
            ) : (
              <>
                <IconGavel className="mr-2 h-4 w-4" />
                Resolve Dispute
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
