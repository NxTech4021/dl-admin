"use client";

import React, { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconTrophy,
  IconSearch,
  IconCalendar,
  IconClock,
} from "@tabler/icons-react";

interface DivisionMatch {
  id: string;
  player1?: { id: string; name: string };
  player2?: { id: string; name: string };
  team1?: { id: string; name: string };
  team2?: { id: string; name: string };
  score?: string;
  status: string;
  scheduledAt?: string;
  completedAt?: string;
  winner?: string;
}

interface DivisionMatchesCardProps {
  divisionId: string;
  matches: DivisionMatch[];
  isLoading: boolean;
  gameType: string;
}

export default function DivisionMatchesCard({
  divisionId,
  matches,
  isLoading,
  gameType,
}: DivisionMatchesCardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredMatches = matches.filter((match) => {
    const matchesSearch =
      match.player1?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.player2?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.team1?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.team2?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || match.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: string | undefined) => {
    if (!date) return "Not scheduled";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Scheduled</Badge>;
      case "in_progress":
      case "inprogress":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">In Progress</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      case "pending":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculate stats
  const completedMatches = matches.filter(
    (m) => m.status.toLowerCase() === "completed"
  ).length;
  const scheduledMatches = matches.filter(
    (m) => m.status.toLowerCase() === "scheduled"
  ).length;
  const pendingMatches = matches.filter(
    (m) => m.status.toLowerCase() === "pending"
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <IconTrophy className="size-5" />
            Matches ({matches.length})
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              <IconClock className="mr-1 size-3" />
              {completedMatches} Completed
            </Badge>
            <Badge variant="outline" className="text-xs">
              <IconCalendar className="mr-1 size-3" />
              {scheduledMatches} Scheduled
            </Badge>
            <Badge variant="outline" className="text-xs">
              {pendingMatches} Pending
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search matches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading matches...
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <IconTrophy className="size-12 opacity-50" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {searchTerm || statusFilter !== "all"
                    ? "No matches found"
                    : "No matches yet"}
                </p>
                <p className="text-sm">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Matches will appear here once scheduled"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {gameType === "singles" ? "Player 1" : "Team 1"}
                  </TableHead>
                  <TableHead className="text-center">vs</TableHead>
                  <TableHead>
                    {gameType === "singles" ? "Player 2" : "Team 2"}
                  </TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMatches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell>
                      <div className="font-medium">
                        {gameType === "singles"
                          ? match.player1?.name || "TBD"
                          : match.team1?.name || "TBD"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      vs
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {gameType === "singles"
                          ? match.player2?.name || "TBD"
                          : match.team2?.name || "TBD"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {match.score ? (
                        <span className="font-mono">{match.score}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(match.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {match.completedAt
                        ? formatDate(match.completedAt)
                        : formatDate(match.scheduledAt)}
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
