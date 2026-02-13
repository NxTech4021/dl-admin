"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  IconLoader2,
  IconUsers,
  IconUser,
  IconTarget,
  IconChartBar,
  IconArrowRight,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { Membership } from "@/constants/zod/season-schema";
import { Division } from "@/constants/zod/division-schema";
import { toast } from "sonner";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/api-error";
import { ConfirmationModal } from "@/components/modal/confirmation-modal";
import { cn } from "@/lib/utils";

interface AssignDivisionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  member: Membership | null;
  teamMembers?: Membership[] | null;
  batchMembers?: Membership[];
  divisions: Division[];
  seasonId: string;
  adminId: string;
  onAssigned?: () => Promise<void>;
  getSportRating?: (member: Membership) => {
    display: string;
    value: number;
    color: string;
  };
  gameType?: "SINGLES" | "DOUBLES" | null;
}

/** Get rating badge styling based on value */
const getRatingBadgeClass = (rating: number) => {
  if (rating >= 4500) return "text-violet-700 bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800";
  if (rating >= 4000) return "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800";
  if (rating >= 3500) return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
  if (rating >= 3000) return "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
  return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700";
};

/** Get initials from name */
const getInitials = (name: string | null | undefined): string => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/** Get consistent avatar background color */
const getAvatarColor = (name: string | null | undefined): string => {
  const colors = [
    "bg-slate-600",
    "bg-emerald-600",
    "bg-sky-600",
    "bg-violet-600",
    "bg-amber-600",
    "bg-rose-600",
    "bg-teal-600",
    "bg-indigo-600",
  ];
  if (!name) return colors[0];
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export default function AssignDivisionModal({
  isOpen,
  onOpenChange,
  member,
  teamMembers,
  batchMembers,
  divisions,
  seasonId,
  onAssigned,
  adminId,
  getSportRating,
  gameType,
}: AssignDivisionModalProps) {
  const isBatchMode = batchMembers && batchMembers.length > 0;
  const isTeam = teamMembers && teamMembers.length > 0;
  const [selectedDivisionId, setSelectedDivisionId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [showThresholdConfirm, setShowThresholdConfirm] = useState(false);
  const [pendingAssignment, setPendingAssignment] = useState<(() => void) | null>(null);

  // Reset selected division when modal opens with new member
  useEffect(() => {
    if (isOpen) {
      const currentDivision = isBatchMode 
        ? "" 
        : member?.divisionId || teamMembers?.[0]?.divisionId || "";
      setSelectedDivisionId(currentDivision);
    }
  }, [isOpen, member, teamMembers, isBatchMode]);

  const getDivisionName = (divisionId: string | null) => {
    if (!divisionId) return "Unassigned";
    const division = divisions.find((d) => d.id === divisionId);
    return division ? division.name : "Unassigned";
  };

  const getSelectedDivision = () => {
    return divisions.find((d) => d.id === selectedDivisionId);
  };

  const currentDivisionId = member?.divisionId || teamMembers?.[0]?.divisionId || teamMembers?.[1]?.divisionId || null;
  const isReassignment = Boolean(currentDivisionId);

  // Check if any player's rating exceeds the division threshold
  const checkRatingThreshold = () => {
    const selectedDivision = getSelectedDivision();
    if (!selectedDivision?.threshold || !getSportRating) {
      return false;
    }

    const threshold = selectedDivision.threshold;

    if (isBatchMode && batchMembers) {
      return batchMembers.some((batchMember) => {
        const rating = getSportRating(batchMember);
        return rating.value > threshold;
      });
    } else if (isTeam && teamMembers) {
      return teamMembers.some((teamMember) => {
        const rating = getSportRating(teamMember);
        return rating.value > threshold;
      });
    } else if (member) {
      const rating = getSportRating(member);
      return rating.value > threshold;
    }

    return false;
  };

  const performAssignment = async (overrideThreshold: boolean = false) => {
    if (!selectedDivisionId) {
      toast.error("Please select a division");
      return;
    }

    if (!isBatchMode && !member) {
      toast.error("No player selected");
      return;
    }

    setIsAssigning(true);
    try {
      if (isBatchMode && batchMembers) {
        // Batch assignment - send array of user IDs
        const userIds = batchMembers.map((m) => m.userId).filter((id): id is string => !!id);
        
        await axiosInstance.post(endpoints.division.assignPlayer, {
          userIds: userIds,
          divisionId: selectedDivisionId,
          seasonId,
          assignedBy: adminId,
          overrideThreshold: overrideThreshold,
        });

        toast.success(`${userIds.length} player${userIds.length > 1 ? 's' : ''} assigned to division successfully!`);
      } else if (isTeam && teamMembers) {
        // Team assignment - send array of user IDs
        const userIds = teamMembers.map((m) => m.userId).filter((id): id is string => !!id);
        
        await axiosInstance.post(endpoints.division.assignPlayer, {
          userIds: userIds,
          divisionId: selectedDivisionId,
          seasonId,
          assignedBy: adminId,
          overrideThreshold: overrideThreshold,
        });

        toast.success("Team assigned to division successfully!");
      } else if (member) {
        // Single player assignment - send single user ID in array
        await axiosInstance.post(endpoints.division.assignPlayer, {
          userIds: [member.userId],
          divisionId: selectedDivisionId,
          seasonId,
          assignedBy: adminId,
          overrideThreshold: overrideThreshold,
        });

        toast.success("Player assigned to division successfully!");
      }

      onOpenChange(false);

      if (onAssigned) {
        await onAssigned();
      }
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(error, `Failed to assign ${isBatchMode ? 'players' : isTeam ? "team" : "player"} to division`)
      );
    } finally {
      setIsAssigning(false);
      setPendingAssignment(null);
    }
  };

  const handleAssignSubmit = async () => {
    if (!selectedDivisionId) {
      toast.error("Please select a division");
      return;
    }

    if (!isBatchMode && !member) {
      toast.error("No player selected");
      return;
    }

    if (checkRatingThreshold()) {
      setPendingAssignment(() => () => performAssignment(true));
      setShowThresholdConfirm(true);
      return;
    }

    await performAssignment(false);
  };

  const handleConfirmThreshold = () => {
    setShowThresholdConfirm(false);
    if (pendingAssignment) {
      pendingAssignment();
    }
  };

  // Get player(s) to display
  const displayMembers = isBatchMode && batchMembers 
    ? batchMembers 
    : isTeam && teamMembers 
      ? teamMembers 
      : member 
        ? [member] 
        : [];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="bg-muted/30 border-b border-border/50">
          <DialogHeader className="px-5 pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center justify-center size-10 rounded-xl",
                isReassignment
                  ? "bg-amber-100 dark:bg-amber-900/30"
                  : "bg-primary/10"
              )}>
                {isBatchMode || isTeam ? (
                  <IconUsers className={cn(
                    "size-5",
                    isReassignment ? "text-amber-600 dark:text-amber-400" : "text-primary"
                  )} />
                ) : (
                  <IconUser className={cn(
                    "size-5",
                    isReassignment ? "text-amber-600 dark:text-amber-400" : "text-primary"
                  )} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-base font-semibold">
                  {isBatchMode
                    ? "Assign Players to Division"
                    : isReassignment
                      ? isTeam ? "Reassign Team" : "Reassign Player"
                      : isTeam ? "Assign Team to Division" : "Assign to Division"}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {isBatchMode
                    ? `Assign ${displayMembers.length} players to a division`
                    : isReassignment
                      ? "Select a new division for this assignment"
                      : "Select a division to assign"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Player(s) Card */}
          <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
              {isBatchMode || isTeam ? (
                <IconUsers className="size-3.5 text-muted-foreground" />
              ) : (
                <IconUser className="size-3.5 text-muted-foreground" />
              )}
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {isBatchMode ? `${displayMembers.length} Players` : isTeam ? "Team Members" : "Player"}
              </span>
            </div>
            <div className="p-3 space-y-2 max-h-[240px] overflow-y-auto">
              {displayMembers.map((teamMember) => {
                const rating = getSportRating ? getSportRating(teamMember) : null;
                return (
                  <div
                    key={teamMember.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="size-9 ring-2 ring-background">
                        <AvatarImage src={teamMember.user?.image || undefined} />
                        <AvatarFallback className={`text-white font-semibold text-xs ${getAvatarColor(teamMember.user?.name)}`}>
                          {getInitials(teamMember.user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {teamMember.user?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          @{teamMember.user?.username || teamMember.user?.email?.split("@")[0] || "unknown"}
                        </p>
                      </div>
                    </div>
                    {rating && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-mono border shrink-0",
                          rating.value > 0 ? getRatingBadgeClass(rating.value) : "text-muted-foreground"
                        )}
                      >
                        <IconChartBar className="size-3 mr-1" />
                        {rating.display}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Division (if reassigning) */}
          {isReassignment && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/30 border border-border/50">
              <IconTarget className="size-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground">Current:</span>
              <Badge variant="outline" className="text-xs font-normal">
                {getDivisionName(currentDivisionId)}
              </Badge>
            </div>
          )}

          {/* Division Select */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <IconTarget className="size-3.5" />
              {isReassignment ? "New Division" : "Division"}
              <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedDivisionId}
              onValueChange={setSelectedDivisionId}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select a division" />
              </SelectTrigger>
              <SelectContent>
                {divisions.map((division) => {
                  const hasThreshold = division.threshold !== null && division.threshold !== undefined;
                  return (
                    <SelectItem key={division.id} value={division.id}>
                      <div className="flex items-center gap-2">
                        <span>{division.name}</span>
                        {hasThreshold && (
                          <span className="text-xs text-muted-foreground">
                            (max: {division.threshold})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Threshold Warning */}
          {selectedDivisionId && checkRatingThreshold() && (
            <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <IconAlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Rating exceeds threshold
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {isBatchMode
                    ? "One or more players have"
                    : isTeam ? "One or more team members have" : "This player has"} a rating above the division threshold of {getSelectedDivision()?.threshold}. You can still proceed.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-muted/20 border-t border-border/50 px-5 py-4">
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isAssigning}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignSubmit}
              disabled={isAssigning || !selectedDivisionId}
              className={cn(
                "gap-2 min-w-[120px]",
                isReassignment && "bg-amber-600 hover:bg-amber-700 text-white"
              )}
            >
              {isAssigning ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" />
                  {isReassignment ? "Reassigning..." : "Assigning..."}
                </>
              ) : (
                <>
                  {isReassignment ? "Reassign" : "Assign"}
                  <IconArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Rating Threshold Confirmation Modal */}
      <ConfirmationModal
        open={showThresholdConfirm}
        onOpenChange={setShowThresholdConfirm}
        title="Rating Exceeds Division Threshold"
        description={
          <div className="space-y-3">
            <p>
              {isBatchMode
                ? `One or more players have ratings that exceed the division threshold of ${
                    getSelectedDivision()?.threshold || 0
                  } points.`
                : isTeam
                ? `One or more team members have ratings that exceed the division threshold of ${
                    getSelectedDivision()?.threshold || 0
                  } points.`
                : `This player's rating exceeds the division threshold of ${
                    getSelectedDivision()?.threshold || 0
                  } points.`}
            </p>
            {getSportRating && (
              <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Current Ratings
                </p>
                {displayMembers.map((teamMember) => {
                  const rating = getSportRating(teamMember);
                  const exceedsThreshold = rating.value > (getSelectedDivision()?.threshold || 0);
                  return (
                    <div key={teamMember.id} className="flex items-center justify-between text-sm">
                      <span>{teamMember.user?.name || "Unknown"}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-mono",
                          exceedsThreshold
                            ? "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
                            : ""
                        )}
                      >
                        {rating.display}
                      </Badge>
                    </div>
                  );
                })}
                <div className="pt-2 mt-2 border-t border-border/50 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Division Threshold</span>
                  <span className="font-medium">{getSelectedDivision()?.threshold || 0}</span>
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Do you want to proceed with this assignment?
            </p>
          </div>
        }
        confirmText="Proceed Anyway"
        cancelText="Cancel"
        onConfirm={handleConfirmThreshold}
        variant="default"
      />
    </Dialog>
  );
}
