"use client";
import React, { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import LeagueSponsorsSection from "@/components/league/league-sponsors-section";
import { LeagueSeasonsWrapper } from "@/components/league/league-seasons-wrapper";
import { LeagueSnapshotMetrics } from "@/components/league/league-snapshot-metrics";
import { LeagueMembershipInsights } from "@/components/league/league-membership-insights";
import type { Season } from "@/constants/zod/season-schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconTrophy,
  IconUsers,
  IconMapPin,
  IconInfoCircle,
  IconCheck,
  IconCalendar,
  IconEdit,
  IconX,
  IconUser,
  IconActivity,
  IconChartBar,
  IconCurrencyDollar,
  IconClock,
  IconAward,
  IconBuilding,
  IconFileText,
  IconTrendingUp,
} from "@tabler/icons-react";
import {
  formatLocation,
  FILTER_OPTIONS,
} from "@/components/data-table/constants";
import { getStatusBadgeVariant } from "@/components/data-table/constants";
import { getSportLabel } from "@/constants/sports";
import type {
  LeagueStatus,
  JoinType,
  GameType,
  SportType,
  Sponsorship,
} from "@/constants/types/league";

/** Detailed league data from API with nested relations */
interface LeagueDetailData {
  id: string;
  name: string;
  description?: string | null;
  location?: string | null;
  sportType: SportType;
  gameType?: GameType | null;
  joinType?: JoinType | null;
  status: LeagueStatus;
  categoryName?: string | null;
  matchFormat?: string | null;
  maxPlayers?: number | null;
  maxTeams?: number | null;
  divisionsCount?: number | null;
  genderRestriction?: string | null;
  createdAt?: string;
  updatedAt?: string;
  seasons?: SeasonWithMemberships[];
  sponsorships?: Sponsorship[];
  _count?: {
    memberships?: number;
    seasons?: number;
  };
}

/** Season data with memberships for metrics calculation */
interface SeasonWithMemberships {
  id: string;
  name: string;
  status?: string;
  startDate?: string;
  regiDeadline?: string;
  memberships?: SeasonMembership[];
  divisions?: { id: string }[];
  _count?: {
    memberships?: number;
  };
}

/** Membership within a season */
interface SeasonMembership {
  id: string;
  userId?: string;
  status?: string;
  paymentStatus?: string;
  user?: {
    id: string;
    name?: string;
  };
}

/** Editable league form data */
interface LeagueEditFormData {
  name: string;
  description: string;
  location: string;
  sportType: SportType;
  gameType?: GameType | null;
  joinType: JoinType;
  status: LeagueStatus;
  categoryName: string;
  matchFormat: string;
  maxPlayers?: number | null;
  maxTeams?: number | null;
  divisionsCount?: number | null;
  genderRestriction?: string | null;
}

/** API error response structure */
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

/** Sidebar CSS custom properties */
type SidebarStyleProps = React.CSSProperties & {
  "--sidebar-width": string;
  "--header-height": string;
};

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

function formatNumber(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0";
  }

  return numberFormatter.format(value);
}

function formatEnumLabel(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  return value
    .toString()
    .split("_")
    .map((segment) => segment.charAt(0) + segment.slice(1).toLowerCase())
    .join(" ");
}

const SectionCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={cn("rounded-2xl border border-border bg-card p-6", className)}
  >
    {children}
  </section>
);

const InfoItem = ({
  label,
  value,
  hint,
}: {
  label: string;
  value?: React.ReactNode;
  hint?: string;
}) => {
  const isEmptyValue =
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim().length === 0);

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="text-sm font-medium text-foreground">
        {isEmptyValue ? (
          <span className="text-muted-foreground">Not set</span>
        ) : (
          value
        )}
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
};

type SeasonStatsSummary = {
  statusCounts: Record<string, number>;
  totalDivisions: number;
  activeSeasonNames: string[];
  finishedSeasonNames: string[];
  nextSeason: { name: string; startDate: string } | null;
  nextRegistration: { name: string; deadline: string } | null;
};

async function getLeague(id: string) {
  try {
    const response = await axiosInstance.get(endpoints.league.getById(id));
    return response.data?.data?.league;
  } catch {
    // Error handled silently - UI shows "League Not Found" state
    return null;
  }
}

export default function LeagueViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const leagueId = React.use(params).id;
  const [leagueData, setLeagueData] = useState<LeagueDetailData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<LeagueEditFormData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  React.useEffect(() => {
    setIsLoading(true);
    getLeague(leagueId)
      .then((data) => {
        setLeagueData(data);
        if (data) {
          setEditedData({
            name: data.name,
            description: data.description || "",
            location: data.location || "",
            sportType: data.sportType || "TENNIS",
            gameType: data.gameType,
            joinType: data.joinType || "OPEN",
            status: data.status || "ACTIVE",
            categoryName: data.categoryName || "",
            matchFormat: data.matchFormat || "",
            maxPlayers: data.maxPlayers,
            maxTeams: data.maxTeams,
            divisionsCount: data.divisionsCount,
            genderRestriction: data.genderRestriction,
          });
        }
      })
      .finally(() => setIsLoading(false));
  }, [leagueId, refreshTrigger]);

  // All hooks must be called before any early returns
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const seasons = leagueData?.seasons || [];
  const sponsorships = leagueData?.sponsorships || [];

  const {
    uniqueMemberCount,
    totalSeasonParticipation,
    membershipStatusCounts,
    paymentStatusCounts,
  } = React.useMemo(() => {
    const playerIds = new Set<string>();
    let totalMemberships = 0;
    const membershipStatuses: Record<string, number> = {};
    const paymentStatuses: Record<string, number> = {};

    seasons.forEach((season: SeasonWithMemberships) => {
      const seasonMemberships: SeasonMembership[] = season?.memberships ?? [];
      if (typeof season?._count?.memberships === "number") {
        totalMemberships += season._count.memberships;
      } else {
        totalMemberships += seasonMemberships.length;
      }

      seasonMemberships.forEach((membership: SeasonMembership) => {
        const userId = membership?.user?.id ?? membership?.userId;
        if (userId) {
          playerIds.add(userId);
        }

        const membershipStatus =
          typeof membership?.status === "string"
            ? membership.status.toUpperCase()
            : "UNKNOWN";

        if (membershipStatus !== "UNKNOWN") {
          membershipStatuses[membershipStatus] =
            (membershipStatuses[membershipStatus] ?? 0) + 1;
        }

        const paymentStatus =
          typeof membership?.paymentStatus === "string"
            ? membership.paymentStatus.toUpperCase()
            : "UNKNOWN";

        if (paymentStatus !== "UNKNOWN") {
          paymentStatuses[paymentStatus] =
            (paymentStatuses[paymentStatus] ?? 0) + 1;
        }
      });
    });

    return {
      uniqueMemberCount: playerIds.size,
      totalSeasonParticipation: totalMemberships,
      membershipStatusCounts: membershipStatuses,
      paymentStatusCounts: paymentStatuses,
    };
  }, [seasons]);

  const seasonSummary = React.useMemo<SeasonStatsSummary>(() => {
    const statusCounts: Record<string, number> = {};
    let totalDivisions = 0;
    const activeSeasonNames: string[] = [];
    const finishedSeasonNames: string[] = [];
    let nextSeason: { name: string; startDate: string } | null = null;
    let nextRegistration: { name: string; deadline: string } | null = null;
    const now = new Date();

    seasons.forEach((season: SeasonWithMemberships) => {
      const divisionsCount = Array.isArray(season?.divisions)
        ? season.divisions.length
        : 0;
      totalDivisions += divisionsCount;

      const status =
        typeof season?.status === "string"
          ? season.status.toUpperCase()
          : "UNKNOWN";

      if (status !== "UNKNOWN") {
        statusCounts[status] = (statusCounts[status] ?? 0) + 1;
      }

      if (status === "ACTIVE" && typeof season?.name === "string") {
        activeSeasonNames.push(season.name);
      }

      if (status === "FINISHED" && typeof season?.name === "string") {
        finishedSeasonNames.push(season.name);
      }

      if (season?.startDate) {
        const start = new Date(season.startDate);
        if (!Number.isNaN(start.getTime()) && start >= now) {
          if (!nextSeason || start < new Date(nextSeason.startDate)) {
            nextSeason = { name: season.name, startDate: season.startDate };
          }
        }
      }

      if (season?.regiDeadline) {
        const deadline = new Date(season.regiDeadline);
        if (!Number.isNaN(deadline.getTime()) && deadline >= now) {
          if (
            !nextRegistration ||
            deadline < new Date(nextRegistration.deadline)
          ) {
            nextRegistration = {
              name: season.name,
              deadline: season.regiDeadline,
            };
          }
        }
      }
    });

    return {
      statusCounts,
      totalDivisions,
      activeSeasonNames,
      finishedSeasonNames,
      nextSeason,
      nextRegistration,
    };
  }, [seasons]);

  const handleSave = async () => {
    try {
      const payload = {
        name: editedData.name,
        location: editedData.location,
        description: editedData.description,
        status: editedData.status,
      };

      await axiosInstance.put(endpoints.league.update(leagueId), payload);

      setIsEditing(false);
      setLeagueData({ ...leagueData, ...editedData } as LeagueDetailData);
      setRefreshTrigger((prev) => prev + 1);
      toast.success("League updated successfully");
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(
        apiError?.response?.data?.message ||
          apiError?.message ||
          "Failed to save changes"
      );
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (leagueData) {
      setEditedData({
        name: leagueData.name,
        description: leagueData.description || "",
        location: leagueData.location || "",
        sportType: leagueData.sportType || "TENNIS",
        gameType: leagueData.gameType,
        joinType: leagueData.joinType || "OPEN",
        status: leagueData.status || "ACTIVE",
        categoryName: leagueData.categoryName || "",
        matchFormat: leagueData.matchFormat || "",
        maxPlayers: leagueData.maxPlayers,
        maxTeams: leagueData.maxTeams,
        divisionsCount: leagueData.divisionsCount,
        genderRestriction: leagueData.genderRestriction,
      });
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 56)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as SidebarStyleProps
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="p-6 space-y-4">
            <div className="h-6 w-40 bg-muted rounded animate-pulse" />
            <div className="h-10 w-72 bg-muted rounded animate-pulse" />
            <div className="h-40 bg-muted rounded animate-pulse" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!leagueData && !isLoading) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 56)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as SidebarStyleProps
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 items-center justify-center p-8">
            <Card className="w-full max-w-md border-border/80 shadow-none">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <IconTrophy className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl">League Not Found</CardTitle>
                  <CardDescription className="mt-2">
                    The league you&apos;re looking for doesn&apos;t exist or has
                    been removed.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex justify-center pb-6">
                <Button asChild>
                  <a href="/league">← Back to Leagues</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Calculate derived values (these are safe to use even when leagueData is null)
  const seasonsCount = leagueData?._count?.seasons ?? seasons.length;
  const sponsorCount = sponsorships.length;
  const averageSeasonParticipation =
    seasonsCount > 0 && totalSeasonParticipation > 0
      ? Math.round(totalSeasonParticipation / seasonsCount)
      : 0;

  if (leagueData && !leagueData._count) {
    leagueData._count = {
      memberships: totalSeasonParticipation,
      seasons: seasons.length,
    };
  }

  const statusValue =
    (isEditing ? editedData.status : leagueData?.status) || "";
  const locationLabel =
    (isEditing ? editedData.location : leagueData?.location) ||
    "Location not set";
  const sportValue =
    (isEditing ? editedData.sportType : leagueData?.sportType) || "";
  const sportLabel = sportValue ? getSportLabel(sportValue) : "Not set";
  const seasonStatusCounts = seasonSummary.statusCounts || {};
  const snapshotMetrics = [
    {
      label: "Unique Players",
      value: formatNumber(uniqueMemberCount),
      description: "Across all seasons",
      icon: IconUsers,
      iconColor: "text-blue-500",
    },
    {
      label: "Registrations Logged",
      value: formatNumber(totalSeasonParticipation),
      description:
        seasonsCount > 0
          ? `${formatNumber(averageSeasonParticipation)} avg per season`
          : "No seasons yet",
      icon: IconActivity,
      iconColor: "text-green-500",
    },
    {
      label: "Seasons",
      value: formatNumber(seasonsCount),
      description: `Active ${formatNumber(
        seasonStatusCounts.ACTIVE ?? 0
      )} • Upcoming ${formatNumber(seasonStatusCounts.UPCOMING ?? 0)}`,
      icon: IconCalendar,
      iconColor: "text-purple-500",
    },
    {
      label: "Divisions",
      value: formatNumber(seasonSummary.totalDivisions),
      description: "Total across all seasons",
      icon: IconAward,
      iconColor: "text-orange-500",
    },
    {
      label: "Sponsors",
      value: formatNumber(sponsorCount),
      description: sponsorCount
        ? "Managed in sponsors section"
        : "None linked yet",
      icon: IconBuilding,
      iconColor: "text-indigo-500",
    },
  ];

  const membershipStatusDisplayOrder = [
    "ACTIVE",
    "PENDING",
    "FLAGGED",
    "INACTIVE",
    "REMOVED",
  ];
  const membershipStatusCountsSafe = membershipStatusCounts || {};
  const additionalMembershipStatuses = Object.keys(
    membershipStatusCountsSafe
  ).filter(
    (status) =>
      !membershipStatusDisplayOrder.includes(status) &&
      (membershipStatusCountsSafe[status] ?? 0) > 0
  );

  const paymentStatusDisplayOrder = ["COMPLETED", "PENDING", "FAILED"];
  const paymentStatusCountsSafe = paymentStatusCounts || {};
  const additionalPaymentStatuses = Object.keys(paymentStatusCountsSafe).filter(
    (status) =>
      !paymentStatusDisplayOrder.includes(status) &&
      (paymentStatusCountsSafe[status] ?? 0) > 0
  );
  const totalPaymentsTracked = Object.values(paymentStatusCountsSafe).reduce(
    (total, current) => total + current,
    0
  );

  const getBreadcrumbItems = () => {
    const baseItems = [
      { label: "League", href: "/league" },
      { label: leagueData?.name ?? "League" },
    ];

    switch (activeTab) {
      case "overview":
        return [...baseItems, { label: "Overview" }];
      case "members":
        return [...baseItems, { label: "Players" }];
      case "seasons":
        return [...baseItems, { label: "Seasons" }];
      default:
        return baseItems;
    }
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 56)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as SidebarStyleProps
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader items={getBreadcrumbItems()} />

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex flex-1 flex-col"
            >
              <div className="border-b bg-background">
                <div className="px-6 pt-6 pb-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <Button asChild variant="ghost" size="sm">
                        <a href="/league">← Back</a>
                      </Button>
                      <TabsList className="h-10 gap-1 rounded-md bg-muted/80 p-1 text-muted-foreground">
                        <TabsTrigger value="overview" className="gap-2">
                          <IconInfoCircle className="h-4 w-4" />
                          Overview
                        </TabsTrigger>
                        <TabsTrigger value="seasons" className="gap-2">
                          <IconCalendar className="h-4 w-4" />
                          Seasons
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({seasons.length})
                          </span>
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            size="sm"
                            className="gap-2"
                            onClick={handleSave}
                          >
                            <IconCheck className="h-4 w-4" />
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={handleCancel}
                          >
                            <IconX className="h-4 w-4" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => setIsEditing(true)}
                        >
                          <IconEdit className="h-4 w-4" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                <TabsContent value="overview" className="space-y-8">
                  <SectionCard className="space-y-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        {isEditing ? (
                          <Input
                            value={editedData.name}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                name: e.target.value,
                              })
                            }
                            placeholder="League name"
                            className="text-3xl font-semibold tracking-tight h-auto py-2 px-3"
                          />
                        ) : (
                          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            {leagueData?.name}
                          </h1>
                        )}
                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            {statusValue ? (
                              <Badge variant={getStatusBadgeVariant('LEAGUE', statusValue)}>
                                {formatEnumLabel(statusValue)}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Not set</Badge>
                            )}
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 font-normal"
                          >
                            <IconMapPin className="h-3.5 w-3.5" />
                            {locationLabel}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 font-normal"
                          >
                            <IconTrophy className="h-3.5 w-3.5" />
                            {sportLabel}
                          </Badge>
                          {leagueData?.joinType ? (
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1 font-normal"
                            >
                              <IconUser className="h-3.5 w-3.5" />
                              {formatEnumLabel(leagueData?.joinType)}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Status
                          </p>
                          <Select
                            value={editedData.status}
                            onValueChange={(value) =>
                              setEditedData({
                                ...editedData,
                                status: value as LeagueStatus,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FILTER_OPTIONS.LEAGUE_STATUS.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {formatEnumLabel(status)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Location
                          </p>
                          <Input
                            value={editedData.location}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                location: e.target.value,
                              })
                            }
                            placeholder="Enter location"
                          />
                        </div>
                      </div>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {leagueData?.createdAt ? (
                        <span>
                          Created {formatDateTime(leagueData.createdAt)}
                        </span>
                      ) : null}
                      {leagueData?.updatedAt ? (
                        <span>
                          Updated {formatDateTime(leagueData.updatedAt)}
                        </span>
                      ) : null}
                      <code className="rounded bg-muted px-2 py-1 text-[11px] font-mono">
                        {leagueData?.id}
                      </code>
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <IconFileText className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold">Overview</h3>
                      </div>
                      {isEditing ? (
                        <Textarea
                          value={editedData.description}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              description: e.target.value,
                            })
                          }
                          className="min-h-[120px]"
                          placeholder="Enter league description..."
                        />
                      ) : (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {leagueData?.description ||
                            "No description provided yet."}
                        </p>
                      )}
                    </div>
                  </SectionCard>

                  <LeagueSnapshotMetrics
                    uniqueMemberCount={uniqueMemberCount}
                    totalSeasonParticipation={totalSeasonParticipation}
                    averageSeasonParticipation={averageSeasonParticipation}
                    seasonsCount={seasonsCount}
                    activeSeasonCount={seasonStatusCounts.ACTIVE ?? 0}
                    upcomingSeasonCount={seasonStatusCounts.UPCOMING ?? 0}
                    totalDivisions={seasonSummary.totalDivisions}
                    sponsorCount={sponsorCount}
                  />

                  <SectionCard className="space-y-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <IconCalendar className="h-5 w-5 text-primary" />
                        <h3 className="text-base font-semibold">
                          Season Highlights
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Track momentum across all connected seasons.
                      </p>
                    </div>
                    {seasonsCount ? (
                      <div className="grid gap-6 lg:grid-cols-2">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <IconActivity className="h-4 w-4 text-muted-foreground" />
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Status Overview
                            </p>
                          </div>
                          <div className="rounded-xl border border-border/60 bg-background/50 p-4">
                            <ul className="space-y-3 text-sm">
                              {[
                                "ACTIVE",
                                "UPCOMING",
                                "FINISHED",
                                "CANCELLED",
                              ].map((status) => (
                                <li
                                  key={status}
                                  className="flex items-center justify-between"
                                >
                                  <span>{formatEnumLabel(status)}</span>
                                  <span className="font-semibold">
                                    {formatNumber(
                                      seasonStatusCounts?.[status] ?? 0
                                    )}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <IconClock className="h-4 w-4 text-muted-foreground" />
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Key Dates
                            </p>
                          </div>
                          <div className="rounded-xl border border-border/60 bg-background/50 p-4 space-y-3 text-sm">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-muted-foreground">
                                Next season start
                              </span>
                              <span className="font-medium text-right">
                                {seasonSummary.nextSeason
                                  ? `${
                                      seasonSummary.nextSeason.name
                                    } · ${formatDateTime(
                                      seasonSummary.nextSeason.startDate
                                    )}`
                                  : "None scheduled"}
                              </span>
                            </div>
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-muted-foreground">
                                Registration deadline
                              </span>
                              <span className="font-medium text-right">
                                {seasonSummary.nextRegistration
                                  ? `${
                                      seasonSummary.nextRegistration.name
                                    } · ${formatDateTime(
                                      seasonSummary.nextRegistration.deadline
                                    )}`
                                  : "No upcoming deadline"}
                              </span>
                            </div>
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-muted-foreground">
                                Active seasons
                              </span>
                              <span className="font-medium text-right">
                                {seasonSummary.activeSeasonNames.length
                                  ? seasonSummary.activeSeasonNames.join(", ")
                                  : "None currently"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Seasons will appear here once created.
                      </p>
                    )}
                  </SectionCard>

                  <LeagueMembershipInsights
                    totalSeasonParticipation={totalSeasonParticipation}
                    membershipStatusCounts={membershipStatusCounts}
                    paymentStatusCounts={paymentStatusCounts}
                  />

                  <SectionCard className="space-y-6">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <IconBuilding className="h-5 w-5 text-primary" />
                          <h3 className="text-base font-semibold">
                            Sponsorships
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Manage partners supporting this league.
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs uppercase tracking-wide"
                      >
                        {sponsorCount
                          ? `${formatNumber(sponsorCount)} linked`
                          : "No sponsors yet"}
                      </Badge>
                    </div>
                    <LeagueSponsorsSection
                      sponsorships={sponsorships}
                      leagueId={leagueId}
                      onSponsorDeleted={() => {
                        setRefreshTrigger((prev) => prev + 1);
                      }}
                    />
                  </SectionCard>
                </TabsContent>

                <TabsContent value="seasons" className="space-y-8">
                  <SectionCard className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold flex items-center gap-2">
                        <IconCalendar className="h-5 w-5" /> Seasons
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        All seasons and tournaments for this league.
                      </p>
                    </div>
                    <LeagueSeasonsWrapper
                      seasons={seasons as Season[]}
                      leagueId={leagueId}
                      leagueName={leagueData?.name}
                      onRefresh={() => {
                        setActiveTab("seasons");
                        setRefreshTrigger((prev) => prev + 1);
                      }}
                    />
                  </SectionCard>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
