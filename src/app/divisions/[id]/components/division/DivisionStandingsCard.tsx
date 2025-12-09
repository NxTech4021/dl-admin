"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconTarget,
  IconSearch,
  IconTrophy,
  IconMedal,
} from "@tabler/icons-react";

interface DivisionPlayer {
  id: string;
  name: string;
  email: string;
  rating?: number;
  wins?: number;
  losses?: number;
  matchesPlayed?: number;
}

interface DivisionStandingsCardProps {
  divisionId: string;
  players: DivisionPlayer[];
  isLoading: boolean;
  gameType: string;
}

type SortKey = "rank" | "wins" | "losses" | "winRate" | "matchesPlayed" | "rating";

export default function DivisionStandingsCard({
  divisionId,
  players,
  isLoading,
  gameType,
}: DivisionStandingsCardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("winRate");

  // Calculate standings with win rate and rank
  const standings = useMemo(() => {
    const playersWithStats = players.map((player) => {
      const wins = player.wins || 0;
      const losses = player.losses || 0;
      const matchesPlayed = player.matchesPlayed || wins + losses;
      const winRate = matchesPlayed > 0 ? (wins / matchesPlayed) * 100 : 0;

      return {
        ...player,
        wins,
        losses,
        matchesPlayed,
        winRate,
      };
    });

    // Sort based on selected criteria
    const sorted = [...playersWithStats].sort((a, b) => {
      switch (sortBy) {
        case "wins":
          return b.wins - a.wins;
        case "losses":
          return a.losses - b.losses;
        case "winRate":
          return b.winRate - a.winRate;
        case "matchesPlayed":
          return b.matchesPlayed - a.matchesPlayed;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return b.winRate - a.winRate;
      }
    });

    // Add rank
    return sorted.map((player, index) => ({
      ...player,
      rank: index + 1,
    }));
  }, [players, sortBy]);

  const filteredStandings = standings.filter(
    (player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <IconTrophy className="mr-1 size-3" />
          1st
        </Badge>
      );
    }
    if (rank === 2) {
      return (
        <Badge className="bg-gray-200 text-gray-800 border-gray-300">
          <IconMedal className="mr-1 size-3" />
          2nd
        </Badge>
      );
    }
    if (rank === 3) {
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
          <IconMedal className="mr-1 size-3" />
          3rd
        </Badge>
      );
    }
    return <span className="text-muted-foreground">#{rank}</span>;
  };

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 70) return "text-green-600";
    if (winRate >= 50) return "text-blue-600";
    if (winRate >= 30) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <IconTarget className="size-5" />
            Standings
          </CardTitle>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>
              {standings.length} {gameType === "singles" ? "Players" : "Teams"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="winRate">Win Rate</SelectItem>
              <SelectItem value="wins">Wins</SelectItem>
              <SelectItem value="losses">Fewest Losses</SelectItem>
              <SelectItem value="matchesPlayed">Matches Played</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading standings...
          </div>
        ) : filteredStandings.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <IconTarget className="size-12 opacity-50" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {searchTerm ? "No players found" : "No standings data"}
                </p>
                <p className="text-sm">
                  {searchTerm
                    ? "Try a different search term"
                    : "Standings will appear once matches are played"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-center">Rating</TableHead>
                  <TableHead className="text-center">Played</TableHead>
                  <TableHead className="text-center">Wins</TableHead>
                  <TableHead className="text-center">Losses</TableHead>
                  <TableHead className="text-center">Win Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStandings.map((player) => (
                  <TableRow
                    key={player.id}
                    className={player.rank <= 3 ? "bg-muted/30" : ""}
                  >
                    <TableCell>{getRankBadge(player.rank)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{player.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {player.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {player.rating ? (
                        <Badge variant="outline">{player.rating}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {player.matchesPlayed}
                    </TableCell>
                    <TableCell className="text-center text-green-600 font-medium">
                      {player.wins}
                    </TableCell>
                    <TableCell className="text-center text-red-600 font-medium">
                      {player.losses}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`font-semibold ${getWinRateColor(
                          player.winRate
                        )}`}
                      >
                        {player.winRate.toFixed(1)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
