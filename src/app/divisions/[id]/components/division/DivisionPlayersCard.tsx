"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Division } from "@/constants/zod/division-schema";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { toast } from "sonner";
import {
  IconUsers,
  IconUserPlus,
  IconUserMinus,
  IconSearch,
  IconRefresh,
} from "@tabler/icons-react";

interface DivisionPlayer {
  id: string;
  odUserId?: string;
  name: string;
  email: string;
  rating?: number;
  wins?: number;
  losses?: number;
  matchesPlayed?: number;
  joinedAt?: string;
}

interface AvailablePlayer {
  id: string;
  name: string;
  email: string;
  rating?: number;
}

interface DivisionPlayersCardProps {
  divisionId: string;
  players: DivisionPlayer[];
  isLoading: boolean;
  division: Division;
  onPlayersUpdated: () => Promise<void>;
}

export default function DivisionPlayersCard({
  divisionId,
  players,
  isLoading,
  division,
  onPlayersUpdated,
}: DivisionPlayersCardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState<AvailablePlayer[]>([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [playerToRemove, setPlayerToRemove] = useState<DivisionPlayer | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [availableSearchTerm, setAvailableSearchTerm] = useState("");

  const filteredPlayers = players.filter(
    (player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailablePlayers = availablePlayers.filter(
    (player) =>
      player.name.toLowerCase().includes(availableSearchTerm.toLowerCase()) ||
      player.email.toLowerCase().includes(availableSearchTerm.toLowerCase())
  );

  const fetchAvailablePlayers = useCallback(async () => {
    setIsLoadingAvailable(true);
    try {
      const response = await axiosInstance.get(
        endpoints.admin.divisions.availablePlayers(divisionId)
      );
      const playersData = response.data?.data || response.data || [];
      setAvailablePlayers(
        Array.isArray(playersData)
          ? playersData.map((p: any) => ({
              id: p.id,
              name: p.name || "Unknown",
              email: p.email || "",
              rating: p.rating,
            }))
          : []
      );
    } catch (error) {
      console.error("Failed to fetch available players:", error);
      setAvailablePlayers([]);
    } finally {
      setIsLoadingAvailable(false);
    }
  }, [divisionId]);

  const handleOpenAddPlayer = () => {
    setIsAddPlayerOpen(true);
    fetchAvailablePlayers();
  };

  const handleAssignPlayer = async (playerId: string) => {
    setIsAssigning(true);
    try {
      await axiosInstance.post(endpoints.division.assignPlayer, {
        divisionId,
        userId: playerId,
      });
      toast.success("Player assigned successfully");
      await onPlayersUpdated();
      await fetchAvailablePlayers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to assign player");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemovePlayer = async () => {
    if (!playerToRemove) return;
    setIsRemoving(true);
    try {
      await axiosInstance.delete(
        endpoints.division.removePlayer(divisionId, playerToRemove.id)
      );
      toast.success("Player removed successfully");
      await onPlayersUpdated();
      setPlayerToRemove(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove player");
    } finally {
      setIsRemoving(false);
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const capacity = division.gameType === "singles"
    ? division.maxSingles
    : division.maxDoublesTeams;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <IconUsers className="size-5" />
            Players ({players.length}{capacity ? `/${capacity}` : ""})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onPlayersUpdated}>
              <IconRefresh className="mr-2 size-4" />
              Refresh
            </Button>
            <Button size="sm" onClick={handleOpenAddPlayer}>
              <IconUserPlus className="mr-2 size-4" />
              Add Player
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading players...
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <IconUsers className="size-12 opacity-50" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {searchTerm ? "No players found" : "No players assigned"}
                  </p>
                  <p className="text-sm">
                    {searchTerm
                      ? "Try a different search term"
                      : "Add players to this division to get started"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Matches</TableHead>
                    <TableHead>W/L</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlayers.map((player) => (
                    <TableRow key={player.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{player.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {player.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {player.rating ? (
                          <Badge variant="outline">{player.rating} pts</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{player.matchesPlayed || 0}</TableCell>
                      <TableCell>
                        <span className="text-green-600">{player.wins || 0}W</span>
                        {" / "}
                        <span className="text-red-600">{player.losses || 0}L</span>
                      </TableCell>
                      <TableCell>{formatDate(player.joinedAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => setPlayerToRemove(player)}
                        >
                          <IconUserMinus className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Player Dialog */}
      <Dialog open={isAddPlayerOpen} onOpenChange={setIsAddPlayerOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Player to Division</DialogTitle>
            <DialogDescription>
              Select players to assign to {division.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search available players..."
                value={availableSearchTerm}
                onChange={(e) => setAvailableSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {isLoadingAvailable ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading available players...
              </div>
            ) : filteredAvailablePlayers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {availableSearchTerm
                  ? "No matching players found"
                  : "No available players"}
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredAvailablePlayers.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
                  >
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{player.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {player.email}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {player.rating && (
                        <Badge variant="outline" className="text-xs">
                          {player.rating} pts
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAssignPlayer(player.id)}
                        disabled={isAssigning}
                      >
                        <IconUserPlus className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Player Confirmation */}
      <AlertDialog
        open={!!playerToRemove}
        onOpenChange={(open) => !open && setPlayerToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Player</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {playerToRemove?.name} from this
              division? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemovePlayer}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
