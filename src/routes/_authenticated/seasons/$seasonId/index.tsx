import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Season, seasonSchema } from "@/constants/zod/season-schema";
import { divisionSchema, Division } from "@/constants/zod/division-schema";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { z } from "zod";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

import { SiteHeader } from "@/components/site-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { fadeInUp, fastTransition } from "@/lib/animation-variants";

import {
  IconUserCircle,
  IconUsers,
  IconTrophy,
  IconTarget,
  IconSettings,
  IconCreditCard,
  IconCalendar,
  IconChevronLeft,
} from "@tabler/icons-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Lazy load tab components
const SeasonPlayersCard = lazy(() => import("@/app/seasons/[id]/components/season/SeasonPlayersCard"));
const SeasonDivisionsCard = lazy(() => import("@/app/seasons/[id]/components/season/SeasonDivisionsCard"));
const SeasonLeaderboardCard = lazy(() => import("@/app/seasons/[id]/components/season/SeasonLeaderboardCard"));
const WithdrawalRequestsCard = lazy(() => import("@/app/seasons/[id]/components/season/WithdrawalRequestsCard"));
const SeasonSettingsCard = lazy(() => import("@/app/seasons/[id]/components/season/SeasonSettingsCard"));
const SeasonOverviewStats = lazy(() => import("@/app/seasons/[id]/components/season/SeasonOverviewStats"));
const SeasonDetailsSection = lazy(() => import("@/app/seasons/[id]/components/season/SeasonDetailsSection"));
const SeasonPaymentCard = lazy(() => import("@/app/seasons/[id]/components/season/SeasonPaymentCard"));

const TABS = [
  { value: "overview", label: "Overview", icon: IconUserCircle },
  { value: "players", label: "Players", icon: IconUsers },
  { value: "divisions", label: "Divisions", icon: IconTrophy },
  { value: "leaderboard", label: "Leaderboard", icon: IconTarget },
  { value: "withdrawal_requests", label: "Withdrawals", icon: IconCalendar },
  { value: "payment", label: "Payment", icon: IconCreditCard },
  { value: "settings", label: "Settings", icon: IconSettings },
] as const;

export const Route = createFileRoute("/_authenticated/seasons/$seasonId/")({
  component: SeasonDetailPage,
});

function SeasonDetailPage() {
  const { seasonId } = Route.useParams();
  const [season, setSeason] = useState<Season | null>(null);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDivisionsLoading, setIsDivisionsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { data: session } = useSession();

  const userId = session?.user.id;

  const fetchDivisions = useCallback(async () => {
    setIsDivisionsLoading(true);
    try {
      const response = await axiosInstance.get(
        endpoints.division.getBySeasonId(seasonId)
      );
      if (!response.data || !Array.isArray(response.data.data)) {
        setDivisions([]);
        return;
      }
      const parsed = z.array(divisionSchema).parse(response.data.data);
      setDivisions(parsed);
    } catch (error) {
      logger.error("Failed to load divisions:", error);
      setDivisions([]);
      toast.error("Unable to load divisions.");
    } finally {
      setIsDivisionsLoading(false);
    }
  }, [seasonId]);

  const fetchSeasonData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        endpoints.season.getById(seasonId)
      );
      const parsedData = seasonSchema.parse(response.data);
      setSeason(parsedData);
    } catch (error) {
      logger.error("Failed to fetch season details:", error);
      toast.error("Failed to load season details");
    } finally {
      setIsLoading(false);
    }
  }, [seasonId]);

  const refreshAllData = useCallback(async () => {
    await Promise.all([fetchSeasonData(), fetchDivisions()]);
  }, [fetchSeasonData, fetchDivisions]);

  const handleMembershipUpdated = useCallback(async () => {
    await refreshAllData();
  }, [refreshAllData]);

  const handleDivisionCreated = useCallback(async () => {
    await fetchDivisions();
  }, [fetchDivisions]);

  const handleDivisionUpdated = useCallback(async () => {
    await fetchDivisions();
  }, [fetchDivisions]);

  const handleDivisionDeleted = useCallback(async () => {
    await fetchDivisions();
  }, [fetchDivisions]);

  useEffect(() => {
    if (seasonId) {
      fetchSeasonData();
      fetchDivisions();
    }
  }, [seasonId, fetchSeasonData, fetchDivisions]);

  if (isLoading || !season) {
    return (
      <>
        <SiteHeader
          items={[
            { label: "Seasons", href: "/seasons" },
            { label: "Loading..." },
          ]}
        />
        <div className="space-y-6 p-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader
        items={[
          { label: "Seasons", href: "/seasons" },
          { label: season.name },
        ]}
      />
      <div className="space-y-6 p-8">
        {/* Back button and title */}
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/seasons">
              <IconChevronLeft className="mr-1 size-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{season.name}</h1>
            <p className="text-sm text-muted-foreground">
              Manage season details, players, and divisions
            </p>
          </div>
        </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Mobile: Dropdown Select */}
        <div className="md:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {(() => {
                  const currentTab = TABS.find(tab => tab.value === activeTab);
                  if (!currentTab) return null;
                  const Icon = currentTab.icon;
                  return (
                    <div className="flex items-center gap-2">
                      <Icon className="size-4" />
                      <span>{currentTab.label}</span>
                    </div>
                  );
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <SelectItem key={tab.value} value={tab.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="size-4" />
                      <span>{tab.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: Tab List */}
        <TabsList className="hidden md:grid w-full grid-cols-7">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                <Icon className="size-4" />
                <span className="hidden lg:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              <SeasonOverviewStats season={season} />
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <SeasonDetailsSection
                    season={season}
                    onSeasonUpdated={fetchSeasonData}
                  />
                </div>
                <motion.div
                  className="space-y-6"
                  initial="hidden"
                  animate="visible"
                  variants={fadeInUp}
                  transition={fastTransition}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <IconSettings className="size-4" />
                        Settings & Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-foreground">Season Status</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <Badge
                              variant="outline"
                              className={
                                season.isActive
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-gray-100 text-gray-800 border-gray-200"
                              }
                            >
                              {season.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Registered Players</span>
                            <span className="font-medium text-sm">
                              {Math.max(season.registeredUserCount || 0, (season.memberships || []).length)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-foreground">Configuration</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Payment Required</span>
                            <Badge variant={season.paymentRequired ? "default" : "secondary"}>
                              {season.paymentRequired ? "Yes" : "No"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Withdrawals Allowed</span>
                            <Badge variant={season.withdrawalEnabled ? "default" : "secondary"}>
                              {season.withdrawalEnabled ? "Yes" : "No"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Promo Codes</span>
                            <Badge variant={season.promoCodeSupported ? "default" : "secondary"}>
                              {season.promoCodeSupported ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-foreground">Linked Leagues</h4>
                        <div className="text-sm font-medium">
                          {season.leagues && season.leagues.length > 0 ? (
                            <div className="space-y-1">
                              {season.leagues.map((league) => (
                                <Badge key={league.id} variant="outline" className="text-xs">
                                  {league.name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No leagues linked</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-foreground">Linked Category</h4>
                        <div className="text-sm font-medium">
                          {season.category ? (
                            <Badge variant="outline" className="text-xs">
                              {season.category.name || "Unnamed Category"}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">No category linked</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players">
            <SeasonPlayersCard
              memberships={season.memberships}
              sportType={season.sportType}
              divisions={divisions}
              seasonId={season.id}
              adminId={userId}
              season={season}
              onMembershipUpdated={handleMembershipUpdated}
            />
          </TabsContent>

          {/* Divisions Tab */}
          <TabsContent value="divisions">
            <SeasonDivisionsCard
              seasonId={seasonId}
              divisions={divisions}
              isLoading={isDivisionsLoading}
              adminId={userId as string}
              onDivisionCreated={handleDivisionCreated}
              onDivisionUpdated={handleDivisionUpdated}
              onDivisionDeleted={handleDivisionDeleted}
            />
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <SeasonLeaderboardCard seasonId={seasonId} />
          </TabsContent>

          {/* Withdrawal Requests Tab */}
          <TabsContent value="withdrawal_requests">
            <WithdrawalRequestsCard
              requests={season.withdrawalRequests}
              onRequestProcessed={fetchSeasonData}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <SeasonSettingsCard season={season} />
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment">
            <SeasonPaymentCard
              memberships={season.memberships}
              entryFee={season.entryFee}
              paymentRequired={season.paymentRequired}
              seasonName={season.name}
            />
          </TabsContent>
        </Suspense>
      </Tabs>
      </div>
    </>
  );
}
