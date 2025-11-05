"use client";

import * as React from "react";
import {
  IconUserCircle,
  IconActivity,
  IconTarget,
  IconTrophy,
  IconCalendar,
  IconStar,
  IconDatabase,
  IconMessage,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { PlayerProfileProps } from "./utils/types";
import { usePlayerProfile } from "./hooks/use-player-profile";
import { usePlayerHistory } from "./hooks/use-player-history";
import { usePlayerPairingRequests } from "./hooks/use-player-pairing-requests";
import { ProfileSkeleton } from "./ProfileSkeleton";
import { OverviewTab } from "./tabs/OverviewTab";
import { ActivityTab } from "./tabs/ActivityTab";
import { MatchesTab } from "./tabs/MatchesTab";
import { LeagueHistoryTab } from "./tabs/LeagueHistoryTab";
import { SeasonHistoryTab } from "./tabs/SeasonHistoryTab";
import { AchievementsTab } from "./tabs/AchievementsTab";
import { RawDataTab } from "./tabs/RawDataTab";
import { PairingRequestsTab } from "./tabs/PairingRequestsTab";

export function PlayerProfile({ playerId }: PlayerProfileProps) {
  const { profile, isLoading } = usePlayerProfile(playerId);
  const {
    leagueHistory,
    seasonHistory,
    historyLoading,
    fetchLeagueHistory,
    fetchSeasonHistory,
  } = usePlayerHistory(playerId);
  const {
    pairingRequests,
    pairingLoading,
    fetchPairingRequests,
    handleAcceptRequest,
    handleDenyRequest,
    handleCancelRequest,
  } = usePlayerPairingRequests(playerId);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="container p-6">
        <Card>
          <CardHeader>
            <CardTitle>Player Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested player could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Tabs
      defaultValue="overview"
      className="space-y-6"
      onValueChange={(value) => {
        if (value === "league_history") {
          fetchLeagueHistory();
        }
        if (value === "season_history") {
          fetchSeasonHistory();
        }
        if (value === "pairing_requests") {
          fetchPairingRequests();
        }
      }}
    >
      <TabsList className="grid w-full grid-cols-8">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <IconUserCircle className="size-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex items-center gap-2">
          <IconActivity className="size-4" />
          Activity
        </TabsTrigger>
        <TabsTrigger value="matches" className="flex items-center gap-2">
          <IconTarget className="size-4" />
          Matches
        </TabsTrigger>
        <TabsTrigger value="league_history" className="flex items-center gap-2">
          <IconTrophy className="size-4" />
          League History
        </TabsTrigger>
        <TabsTrigger value="season_history" className="flex items-center gap-2">
          <IconCalendar className="size-4" />
          Season History
        </TabsTrigger>
        <TabsTrigger value="achievements" className="flex items-center gap-2">
          <IconStar className="size-4" />
          Achievements
        </TabsTrigger>
        <TabsTrigger value="pairing_requests" className="flex items-center gap-2">
          <IconMessage className="size-4" />
          Pairings
        </TabsTrigger>
        <TabsTrigger value="raw_data" className="flex items-center gap-2">
          <IconDatabase className="size-4" />
          Raw Data
        </TabsTrigger>
      </TabsList>

      <OverviewTab profile={profile} />
      <ActivityTab profile={profile} />
      <MatchesTab profile={profile} />
      <LeagueHistoryTab
        leagueHistory={leagueHistory}
        historyLoading={historyLoading.leagues}
        onFocus={fetchLeagueHistory}
      />
      <SeasonHistoryTab
        seasonHistory={seasonHistory}
        historyLoading={historyLoading.seasons}
        onFocus={fetchSeasonHistory}
      />
      <AchievementsTab profile={profile} />
      <PairingRequestsTab
        pairingRequests={pairingRequests}
        pairingLoading={pairingLoading}
        handleAcceptRequest={handleAcceptRequest}
        handleDenyRequest={handleDenyRequest}
        handleCancelRequest={handleCancelRequest}
      />
      <RawDataTab profile={profile} />
    </Tabs>
  );
}

