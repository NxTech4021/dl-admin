"use client";

import {
  IconTrophy,
  IconActivity,
  IconTarget,
  IconUsers,
  IconAward,
  IconDatabase,
  IconStar,
  IconUser,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import the individual card components
import { LeagueInfoCard } from "./league-info-card";
import { StatsGrid } from "./stats-grid";
import { MemberCard } from "./member-card";
import { SponsorCard } from "./sponsor-card";
import { CategoryCard } from "./category-card";
import { SeasonCard } from "./season-card";

// Import shared types
import {
  League,
  Player,
  Division,
  Season,
  Category,
  Sponsor,
  GetLocationLabelFunction,
  GetSportLabelFunction,
  GetStatusBadgeFunction,
  FormatDateFunction,
  CalculateWinRateFunction,
} from "./types";

interface LeagueTabsProps {
  league: League;
  players: Player[];
  divisions: Division[];
  seasons: Season[];
  categories: Category[];
  sponsors: Sponsor[];
  getLocationLabel: GetLocationLabelFunction;
  getSportLabel: GetSportLabelFunction;
  getStatusBadge: GetStatusBadgeFunction;
  formatDate: FormatDateFunction;
  calculateWinRate: CalculateWinRateFunction;
  onSeasonCreated?: () => void;
  onAddSponsor?: () => void;
  onDeleteCategory?: (categoryId: string) => void; 
  onDeleteSeason?: (seasonId: string) => Promise<void>;
  onDeleteSponsor?: (sponsorId: string) => void; 
  onEditSponsor?: (sponsor: Sponsor) => void;
  onAddCategory?: () => void;
  onEditCategory: (category: Category) => void;
  onLeagueUpdated?: () => Promise<void>;
  onViewSeason?: (season: Season) => void;
  onEditSeason?: (season: Season) => void
}

export function LeagueTabs({
  league,
  players,
  divisions,
  seasons,
  categories,
  sponsors,
  getLocationLabel,
  getSportLabel,
  getStatusBadge,
  formatDate,
  calculateWinRate,
  onSeasonCreated,
  onAddSponsor,
  onEditSponsor,
  onAddCategory,
  onEditCategory,
  onLeagueUpdated,
  onDeleteCategory,
  onDeleteSeason,
  onDeleteSponsor,
  onEditSeason,
  onViewSeason
}: LeagueTabsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <IconTrophy className="size-4" />
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
        <TabsTrigger value="players" className="flex items-center gap-2">
          <IconUsers className="size-4" />
          Players
        </TabsTrigger>
        <TabsTrigger value="divisions" className="flex items-center gap-2">
          <IconAward className="size-4" />
          Divisions
        </TabsTrigger>
        <TabsTrigger value="details" className="flex items-center gap-2">
          <IconDatabase className="size-4" />
          Details
        </TabsTrigger>
      </TabsList>

      {/* OVERVIEW TAB */}
      <TabsContent value="overview">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column: League Info Card */}
          <div className="md:col-span-1 space-y-6">
            <LeagueInfoCard
              league={league}
              getLocationLabel={getLocationLabel}
              getSportLabel={getSportLabel}
              getStatusBadge={getStatusBadge}
              formatDate={formatDate}
              onLeagueUpdated={onLeagueUpdated}
            />
          </div>

          {/* Right Column: Stats Cards */}
          <div className="md:col-span-2 space-y-6">
            <StatsGrid
              memberCount={players.length || 0}
              categoryCount={categories.length || 0}
              seasonCount={seasons.length || 0}
              sponsorCount={sponsors.length || 0}
            />

            <MemberCard
              players={players}
              formatDate={formatDate}
              calculateWinRate={calculateWinRate}
            />

            <SponsorCard 
            sponsors={sponsors} 
            onAddSponsor={onAddSponsor} 
            onEditSponsor={onEditSponsor} 
            onDeleteSponsor={onDeleteSponsor}
            />

         
           
             <CategoryCard
                categories={categories}
                onEditCategory={onEditCategory}
                onAddCategory={onAddCategory}
                onDeleteCategory={onDeleteCategory}
              />

            <SeasonCard
              seasons={seasons}
              leagueId={league.id}
              categories={categories} 
              formatDate={formatDate}
              onSeasonCreated={onSeasonCreated}
              onDeleteSeason={onDeleteSeason}  
              onViewSeason={
                onViewSeason
                  ? (seasonId: string) => {
                      const season = seasons.find(s => s.id === seasonId);
                      if (season) onViewSeason(season);
                    }
                  : undefined
              }
              onEditSeason={onEditSeason}
            />
          </div>
        </div>
      </TabsContent>

      {/* ACTIVITY TAB */}
      <TabsContent value="activity">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconActivity className="size-5 text-blue-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates and changes in this league
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <IconActivity className="size-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No recent activity found
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconTrophy className="size-5 text-green-600" />
                League Statistics
              </CardTitle>
              <CardDescription>Performance metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total Matches
                  </span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Active Players
                  </span>
                  <span className="font-semibold">
                    {league.memberCount || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Completion Rate
                  </span>
                  <span className="font-semibold">0%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* MATCHES TAB */}
      <TabsContent value="matches">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTarget className="size-5" />
              Match History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <IconTarget className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No matches yet</h3>
              <p className="text-muted-foreground">
                Matches will appear here once they are scheduled and completed
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* PLAYERS TAB */}
      <TabsContent value="players">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUsers className="size-5" />
              League Players
            </CardTitle>
            <CardDescription>
              All players currently registered in this league
            </CardDescription>
          </CardHeader>
          <CardContent>
            {players.length === 0 ? (
              <div className="text-center py-12">
                <IconUsers className="size-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No players yet</h3>
                <p className="text-muted-foreground">
                  Players will appear here once they join the league
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconUser className="size-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{player.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {player.email}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <IconStar className="size-3" />
                            {player.rating || "N/A"} rating
                          </span>
                          <span>
                            {player.division || "No division"} Division
                          </span>
                          <span>Joined {formatDate(player.joinedAt)}</span>
                        </div>
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
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* DIVISIONS TAB */}
      <TabsContent value="divisions">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {divisions.length === 0 ? (
            <div className="col-span-full">
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <IconAward className="size-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Divisions</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Divisions will appear here once they are created for this
                    league.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            divisions.map((division) => (
              <Card key={division.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {division.name}
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                      {division.status}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {division.gameType} •{" "}
                    {division.genderCategory || "All genders"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Singles:</span>
                      <span>
                        {division.currentSinglesCount || 0} /{" "}
                        {division.maxSinglesPlayers || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Doubles:</span>
                      <span>
                        {division.currentDoublesCount || 0} /{" "}
                        {division.maxDoublesTeams || "N/A"}
                      </span>
                    </div>
                    {division.season && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          Season: {division.season.name}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </TabsContent>

      {/* DETAILS TAB */}
      <TabsContent value="details">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconDatabase className="size-5" />
              League Details
            </CardTitle>
            <CardDescription>
              Complete information about this league
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">League ID:</span>
                    <span className="font-mono">{league.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span>{league.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sport:</span>
                    <span>{getSportLabel(league.sportType)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{getLocationLabel(league.location || "")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    {getStatusBadge(league.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Join Type:</span>
                    <span className="capitalize">
                      {league.joinType?.toLowerCase().replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Game Type:</span>
                    <span className="capitalize">
                      {league.gameType.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">League Statistics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{formatDate(league.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span>{formatDate(league.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Members:</span>
                    <span>{league.memberCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seasons:</span>
                    <span>{league.seasonCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categories:</span>
                    <span>{league.categoryCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sponsors:</span>
                    <span>{sponsors.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {league.description && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-3">Description</h4>
                <p className="text-muted-foreground">{league.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
