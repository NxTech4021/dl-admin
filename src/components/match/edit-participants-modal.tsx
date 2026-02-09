"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Match } from "@/constants/zod/match-schema";
import {
  useEditMatchParticipants,
  useAvailablePlayers,
  useValidateParticipants,
  ParticipantInput,
} from "@/hooks/queries";
import {
  IconUsers,
  IconLoader2,
  IconPlus,
  IconX,
  IconAlertTriangle,
  IconSearch,
} from "@tabler/icons-react";
import { toast } from "sonner";

interface EditParticipantsModalProps {
  match: Match | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type ParticipantRole = "CREATOR" | "OPPONENT" | "PARTNER" | "INVITED";

interface EditableParticipant {
  id: string;
  userId: string;
  team: "team1" | "team2" | null;
  role: ParticipantRole;
  user: {
    id: string;
    name: string;
    username?: string | null;
    image?: string | null;
  } | null;
}

export function EditParticipantsModal({
  match,
  open,
  onOpenChange,
  onSuccess,
}: EditParticipantsModalProps) {
  const [participants, setParticipants] = useState<EditableParticipant[]>([]);
  const [reason, setReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPlayerPicker, setShowPlayerPicker] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<"team1" | "team2">("team1");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  const editParticipants = useEditMatchParticipants();
  const validateParticipants = useValidateParticipants();

  const { data: availablePlayers, isLoading: isLoadingPlayers } = useAvailablePlayers(
    match?.divisionId ?? undefined,
    match?.id,
    searchQuery
  );

  // Initialize form with existing participants
  useEffect(() => {
    if (match && open) {
      setParticipants(
        match.participants.map((p) => ({
          id: p.id,
          userId: p.userId,
          team: p.team as "team1" | "team2" | null,
          role: p.role as ParticipantRole,
          user: p.user,
        }))
      );
      setReason("");
      setValidationErrors([]);
      setValidationWarnings([]);
      setShowPlayerPicker(false);
    }
  }, [match, open]);

  // Group participants by team
  const team1Participants = useMemo(
    () => participants.filter((p) => p.team === "team1"),
    [participants]
  );
  const team2Participants = useMemo(
    () => participants.filter((p) => p.team === "team2"),
    [participants]
  );

  // Filter out already selected players from available list
  const filteredAvailablePlayers = useMemo(() => {
    if (!availablePlayers) return [];
    const selectedUserIds = new Set(participants.map((p) => p.userId));
    return availablePlayers.filter((p) => !selectedUserIds.has(p.id));
  }, [availablePlayers, participants]);

  const handleAddPlayer = (player: {
    id: string;
    name: string;
    username: string;
    image: string | null;
  }) => {
    const newParticipant: EditableParticipant = {
      id: `new-${Date.now()}`,
      userId: player.id,
      team: selectedTeam,
      role: selectedTeam === "team1" ? "PARTNER" : "OPPONENT",
      user: player,
    };
    setParticipants([...participants, newParticipant]);
    setShowPlayerPicker(false);
    setSearchQuery("");
  };

  const handleRemoveParticipant = (userId: string) => {
    setParticipants(participants.filter((p) => p.userId !== userId));
  };

  const handleChangeTeam = (userId: string, newTeam: "team1" | "team2") => {
    setParticipants(
      participants.map((p) =>
        p.userId === userId ? { ...p, team: newTeam } : p
      )
    );
  };

  const handleChangeRole = (userId: string, newRole: ParticipantRole) => {
    setParticipants(
      participants.map((p) =>
        p.userId === userId ? { ...p, role: newRole } : p
      )
    );
  };

  const handleValidate = async () => {
    if (!match) return;

    const input: ParticipantInput[] = participants.map((p) => ({
      userId: p.userId,
      team: p.team,
      role: p.role,
    }));

    try {
      const result = await validateParticipants.mutateAsync({
        matchId: match.id,
        participants: input,
      });
      setValidationErrors(result.errors);
      setValidationWarnings(result.warnings);
      return result.isValid;
    } catch {
      toast.error("Failed to validate participants");
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!match || !reason.trim()) return;

    // Validate first
    const isValid = await handleValidate();
    if (!isValid) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    const input: ParticipantInput[] = participants.map((p) => ({
      userId: p.userId,
      team: p.team,
      role: p.role,
    }));

    try {
      await editParticipants.mutateAsync({
        matchId: match.id,
        participants: input,
        reason: reason.trim(),
      });
      toast.success("Match participants updated successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("Failed to update match participants");
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setReason("");
      setValidationErrors([]);
      setValidationWarnings([]);
      setShowPlayerPicker(false);
    }
    onOpenChange(isOpen);
  };

  if (!match) return null;

  const isCompleted = match.status === "COMPLETED";
  const expectedCount = match.matchType === "SINGLES" ? 2 : 4;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <IconUsers className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Edit Match Participants</DialogTitle>
          </div>
          <DialogDescription>
            {isCompleted
              ? "Warning: Editing participants for a completed match will trigger rating and standings recalculation."
              : "Update the participants for this match."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Warnings */}
          {isCompleted && (
            <Alert variant="destructive">
              <IconAlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This match is completed. Changes will recalculate ratings and standings for all affected players.
              </AlertDescription>
            </Alert>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <IconAlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc pl-4 space-y-1">
                  {validationErrors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Validation Warnings */}
          {validationWarnings.length > 0 && (
            <Alert>
              <IconAlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc pl-4 space-y-1">
                  {validationWarnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Teams */}
          <div className="grid grid-cols-2 gap-4">
            {/* Team 1 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Team 1</Label>
                <Badge variant="outline">{team1Participants.length} players</Badge>
              </div>
              <div className="space-y-2 min-h-[100px] p-3 border rounded-lg bg-muted/30">
                {team1Participants.map((p) => (
                  <ParticipantCard
                    key={p.userId}
                    participant={p}
                    onRemove={() => handleRemoveParticipant(p.userId)}
                    onChangeRole={(role) => handleChangeRole(p.userId, role)}
                    onChangeTeam={(team) => handleChangeTeam(p.userId, team)}
                  />
                ))}
                {team1Participants.length < (match.matchType === "SINGLES" ? 1 : 2) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedTeam("team1");
                      setShowPlayerPicker(true);
                    }}
                  >
                    <IconPlus className="h-4 w-4 mr-1" />
                    Add Player
                  </Button>
                )}
              </div>
            </div>

            {/* Team 2 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Team 2</Label>
                <Badge variant="outline">{team2Participants.length} players</Badge>
              </div>
              <div className="space-y-2 min-h-[100px] p-3 border rounded-lg bg-muted/30">
                {team2Participants.map((p) => (
                  <ParticipantCard
                    key={p.userId}
                    participant={p}
                    onRemove={() => handleRemoveParticipant(p.userId)}
                    onChangeRole={(role) => handleChangeRole(p.userId, role)}
                    onChangeTeam={(team) => handleChangeTeam(p.userId, team)}
                  />
                ))}
                {team2Participants.length < (match.matchType === "SINGLES" ? 1 : 2) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedTeam("team2");
                      setShowPlayerPicker(true);
                    }}
                  >
                    <IconPlus className="h-4 w-4 mr-1" />
                    Add Player
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Player Picker */}
          {showPlayerPicker && (
            <div className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <Label>Select Player for {selectedTeam === "team1" ? "Team 1" : "Team 2"}</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPlayerPicker(false)}
                >
                  <IconX className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {isLoadingPlayers ? (
                  <div className="flex items-center justify-center py-4">
                    <IconLoader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : filteredAvailablePlayers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No available players found
                  </p>
                ) : (
                  filteredAvailablePlayers.map((player) => (
                    <button
                      key={player.id}
                      className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
                      onClick={() => handleAddPlayer(player)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={player.image ?? undefined} />
                        <AvatarFallback>
                          {player.name?.charAt(0) || player.username?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">{player.name || player.username}</p>
                        {player.rating && (
                          <p className="text-xs text-muted-foreground">
                            Rating: {player.rating}
                          </p>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="text-sm text-muted-foreground">
            {participants.length} of {expectedCount} participants assigned
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for edit *</Label>
            <Textarea
              id="reason"
              placeholder="Enter the reason for editing participants..."
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
            onClick={() => handleValidate()}
            disabled={validateParticipants.isPending}
          >
            {validateParticipants.isPending ? (
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Validate
          </Button>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={editParticipants.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={editParticipants.isPending || !reason.trim()}
          >
            {editParticipants.isPending ? (
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

// Participant Card Component
function ParticipantCard({
  participant,
  onRemove,
  onChangeRole,
  onChangeTeam,
}: {
  participant: EditableParticipant;
  onRemove: () => void;
  onChangeRole: (role: ParticipantRole) => void;
  onChangeTeam: (team: "team1" | "team2") => void;
}) {
  return (
    <div className="flex items-center gap-2 p-2 bg-background rounded-md border">
      <Avatar className="h-8 w-8">
        <AvatarImage src={participant.user?.image ?? undefined} />
        <AvatarFallback>
          {participant.user?.name?.charAt(0) ||
            participant.user?.username?.charAt(0) ||
            "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {participant.user?.name || participant.user?.username || "Unknown"}
        </p>
        <div className="flex items-center gap-1">
          <Select
            value={participant.role}
            onValueChange={(value) => onChangeRole(value as ParticipantRole)}
          >
            <SelectTrigger className="h-6 text-xs w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CREATOR">Creator</SelectItem>
              <SelectItem value="OPPONENT">Opponent</SelectItem>
              <SelectItem value="PARTNER">Partner</SelectItem>
              <SelectItem value="INVITED">Invited</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <IconX className="h-4 w-4" />
      </Button>
    </div>
  );
}
