"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  IconGavel,
  IconNotes,
  IconCalendar,
  IconUser,
  IconTrophy,
  IconClock,
  IconAlertCircle,
  IconCheck,
  IconExternalLink,
  IconHash,
  IconPoint,
  IconAlertTriangle,
  IconPhoto,
  IconArrowLeft,
  IconLoader2,
  IconX,
  IconEdit,
  IconBan,
  IconQuestionMark,
  IconSettings,
  IconCopy,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  Dispute,
  DisputeResolutionAction,
  getResolutionActionLabel,
} from "@/constants/zod/dispute-schema";
import { DisputeStatusBadge } from "./dispute-status-badge";
import { DisputePriorityBadge } from "./dispute-priority-badge";
import { DisputeCategoryBadge } from "./dispute-category-badge";
import { formatTableDate, formatDateTime } from "@/components/data-table/constants";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useResolveDispute } from "@/hooks/use-queries";

interface DisputeDetailModalProps {
  dispute: Dispute | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNote: () => void;
  onSuccess?: () => void;
  initialResolveMode?: boolean;
}

const RESOLUTION_ACTIONS: {
  value: DisputeResolutionAction;
  label: string;
  description: string;
  icon: typeof IconCheck;
  requiresScore?: boolean;
  variant?: "default" | "warning" | "destructive";
}[] = [
  {
    value: "UPHOLD_ORIGINAL",
    label: "Uphold Original",
    description: "Keep the originally submitted result",
    icon: IconCheck,
    variant: "default",
  },
  {
    value: "UPHOLD_DISPUTER",
    label: "Accept Claim",
    description: "Accept the disputer's claimed score",
    icon: IconTrophy,
    requiresScore: true,
    variant: "default",
  },
  {
    value: "CUSTOM_SCORE",
    label: "Custom Score",
    description: "Set a different score based on evidence",
    icon: IconEdit,
    requiresScore: true,
    variant: "default",
  },
  {
    value: "AWARD_WALKOVER",
    label: "Award Walkover",
    description: "Award walkover to one party",
    icon: IconTrophy,
    requiresScore: true,
    variant: "warning",
  },
  {
    value: "VOID_MATCH",
    label: "Void Match",
    description: "Void the match entirely",
    icon: IconBan,
    variant: "destructive",
  },
  {
    value: "REQUEST_MORE_INFO",
    label: "Request Info",
    description: "Request additional evidence",
    icon: IconQuestionMark,
    variant: "warning",
  },
  {
    value: "REJECT",
    label: "Reject",
    description: "Dismiss as invalid or spam",
    icon: IconX,
    variant: "destructive",
  },
];

export function DisputeDetailModal({
  dispute,
  open,
  onOpenChange,
  onAddNote,
  onSuccess,
  initialResolveMode = false,
}: DisputeDetailModalProps) {
  const navigate = useNavigate();

  // Resolve mode state
  const [isResolveMode, setIsResolveMode] = useState(initialResolveMode);
  const [selectedAction, setSelectedAction] =
    useState<DisputeResolutionAction | null>(null);
  const [reason, setReason] = useState("");
  const [team1Score, setTeam1Score] = useState("0");
  const [team2Score, setTeam2Score] = useState("0");
  const [notifyPlayers, setNotifyPlayers] = useState(true);

  const resolveDispute = useResolveDispute();

  // Sync resolve mode when modal opens with initialResolveMode
  useEffect(() => {
    if (open && initialResolveMode) {
      setIsResolveMode(true);
    }
  }, [open, initialResolveMode]);

  const resetResolveForm = () => {
    setSelectedAction(null);
    setReason("");
    setTeam1Score("0");
    setTeam2Score("0");
    setNotifyPlayers(true);
  };

  const handleBack = () => {
    setIsResolveMode(false);
    resetResolveForm();
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setIsResolveMode(false);
      resetResolveForm();
    }
    onOpenChange(isOpen);
  };

  const handleResolveSubmit = async () => {
    if (!dispute || !selectedAction) return;

    if (!reason.trim()) {
      toast.error("Please provide a reason for this resolution");
      return;
    }

    const selectedActionConfig = RESOLUTION_ACTIONS.find(
      (a) => a.value === selectedAction
    );
    const requiresScore = selectedActionConfig?.requiresScore || false;

    const score1 = parseInt(team1Score) || 0;
    const score2 = parseInt(team2Score) || 0;

    if (
      requiresScore &&
      (score1 < 0 || score2 < 0 || score1 > 99 || score2 > 99)
    ) {
      toast.error("Scores must be between 0 and 99");
      return;
    }

    try {
      const finalScore = requiresScore
        ? { team1Score: score1, team2Score: score2 }
        : undefined;

      await resolveDispute.mutateAsync({
        disputeId: dispute.id,
        action: selectedAction,
        finalScore,
        reason: reason.trim(),
        notifyPlayers,
      });

      toast.success("Dispute resolved successfully");
      handleClose(false);
      onSuccess?.();
    } catch {
      toast.error("Failed to resolve dispute");
    }
  };

  if (!dispute) return null;

  const isResolved =
    dispute.status === "RESOLVED" || dispute.status === "REJECTED";
  const match = dispute.match;

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Team participants
  const participants = match?.participants || [];
  const team1 = participants.filter(
    (p) => p.team === "team1" || p.team === "TEAM_1" || p.team === "1"
  );
  const team2 = participants.filter(
    (p) => p.team === "team2" || p.team === "TEAM_2" || p.team === "2"
  );

  const hasTeamAssignments = team1.length > 0 || team2.length > 0;
  const fallbackTeam1 = !hasTeamAssignments
    ? participants.filter((p) => p.role === "CREATOR" || p.role === "PARTNER")
    : [];
  const fallbackTeam2 = !hasTeamAssignments
    ? participants.filter((p) => p.role === "OPPONENT" || p.role === "INVITED")
    : [];

  const displayTeam1 = hasTeamAssignments ? team1 : fallbackTeam1;
  const displayTeam2 = hasTeamAssignments ? team2 : fallbackTeam2;

  const team1Name =
    displayTeam1.map((p) => p.user?.name).join(" & ") || "Team 1";
  const team2Name =
    displayTeam2.map((p) => p.user?.name).join(" & ") || "Team 2";

  const selectedActionConfig = RESOLUTION_ACTIONS.find(
    (a) => a.value === selectedAction
  );
  const requiresScore = selectedActionConfig?.requiresScore || false;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 transition-[max-width] duration-500 ease-out",
          isResolveMode ? "sm:max-w-[1100px]" : "sm:max-w-[720px]"
        )}
      >
        <AnimatePresence mode="wait">
          {!isResolveMode ? (
            // ==================== DETAIL VIEW ====================
            <motion.div
              key="details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col h-full max-h-[90vh]"
            >
              {/* Header Section */}
              <DialogHeader className="px-6 pt-6 pb-4 space-y-4 border-b border-border/50 shrink-0">
                {/* Badges Row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <DisputeStatusBadge status={dispute.status} />
                  <DisputePriorityBadge priority={dispute.priority} />
                  <DisputeCategoryBadge category={dispute.disputeCategory} />
                </div>

                {/* Title & ID */}
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 border border-destructive/20">
                    <IconAlertCircle className="size-5 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-xl font-semibold tracking-tight">
                      Dispute Details
                    </DialogTitle>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 group/id">
                      <IconHash className="size-3" />
                      <code className="font-mono text-[11px] select-all bg-muted/50 px-1.5 py-0.5 rounded">
                        {dispute.id}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(dispute.id);
                          toast.success("ID copied to clipboard");
                        }}
                        className="opacity-0 group-hover/id:opacity-100 transition-opacity p-0.5 hover:bg-muted rounded"
                      >
                        <IconCopy className="size-3.5 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* League/Season/Division Context Banner */}
                {match?.division && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/40 border border-border/50">
                    <IconTrophy className="size-4 text-primary" />
                    <div className="flex items-center gap-2 text-sm">
                      {match.division.season?.name && (
                        <>
                          <span className="font-medium">
                            {match.division.season.name}
                          </span>
                          <IconPoint className="size-2 text-muted-foreground/50" />
                        </>
                      )}
                      <span className="text-muted-foreground">
                        {match.division.name}
                      </span>
                    </div>
                  </div>
                )}
              </DialogHeader>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-6 py-5 space-y-5">
                  {/* Raised By Section */}
                  <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
                      <IconUser className="size-4 text-muted-foreground" />
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Raised By
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-11 ring-2 ring-background shadow-sm">
                          <AvatarImage
                            src={dispute.raisedByUser?.image || undefined}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {getInitials(dispute.raisedByUser?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-base">
                            {dispute.raisedByUser?.name || "Unknown"}
                          </p>
                          {dispute.raisedByUser?.username && (
                            <p className="text-sm text-muted-foreground">
                              @{dispute.raisedByUser.username}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                            Filed on
                          </p>
                          <p className="text-sm font-medium">
                            {formatDateTime(dispute.submittedAt)}
                          </p>
                        </div>
                      </div>

                      {dispute.description && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                            {dispute.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Match & Score Comparison */}
                  {match && (
                    <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
                        <IconTrophy className="size-4 text-muted-foreground" />
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Match Details
                        </span>
                        <button
                          type="button"
                          className="ml-auto text-xs text-primary hover:underline flex items-center gap-1"
                          onClick={() => {
                            onOpenChange(false);
                            // Use setTimeout to ensure modal closes before navigation
                            setTimeout(() => {
                              navigate({
                                to: "/matches",
                                search: { id: match.id },
                              });
                            }, 100);
                          }}
                        >
                          View Match
                          <IconExternalLink className="size-3" />
                        </button>
                      </div>
                      <div className="p-4 space-y-4">
                        {/* Participants Display */}
                        <div className="flex items-center justify-between gap-4">
                          {/* Team 1 */}
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <div className="flex -space-x-2">
                              {displayTeam1.slice(0, 2).map((p) => (
                                <Avatar
                                  key={p.id}
                                  className="size-9 border-2 border-background shadow-sm"
                                >
                                  <AvatarImage
                                    src={p.user?.image || undefined}
                                  />
                                  <AvatarFallback className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                    {getInitials(p.user?.name)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {displayTeam1.length === 0 && (
                                <div className="size-9 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                                  <span className="text-xs text-muted-foreground">
                                    ?
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">
                                {team1Name}
                              </p>
                            </div>
                          </div>

                          <div className="px-3 py-1 rounded-full bg-muted/50 border border-border/50">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              VS
                            </span>
                          </div>

                          {/* Team 2 */}
                          <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
                            <div className="min-w-0 flex-1 text-right">
                              <p className="font-medium text-sm truncate">
                                {team2Name}
                              </p>
                            </div>
                            <div className="flex -space-x-2">
                              {displayTeam2.slice(0, 2).map((p) => (
                                <Avatar
                                  key={p.id}
                                  className="size-9 border-2 border-background shadow-sm"
                                >
                                  <AvatarImage
                                    src={p.user?.image || undefined}
                                  />
                                  <AvatarFallback className="text-xs bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300">
                                    {getInitials(p.user?.name)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {displayTeam2.length === 0 && (
                                <div className="size-9 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                                  <span className="text-xs text-muted-foreground">
                                    ?
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Score Comparison Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3.5 rounded-xl border border-border/50 bg-background">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                              Reported Score
                            </p>
                            <p className="text-2xl font-bold font-mono tracking-tight">
                              {match.team1Score ?? "—"}{" "}
                              <span className="text-muted-foreground/50">
                                -
                              </span>{" "}
                              {match.team2Score ?? "—"}
                            </p>
                            {match.scores && match.scores.length > 0 && (
                              <div className="flex gap-2 mt-2.5 pt-2.5 border-t border-border/50">
                                {match.scores.map((set) => (
                                  <span
                                    key={set.id}
                                    className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded"
                                  >
                                    {set.player1Games}-{set.player2Games}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {dispute.claimedScore ? (
                            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30">
                              <div className="flex items-center gap-1.5 mb-2">
                                <IconAlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400" />
                                <p className="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-medium">
                                  Claimed Score
                                </p>
                              </div>
                              <p className="text-2xl font-bold font-mono tracking-tight text-amber-700 dark:text-amber-400">
                                {dispute.claimedScore.team1Score ?? "?"}{" "}
                                <span className="text-amber-500/50">-</span>{" "}
                                {dispute.claimedScore.team2Score ?? "?"}
                              </p>
                            </div>
                          ) : (
                            <div className="p-3.5 rounded-xl border border-dashed border-border/50 bg-muted/10 flex items-center justify-center">
                              <p className="text-xs text-muted-foreground">
                                No claimed score provided
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Match Meta */}
                        <div className="flex items-center gap-4 pt-2 text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <IconCalendar className="size-3.5" />
                            <span>{formatTableDate(match.matchDate)}</span>
                          </div>
                          <Separator orientation="vertical" className="h-4" />
                          <Badge variant="outline" className="text-[10px] h-5">
                            {match.matchType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Evidence Section */}
                  {dispute.evidenceUrls && dispute.evidenceUrls.length > 0 && (
                    <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
                        <IconPhoto className="size-4 text-muted-foreground" />
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Evidence ({dispute.evidenceUrls.length})
                        </span>
                      </div>
                      <div className="p-3">
                        <div className="grid grid-cols-2 gap-2">
                          {dispute.evidenceUrls.map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border/50 bg-background hover:bg-primary/5 hover:border-primary/30 transition-all group"
                            >
                              <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                <IconExternalLink className="size-4 text-primary" />
                              </div>
                              <span className="text-sm font-medium text-primary group-hover:underline truncate">
                                Evidence {index + 1}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin Notes Section */}
                  {dispute.adminNotes && dispute.adminNotes.length > 0 && (
                    <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
                        <IconNotes className="size-4 text-muted-foreground" />
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Admin Notes ({dispute.adminNotes.length})
                        </span>
                      </div>
                      <div className="p-3 space-y-2">
                        {dispute.adminNotes.map((note) => (
                          <div
                            key={note.id}
                            className="p-3 bg-background rounded-lg border border-border/50"
                          >
                            {/* Compact header with avatar */}
                            <div className="flex items-start gap-2.5 mb-2">
                              <Avatar className="size-7 shrink-0 ring-1 ring-border">
                                <AvatarImage src={note.admin?.user?.image || undefined} />
                                <AvatarFallback className="text-[10px] bg-muted">
                                  {getInitials(note.admin?.user?.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium truncate">
                                    {note.admin?.user?.name || "Admin"}
                                  </span>
                                  {note.isInternalOnly && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] h-5 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
                                    >
                                      Internal
                                    </Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground ml-auto shrink-0">
                                    {formatDateTime(note.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-foreground/80 leading-relaxed pl-9">
                              {note.note}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timeline Section */}
                  <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
                      <IconClock className="size-4 text-muted-foreground" />
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Timeline
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="relative space-y-4">
                        <div className="absolute left-[7px] top-3 bottom-3 w-px bg-border" />

                        {/* Dispute Created */}
                        <div className="flex items-start gap-3 relative">
                          <div className="size-4 rounded-full bg-amber-500 border-2 border-background shadow-sm shrink-0 z-10" />
                          <div className="flex-1 min-w-0 -mt-0.5">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">Dispute Created</p>
                              {dispute.raisedByUser && (
                                <Avatar className="size-5 ring-1 ring-amber-200 dark:ring-amber-800">
                                  <AvatarImage src={dispute.raisedByUser.image || undefined} />
                                  <AvatarFallback className="text-[8px] bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                                    {getInitials(dispute.raisedByUser.name)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(dispute.submittedAt)}
                              {dispute.raisedByUser?.name && (
                                <span className="text-foreground/70"> by {dispute.raisedByUser.name}</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Under Review */}
                        {dispute.reviewedAt && (
                          <div className="flex items-start gap-3 relative">
                            <div className="size-4 rounded-full bg-blue-500 border-2 border-background shadow-sm shrink-0 z-10" />
                            <div className="flex-1 min-w-0 -mt-0.5">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">Under Review</p>
                                {dispute.reviewedByAdmin?.user && (
                                  <Avatar className="size-5 ring-1 ring-blue-200 dark:ring-blue-800">
                                    <AvatarImage src={dispute.reviewedByAdmin.user.image || undefined} />
                                    <AvatarFallback className="text-[8px] bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                      {getInitials(dispute.reviewedByAdmin.user.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatDateTime(dispute.reviewedAt)}
                                {dispute.reviewedByAdmin?.user?.name && (
                                  <span className="text-foreground/70"> by {dispute.reviewedByAdmin.user.name}</span>
                                )}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Resolved */}
                        {dispute.resolvedAt && (
                          <div className="flex items-start gap-3 relative">
                            <div className="size-4 rounded-full bg-emerald-500 border-2 border-background shadow-sm shrink-0 z-10" />
                            <div className="flex-1 min-w-0 -mt-0.5">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">Resolved</p>
                                {dispute.resolvedByAdmin?.user && (
                                  <Avatar className="size-5 ring-1 ring-emerald-200 dark:ring-emerald-800">
                                    <AvatarImage src={dispute.resolvedByAdmin.user.image || undefined} />
                                    <AvatarFallback className="text-[8px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                                      {getInitials(dispute.resolvedByAdmin.user.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatDateTime(dispute.resolvedAt)}
                                {dispute.resolvedByAdmin?.user?.name && (
                                  <span className="text-foreground/70"> by {dispute.resolvedByAdmin.user.name}</span>
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Resolution Section (if resolved) */}
                  {isResolved && dispute.resolutionAction && (
                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-100/50 dark:bg-emerald-900/30 border-b border-emerald-200 dark:border-emerald-800">
                        <IconCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          Resolution
                        </span>
                      </div>
                      <div className="p-3">
                        {/* Two-column grid: Left info, Right action */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Left: Resolved By */}
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                              Resolved By
                            </p>
                            <div className="flex items-center gap-2">
                              {dispute.resolvedByAdmin?.user ? (
                                <Avatar className="size-6 ring-1 ring-emerald-200 dark:ring-emerald-700 shrink-0">
                                  <AvatarImage src={dispute.resolvedByAdmin.user.image || undefined} />
                                  <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 font-medium text-[9px]">
                                    {getInitials(dispute.resolvedByAdmin.user.name)}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className="size-6 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
                                  <IconUser className="size-3 text-emerald-600 dark:text-emerald-400" />
                                </div>
                              )}
                              <span className="text-sm font-medium truncate">
                                {dispute.resolvedByAdmin?.user?.name || "Admin"}
                              </span>
                            </div>
                          </div>

                          {/* Right: Resolved Date */}
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                              Resolved On
                            </p>
                            <p className="text-sm">
                              {dispute.resolvedAt && formatDateTime(dispute.resolvedAt)}
                            </p>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-emerald-200/50 dark:border-emerald-800/50 my-3" />

                        {/* Action Taken */}
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                            Action Taken
                          </p>
                          <Badge
                            variant="outline"
                            className="bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-700 text-[10px]"
                          >
                            {getResolutionActionLabel(dispute.resolutionAction)}
                          </Badge>
                        </div>

                        {/* Reason (if exists) */}
                        {dispute.adminResolution && (
                          <>
                            <div className="border-t border-emerald-200/50 dark:border-emerald-800/50 my-3" />
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                Reason
                              </p>
                              <p className="text-sm leading-relaxed text-foreground/85">
                                {dispute.adminResolution}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center gap-3 px-6 py-4 border-t border-border/50 bg-muted/20 shrink-0">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onAddNote}
                >
                  <IconNotes className="size-4 mr-2" />
                  Add Note
                </Button>
                {!isResolved && (
                  <Button
                    className="flex-1"
                    onClick={() => setIsResolveMode(true)}
                  >
                    <IconGavel className="size-4 mr-2" />
                    Resolve Dispute
                  </Button>
                )}
              </div>
            </motion.div>
          ) : (
            // ==================== RESOLVE VIEW ====================
            <motion.div
              key="resolve"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col h-full max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 pt-5 pb-4 border-b border-border/50 shrink-0">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 shrink-0"
                    onClick={handleBack}
                  >
                    <IconArrowLeft className="size-5" />
                  </Button>
                  <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 border border-primary/20">
                    <IconGavel className="size-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-lg font-semibold">
                      Resolve Dispute
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      Review details and select a resolution action
                    </p>
                  </div>
                </div>
              </div>

              {/* Two-Column Content */}
              <div className="flex-1 overflow-hidden">
                <div className="grid md:grid-cols-2 h-full divide-x divide-border/50">
                  {/* LEFT COLUMN: Context */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="p-5 space-y-4 overflow-y-auto"
                  >
                    {/* Match Info */}
                    {match && (
                      <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
                          <IconTrophy className="size-4 text-muted-foreground" />
                          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Match Info
                          </span>
                        </div>
                        <div className="p-3 space-y-2.5">
                          {match.division && (
                            <div className="flex items-center gap-2 text-sm">
                              {match.division.season?.name && (
                                <>
                                  <span className="font-medium">
                                    {match.division.season.name}
                                  </span>
                                  <IconPoint className="size-2 text-muted-foreground/50" />
                                </>
                              )}
                              <span className="text-muted-foreground">
                                {match.division.name}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              <IconCalendar className="size-3.5" />
                              Match Date
                            </span>
                            <span className="font-medium">
                              {formatTableDate(match.matchDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Score Comparison */}
                    <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
                        <IconAlertTriangle className="size-4 text-muted-foreground" />
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Score Comparison
                        </span>
                      </div>
                      <div className="p-3 space-y-3">
                        {/* Participants */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {displayTeam1.slice(0, 2).map((p) => (
                                <Avatar
                                  key={p.id}
                                  className="size-7 border-2 border-background"
                                >
                                  <AvatarImage
                                    src={p.user?.image || undefined}
                                  />
                                  <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                    {getInitials(p.user?.name)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            <span className="text-xs font-medium truncate max-w-[80px]">
                              {team1Name}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            VS
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium truncate max-w-[80px]">
                              {team2Name}
                            </span>
                            <div className="flex -space-x-2">
                              {displayTeam2.slice(0, 2).map((p) => (
                                <Avatar
                                  key={p.id}
                                  className="size-7 border-2 border-background"
                                >
                                  <AvatarImage
                                    src={p.user?.image || undefined}
                                  />
                                  <AvatarFallback className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300">
                                    {getInitials(p.user?.name)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Score Cards */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2.5 rounded-lg bg-background border border-border/50">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                              Reported
                            </p>
                            <p className="text-xl font-bold font-mono">
                              {match?.team1Score ?? "—"}{" "}
                              <span className="text-muted-foreground/40">
                                -
                              </span>{" "}
                              {match?.team2Score ?? "—"}
                            </p>
                          </div>

                          {dispute.claimedScore ? (
                            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                              <p className="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
                                Claimed
                              </p>
                              <p className="text-xl font-bold font-mono text-amber-700 dark:text-amber-400">
                                {dispute.claimedScore.team1Score ?? "?"}{" "}
                                <span className="text-amber-400/40">-</span>{" "}
                                {dispute.claimedScore.team2Score ?? "?"}
                              </p>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-lg bg-muted/30 border border-dashed border-border/50 flex items-center justify-center">
                              <p className="text-[10px] text-muted-foreground">
                                No claim
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Evidence */}
                    {dispute.evidenceUrls &&
                      dispute.evidenceUrls.length > 0 && (
                        <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                          <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
                            <IconPhoto className="size-4 text-muted-foreground" />
                            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              Evidence ({dispute.evidenceUrls.length})
                            </span>
                          </div>
                          <div className="p-3">
                            <div className="flex flex-wrap gap-2">
                              {dispute.evidenceUrls.map((url, index) => (
                                <a
                                  key={index}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border/50 bg-background hover:bg-primary/5 hover:border-primary/30 transition-all text-xs font-medium text-primary"
                                >
                                  <IconExternalLink className="size-3" />
                                  Evidence {index + 1}
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Description */}
                    {dispute.description && (
                      <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
                          <IconUser className="size-4 text-muted-foreground" />
                          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Description
                          </span>
                        </div>
                        <div className="p-3">
                          <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                            {dispute.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* RIGHT COLUMN: Resolution Form */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15, duration: 0.3 }}
                    className="p-5 space-y-4 bg-muted/5 overflow-y-auto"
                  >
                    {/* Resolution Actions - 2 Column Grid */}
                    <div className="rounded-xl border border-border/50 bg-background overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
                        <IconGavel className="size-4 text-muted-foreground" />
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Resolution Action
                        </span>
                      </div>
                      <div className="p-3">
                        <RadioGroup
                          value={selectedAction || ""}
                          onValueChange={(val) =>
                            setSelectedAction(val as DisputeResolutionAction)
                          }
                          className="grid grid-cols-2 gap-2"
                        >
                          {RESOLUTION_ACTIONS.map((action) => {
                            const Icon = action.icon;
                            const isSelected = selectedAction === action.value;

                            return (
                              <div
                                key={action.value}
                                className={cn(
                                  "flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all",
                                  isSelected
                                    ? action.variant === "destructive"
                                      ? "border-destructive/50 bg-destructive/5"
                                      : action.variant === "warning"
                                      ? "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/30"
                                      : "border-primary bg-primary/5"
                                    : "border-border/50 hover:bg-muted/50"
                                )}
                                onClick={() => setSelectedAction(action.value)}
                              >
                                <RadioGroupItem
                                  value={action.value}
                                  id={`resolve-${action.value}`}
                                  className="shrink-0 size-3.5"
                                />
                                <div
                                  className={cn(
                                    "size-6 rounded-md flex items-center justify-center shrink-0",
                                    isSelected
                                      ? action.variant === "destructive"
                                        ? "bg-destructive/10 text-destructive"
                                        : action.variant === "warning"
                                        ? "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400"
                                        : "bg-primary/10 text-primary"
                                      : "bg-muted/50 text-muted-foreground"
                                  )}
                                >
                                  <Icon className="size-3.5" />
                                </div>
                                <Label
                                  htmlFor={`resolve-${action.value}`}
                                  className="text-xs font-medium cursor-pointer truncate"
                                >
                                  {action.label}
                                </Label>
                              </div>
                            );
                          })}
                        </RadioGroup>
                      </div>
                    </div>

                    {/* Score Input (conditional) */}
                    <AnimatePresence>
                      {requiresScore && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="rounded-xl border border-border/50 bg-background overflow-hidden">
                            <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
                              <IconEdit className="size-4 text-muted-foreground" />
                              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Final Score
                              </span>
                            </div>
                            <div className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 space-y-1">
                                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                    {team1Name}
                                  </Label>
                                  <Input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={team1Score}
                                    onChange={(e) => {
                                      const val = e.target.value
                                        .replace(/[^0-9]/g, "")
                                        .slice(0, 2);
                                      setTeam1Score(val);
                                    }}
                                    onBlur={() => {
                                      if (team1Score === "") setTeam1Score("0");
                                    }}
                                    className="h-10 text-center text-xl font-bold font-mono"
                                  />
                                </div>
                                <span className="text-xl text-muted-foreground/50 pt-5">
                                  -
                                </span>
                                <div className="flex-1 space-y-1">
                                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                    {team2Name}
                                  </Label>
                                  <Input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={team2Score}
                                    onChange={(e) => {
                                      const val = e.target.value
                                        .replace(/[^0-9]/g, "")
                                        .slice(0, 2);
                                      setTeam2Score(val);
                                    }}
                                    onBlur={() => {
                                      if (team2Score === "") setTeam2Score("0");
                                    }}
                                    className="h-10 text-center text-xl font-bold font-mono"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Resolution Reason */}
                    <div className="rounded-xl border border-border/50 bg-background overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
                        <IconNotes className="size-4 text-muted-foreground" />
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Resolution Reason
                        </span>
                        <span className="text-destructive text-xs">*</span>
                      </div>
                      <div className="p-3">
                        <Textarea
                          placeholder="Explain the reasoning behind this resolution..."
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="min-h-[80px] resize-none text-sm"
                        />
                        <p className="text-[10px] text-muted-foreground mt-2">
                          Recorded in audit log and visible to players
                        </p>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="rounded-xl border border-border/50 bg-background overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
                        <IconSettings className="size-4 text-muted-foreground" />
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Options
                        </span>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-2.5 p-2 rounded-lg border border-border/50 bg-muted/20">
                          <Checkbox
                            id="notify-players-resolve"
                            checked={notifyPlayers}
                            onCheckedChange={(checked) =>
                              setNotifyPlayers(checked as boolean)
                            }
                          />
                          <Label
                            htmlFor="notify-players-resolve"
                            className="text-sm cursor-pointer"
                          >
                            Notify all match participants
                          </Label>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/20 shrink-0">
                <Button variant="ghost" onClick={handleBack}>
                  <IconArrowLeft className="size-4 mr-2" />
                  Back to Details
                </Button>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleClose(false)}
                    disabled={resolveDispute.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleResolveSubmit}
                    disabled={
                      resolveDispute.isPending ||
                      !selectedAction ||
                      !reason.trim()
                    }
                    className="min-w-[130px]"
                  >
                    {resolveDispute.isPending ? (
                      <>
                        <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resolving...
                      </>
                    ) : (
                      <>
                        <IconGavel className="mr-2 h-4 w-4" />
                        Resolve
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
