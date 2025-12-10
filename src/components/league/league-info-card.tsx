"use client";

import { useState } from "react";
import {
  IconTrophy,
  IconMapPin,
  IconCalendar,
  IconUser,
  IconEdit,
  IconInfoCircle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DetailField } from "@/components/ui/detail-field";
import {
  League,
  GetLocationLabelFunction,
  GetSportLabelFunction,
  GetStatusBadgeFunction,
  FormatDateFunction,
} from "./types";
import LeagueEditModal from "@/components/modal/league-edit-modal";

interface LeagueInfoCardProps {
  league: League;
  getLocationLabel: GetLocationLabelFunction;
  getSportLabel: GetSportLabelFunction;
  getStatusBadge: GetStatusBadgeFunction;
  formatDate: FormatDateFunction;
  onLeagueUpdated?: () => Promise<void>;
}

export function LeagueInfoCard({
  league,
  getLocationLabel,
  getSportLabel,
  getStatusBadge,
  formatDate,
  onLeagueUpdated,
}: LeagueInfoCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <IconTrophy className="size-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{league.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                {getStatusBadge(league.status)}
                <span className="text-muted-foreground">•</span>
                <span className="capitalize">
                  {getSportLabel(league.sportType)}
                </span>
              </CardDescription>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditModalOpen(true)}
        >
          <IconEdit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4">
            <DetailField
              label="Location"
              icon={<IconMapPin className="size-3" />}
              value={getLocationLabel(league.location || "Location not set")}
            />
            <DetailField
              label="Game Type"
              icon={<IconTrophy className="size-3" />}
              value={
                <Badge variant="outline" className="capitalize">
                  {league.gameType?.toLowerCase()}
                </Badge>
              }
            />
            <DetailField
              label="Join Type"
              icon={<IconInfoCircle className="size-3" />}
              value={
                <Badge variant="secondary" className="capitalize">
                  {league.joinType?.toLowerCase().replace("_", " ")}
                </Badge>
              }
            />
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <DetailField
              label="Created"
              icon={<IconCalendar className="size-3" />}
              value={formatDate(league.createdAt)}
            />
            {league.createdBy && (
              <DetailField
                label="Created By"
                icon={<IconUser className="size-3" />}
                value={league.createdBy.user.name}
              />
            )}
          </div>
        </div>

        {/* Description */}
        {league.description && (
          <div className="mt-6 pt-6 border-t">
            <DetailField
              label="Description"
              value={
                <p className="text-sm leading-relaxed text-muted-foreground italic">
                  &quot;{league.description}&quot;
                </p>
              }
            />
          </div>
        )}
      </CardContent>

      <LeagueEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        league={league}
        onLeagueUpdated={onLeagueUpdated}
      />
    </Card>
  );
}
