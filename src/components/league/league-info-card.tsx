"use client";

import { useRouter } from "next/navigation";
import { IconTrophy, IconMapPin, IconCalendar, IconUser, IconEdit } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { League, GetLocationLabelFunction, GetSportLabelFunction, GetStatusBadgeFunction, FormatDateFunction } from "./types";

interface LeagueInfoCardProps {
  league: League;
  getLocationLabel: GetLocationLabelFunction;
  getSportLabel: GetSportLabelFunction;
  getStatusBadge: GetStatusBadgeFunction;
  formatDate: FormatDateFunction;
}

export function LeagueInfoCard({ 
  league, 
  getLocationLabel, 
  getSportLabel, 
  getStatusBadge, 
  formatDate 
}: LeagueInfoCardProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <IconTrophy className="size-8 text-primary" />
            </div>
            <div className="space-y-2">
              <div>
                <CardTitle className="text-2xl">{league.name}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(league.status)}
                <Badge variant="outline" className="capitalize">
                  {getSportLabel(league.sportType)}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {league.joinType?.toLowerCase().replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => router.push(`/league/edit/${league.id}`)}
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                >
                  <IconEdit className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit League</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconMapPin className="size-4" />
            <span>{getLocationLabel(league.location || "Location not set")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconTrophy className="size-4" />
            <span className="capitalize">{league.gameType.toLowerCase()}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconCalendar className="size-4" />
            <span>Created on {formatDate(league.createdAt)}</span>
          </div>
          {league.createdBy && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconUser className="size-4" />
              <span>Created by {league.createdBy.user.name}</span>
            </div>
          )}
        </div>

        {league.description && (
          <div className="pt-3 border-t">
            <p className="text-sm text-muted-foreground italic">
              &quot;{league.description}&quot;
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
