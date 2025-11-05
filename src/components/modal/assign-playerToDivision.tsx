"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { IconLoader2 } from '@tabler/icons-react';
import { Membership } from '@/ZodSchema/season-schema';
import { Division } from '@/ZodSchema/division-schema';
import { toast } from 'sonner';
import axiosInstance, { endpoints } from '@/lib/endpoints';
import { ConfirmationModal } from '@/components/modal/confirmation-modal';

interface AssignDivisionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  member: Membership | null;
  teamMembers?: Membership[] | null;
  divisions: Division[];
  seasonId: string;
  adminId: string;
  onAssigned?: () => Promise<void>;
  getSportRating?: (member: Membership) => { display: string; value: number; color: string };
  gameType?: "SINGLES" | "DOUBLES" | null;
}

export default function AssignDivisionModal({
  isOpen,
  onOpenChange,
  member,
  teamMembers,
  divisions,
  seasonId,
  onAssigned,
  adminId,
  getSportRating,
  gameType
}: AssignDivisionModalProps) {
  const isTeam = teamMembers && teamMembers.length > 0;
  const [selectedDivisionId, setSelectedDivisionId] = useState(
    member?.divisionId || teamMembers?.[0]?.divisionId || ''
  );
  const [isAssigning, setIsAssigning] = useState(false);
  const [showThresholdConfirm, setShowThresholdConfirm] = useState(false);
  const [pendingAssignment, setPendingAssignment] = useState<(() => void) | null>(null);

  const getDivisionName = (divisionId: string | null) => {
    if (!divisionId) return 'Unassigned';
    const division = divisions.find(d => d.id === divisionId);
    return division ? division.name : 'Unassigned';
  };

  const getSelectedDivision = () => {
    return divisions.find(d => d.id === selectedDivisionId);
  };

  // Check if any player's rating exceeds the division threshold
  const checkRatingThreshold = () => {
    const selectedDivision = getSelectedDivision();
    if (!selectedDivision?.threshold || !getSportRating) {
      return false; // No threshold or no rating function, proceed normally
    }

    const threshold = selectedDivision.threshold;

    if (isTeam && teamMembers) {
      // Check if any team member exceeds threshold
      return teamMembers.some(teamMember => {
        const rating = getSportRating(teamMember);
        return rating.value > threshold;
      });
    } else if (member) {
      // Check if single member exceeds threshold
      const rating = getSportRating(member);
      return rating.value > threshold;
    }

    return false;
  };

  const performAssignment = async (overrideThreshold: boolean = false) => {
    if (!member || !selectedDivisionId) {
      toast.error('Please select a division');
      return;
    }

    setIsAssigning(true);
    try {
      if (isTeam && teamMembers) {
        // Assign both players to the same division
        const assignments = await Promise.all(
          teamMembers.map((teamMember) =>
            axiosInstance.post(endpoints.division.assignPlayer, {
              userId: teamMember.userId,
              divisionId: selectedDivisionId,
              seasonId,
              assignedBy: adminId,
              overrideThreshold: overrideThreshold,
            })
          )
        );

        toast.success(
          `Team assigned to division successfully! Both players have been assigned.`
        );
      } else {
        // Individual assignment
        await axiosInstance.post(endpoints.division.assignPlayer, {
          userId: member.userId,
          divisionId: selectedDivisionId,
          seasonId,
          assignedBy: adminId,
          overrideThreshold: overrideThreshold,
        });

        toast.success('Player assigned to division successfully!');
      }

      onOpenChange(false);

      if (onAssigned) {
        await onAssigned();
      }
    } catch (error: any) {
      console.error('Error assigning player(s) to division:', error);
      console.log(error.response?.data.error);
      toast.error(
        error.response?.data?.error ||
          `Failed to assign ${isTeam ? 'team' : 'player'} to division`
      );
    } finally {
      setIsAssigning(false);
      setPendingAssignment(null);
    }
  };

  const handleAssignSubmit = async () => {
    if (!member || !selectedDivisionId) {
      toast.error('Please select a division');
      return;
    }

    // Check if rating exceeds threshold
    if (checkRatingThreshold()) {
      const selectedDivision = getSelectedDivision();
      const threshold = selectedDivision?.threshold || 0;
      
      // Get player ratings for display
      let playerRatings: string[] = [];
      if (isTeam && teamMembers) {
        teamMembers.forEach(teamMember => {
          if (getSportRating) {
            const rating = getSportRating(teamMember);
            playerRatings.push(`${teamMember.user?.name || 'Unknown'}: ${rating.display}`);
          }
        });
      } else if (member && getSportRating) {
        const rating = getSportRating(member);
        playerRatings.push(`${member.user?.name || 'Unknown'}: ${rating.display}`);
      }

      setPendingAssignment(() => () => performAssignment(true));
      setShowThresholdConfirm(true);
      return;
    }

    // No threshold exceeded, proceed with assignment (no override needed)
    await performAssignment(false);
  };

  const handleConfirmThreshold = () => {
    setShowThresholdConfirm(false);
    if (pendingAssignment) {
      pendingAssignment();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isTeam ? 'Assign Team to Division' : 'Assign Player to Division'}
          </DialogTitle>
          <DialogDescription>
            {isTeam && teamMembers ? (
              <>
                Select a division for{' '}
                {teamMembers
                  .map((m) => m.user?.name || 'Unknown')
                  .join(' & ')}
                .
              </>
            ) : (
              <>Select a division for {member?.user?.name || 'this player'}.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {isTeam && teamMembers && (
            <div className="space-y-2">
              <Label>Team Members</Label>
              <div className="space-y-1">
                {teamMembers.map((teamMember) => (
                  <div
                    key={teamMember.id}
                    className="text-sm p-2 bg-muted rounded-md"
                  >
                    <div className="font-medium">
                      {teamMember.user?.name || 'Unknown'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      @{teamMember.user?.email?.split('@')[0] || 'unknown'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="division">Division</Label>
            <Select
              value={selectedDivisionId}
              onValueChange={setSelectedDivisionId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a division" />
              </SelectTrigger>
              <SelectContent>
                {divisions.map((division) => (
                  <SelectItem key={division.id} value={division.id}>
                    {division.threshold !== null && division.threshold !== undefined
                      ? `${division.name} (Threshold: ${division.threshold})`
                      : division.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(member?.divisionId ||
            teamMembers?.[0]?.divisionId ||
            teamMembers?.[1]?.divisionId) && (
            <div className="text-sm text-muted-foreground">
              Current division:{' '}
              {getDivisionName(
                member?.divisionId ||
                  teamMembers?.[0]?.divisionId ||
                  teamMembers?.[1]?.divisionId ||
                  null
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isAssigning}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssignSubmit}
            disabled={isAssigning || !selectedDivisionId}
          >
            {isAssigning ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : isTeam ? (
              'Assign Team'
            ) : (
              'Assign Player'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Rating Threshold Confirmation Modal */}
      <ConfirmationModal
        open={showThresholdConfirm}
        onOpenChange={setShowThresholdConfirm}
        title="Rating Exceeds Division Threshold"
        description={
          <div className="space-y-2">
            <p>
              {isTeam
                ? `One or more team members have ratings that exceed the division threshold of ${getSelectedDivision()?.threshold || 0} points.`
                : `This player's rating exceeds the division threshold of ${getSelectedDivision()?.threshold || 0} points.`}
            </p>
            {getSportRating && (
              <div className="mt-3 space-y-1">
                <p className="font-medium text-sm">Current Ratings:</p>
                {isTeam && teamMembers ? (
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {teamMembers.map(teamMember => {
                      const rating = getSportRating(teamMember);
                      return (
                        <li key={teamMember.id}>
                          {teamMember.user?.name || 'Unknown'}: {rating.display} points
                        </li>
                      );
                    })}
                  </ul>
                ) : member ? (
                  <p className="text-sm text-muted-foreground">
                    {member.user?.name || 'Unknown'}: {getSportRating(member).display} points
                  </p>
                ) : null}
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-2">
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
