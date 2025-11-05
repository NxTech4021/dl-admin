"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { IconLoader2 } from '@tabler/icons-react';
import { Membership } from '@/ZodSchema/season-schema';
import { toast } from 'sonner';
import axiosInstance, { endpoints } from '@/lib/endpoints';

interface AssignDivisionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  member: Membership | null;
  teamMembers?: Membership[] | null;
  divisions: { id: string; name: string }[];
  seasonId: string;
  adminId: string;
  onAssigned?: () => Promise<void>;
}

export default function AssignDivisionModal({
  isOpen,
  onOpenChange,
  member,
  teamMembers,
  divisions,
  seasonId,
  onAssigned,
  adminId
}: AssignDivisionModalProps) {
  const isTeam = teamMembers && teamMembers.length > 0;
  const [selectedDivisionId, setSelectedDivisionId] = useState(
    member?.divisionId || teamMembers?.[0]?.divisionId || ''
  );
  const [isAssigning, setIsAssigning] = useState(false);

  const getDivisionName = (divisionId: string | null) => {
    if (!divisionId) return 'Unassigned';
    const division = divisions.find(d => d.id === divisionId);
    return division ? division.name : 'Unassigned';
  };

  const handleAssignSubmit = async () => {
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
                    {division.name}
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
    </Dialog>
  );
}
