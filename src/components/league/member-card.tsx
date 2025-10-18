"use client";

import { IconUsers, IconUser, IconStar } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Player, FormatDateFunction, CalculateWinRateFunction } from "./types";

interface MemberCardProps {
  players: Player[];
  formatDate: FormatDateFunction;
  calculateWinRate: CalculateWinRateFunction;
}

export function MemberCard({ players, formatDate, calculateWinRate }: MemberCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconUsers className="size-5" />
          Members
        </CardTitle>
      </CardHeader>
      <CardContent>
        {players.length > 0 ? (
          <div className="space-y-3">
            {players.slice(0, 5).map((player) => (
              <div key={player.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20">
                    <IconUser className="size-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{player.name}</p>
                    <p className="text-sm text-muted-foreground">@{player.username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {player.wins}W - {player.losses}L
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {calculateWinRate(player.wins, player.losses)}% win rate
                  </div>
                </div>
              </div>
            ))}
            {players.length > 5 && (
              <div className="text-center pt-2">
                <Button variant="outline" size="sm">
                  View All {players.length} Members
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <IconUsers className="size-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No members yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
