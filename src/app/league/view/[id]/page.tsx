// @ts-nocheck
"use client";
import React, { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { endpoints } from "@/lib/endpoints";
import { toast } from "sonner";
import LeagueSponsorsSection from "@/components/league/league-sponsors-section";
import { LeagueSeasonsWrapper } from "@/components/league/league-seasons-wrapper";
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
  IconClock,
  IconInfoCircle,
  IconSettings,
  IconCheck,
  IconCalendar,
  IconActivity,
  IconEdit,
  IconX,
  IconUser,
} from "@tabler/icons-react";

type LeagueResponse = { data: { league: any } };

function getStatusBadge(status: string) {
  const variants: Record<string, { variant: string; className: string }> = {
    ACTIVE: { variant: "default", className: "bg-green-500 hover:bg-green-600 text-white" },
    ONGOING: { variant: "default", className: "bg-green-500 hover:bg-green-600 text-white" },
    UPCOMING: { variant: "secondary", className: "bg-blue-500 hover:bg-blue-600 text-white" },
    FINISHED: { variant: "outline", className: "border-gray-400" },
    INACTIVE: { variant: "outline", className: "border-gray-300" },
    CANCELLED: { variant: "destructive", className: "" },
    SUSPENDED: { variant: "default", className: "bg-orange-500 hover:bg-orange-600 text-white" },
  };

  const config = variants[status] || { variant: "outline", className: "" };
  return <Badge className={config.className}>{status}</Badge>;
}

function getSportLabel(sport: string) {
  const map: Record<string, string> = {
    TENNIS: "Tennis",
    PICKLEBALL: "Pickleball",
    PADEL: "Padel",
  };
  return map[sport] || sport;
}

function getJoinTypeLabel(joinType: string) {
  const map: Record<string, string> = {
    OPEN: "Open to All",
    INVITATION: "Invitation Only",
    REQUEST: "Request to Join",
    open: "Open to All",
    invitation: "Invitation Only",
    request: "Request to Join",
  };
  return map[joinType] || joinType;
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function getLeague(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:82";
    const url = `${baseUrl}${endpoints.league.getById(id)}`;

    console.log("Fetching league from:", url);

    const res = await fetch(url, {
      cache: "no-store",
      next: { revalidate: 0 },
      credentials: "include",
    });

    if (!res.ok) {
      console.error(`Failed to fetch league: ${res.status} ${res.statusText}`);
      return null;
    }

    const json = (await res.json()) as LeagueResponse;
    return json?.data?.league ?? null;
  } catch (error) {
    console.error("Error fetching league:", error);
    return null;
  }
}

export default function LeagueViewPage({ params }: { params: Promise<{ id: string }> }) {
  const leagueId = React.use(params).id;
  const [leagueData, setLeagueData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});
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

  const handleSave = async () => {
    try {
      // if (editedData.name.length > 30) {
      //   toast.error("League name cannot exceed 30 characters");
      //   return;
      // }

      const baseUrl = process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:82";
      const url = `${baseUrl}${endpoints.league.update(leagueId)}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: editedData.name,
          location: editedData.location,
          description: editedData.description,
          status: editedData.status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update league");
      }

      const result = await response.json();
      console.log("League updated successfully:", result);

      setIsEditing(false);
      setLeagueData({ ...leagueData, ...editedData });
      setRefreshTrigger((prev) => prev + 1);
      toast.success("League updated successfully");
    } catch (error) {
      console.error("Failed to save:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save changes");
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
      <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 56)", "--header-height": "calc(var(--spacing) * 12)" } as any}>
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
      <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 56)", "--header-height": "calc(var(--spacing) * 12)" } as any}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 items-center justify-center p-8">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <IconTrophy className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl">League Not Found</CardTitle>
                  <CardDescription className="mt-2">
                    The league you're looking for doesn't exist or has been removed.
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

  const seasons = leagueData.seasons || [];
  const sponsorships = leagueData.sponsorships || [];

  const uniquePlayerIds = new Set<string>();

  seasons.forEach((season: any) => {
    if (season.memberships) {
      season.memberships.forEach((membership: any) => {
        const userId = membership.user?.id || membership.userId;
        if (userId) {
          uniquePlayerIds.add(userId);
        }
      });
    }
  });

  const uniqueMemberCount = uniquePlayerIds.size;
  const totalSeasonParticipation = seasons.reduce((total: number, season: any) => {
    const membershipsCount = season._count?.memberships || 0;
    return total + membershipsCount;
  }, 0);

  if (!leagueData._count) {
    leagueData._count = {
      memberships: 0,
      seasons: seasons.length,
    };
  }

  const statusValue = (isEditing ? editedData.status : leagueData.status) || "";
  const locationLabel = (isEditing ? editedData.location : leagueData.location) || "Location not set";
  const sportValue = (isEditing ? editedData.sportType : leagueData.sportType) || "";
  const sportLabel = sportValue ? getSportLabel(sportValue) : "Not set";
  const joinTypeValue = (isEditing ? editedData.joinType : leagueData.joinType) || "";
  const joinTypeLabel = joinTypeValue ? getJoinTypeLabel(joinTypeValue) : "Not set";
  const seasonsCount = leagueData._count?.seasons ?? seasons.length;

  const getBreadcrumbItems = () => {
    const baseItems = [
      { label: "League", href: "/league" },
      { label: leagueData.name },
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
    <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 56)", "--header-height": "calc(var(--spacing) * 12)" } as any}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader items={getBreadcrumbItems()} />

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col">
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
                        {/**
                         * Players tab is temporarily hidden.
                         */}
                        {/*
                        <TabsTrigger value="members" className="gap-2">
                          <IconUsers className="h-4 w-4" />
                          Players
                        </TabsTrigger>
                        */}
                        <TabsTrigger value="seasons" className="gap-2">
                          <IconCalendar className="h-4 w-4" />
                          Seasons
                          <span className="ml-1 text-xs text-muted-foreground">({seasons.length})</span>
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Button size="sm" className="gap-2" onClick={handleSave}>
                            <IconCheck className="h-4 w-4" />
                            Save
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2" onClick={handleCancel}>
                            <IconX className="h-4 w-4" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsEditing(true)}>
                          <IconEdit className="h-4 w-4" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      {isEditing ? (
                        <Input
                          value={editedData.name}
                          onChange={(e) => {
                            const text = e.target.value;
                            // if (text.length <= 30) {
                            setEditedData({ ...editedData, name: text });
                            // } else {
                            //   toast.error("League name cannot exceed 30 characters");
                            // }
                          }}
                          placeholder="League name"
                          // maxLength={32}
                          className="text-3xl font-semibold tracking-tight h-auto py-2 px-3"
                        />
                      ) : (
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                          {leagueData.name}
                        </h1>
                      )}
                      <div>
                        {statusValue ? getStatusBadge(statusValue) : <Badge variant="outline">Not set</Badge>}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="flex items-center gap-1 font-normal">
                        <IconMapPin className="h-3.5 w-3.5" />
                        {locationLabel}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1 font-normal">
                        <IconTrophy className="h-3.5 w-3.5" />
                        {sportLabel}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1 font-normal">
                        <IconUser className="h-3.5 w-3.5" />
                        {joinTypeLabel}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <IconUsers className="h-4 w-4" />
                          Unique Players
                        </span>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-semibold">{uniqueMemberCount}</div>
                        <p className="text-xs text-muted-foreground">Across all seasons</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <IconActivity className="h-4 w-4" />
                          Season Entries
                        </span>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-semibold">{totalSeasonParticipation}</div>
                        <p className="text-xs text-muted-foreground">Total participation across all seasons</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <IconCalendar className="h-4 w-4" />
                          Seasons
                        </span>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-semibold">{seasonsCount}</div>
                        <p className="text-xs text-muted-foreground">Seasons created for this league</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Description</CardTitle>
                      <CardDescription>Share what makes this league unique.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <Textarea
                          value={editedData.description}
                          onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                          className="min-h-[120px]"
                          placeholder="Enter league description..."
                        />
                      ) : (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {leagueData.description || "No description provided yet."}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>League Details</CardTitle>
                        <CardDescription>Core information about this league.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Sport Type</p>
                            {isEditing ? (
                              <Select value={editedData.sportType} onValueChange={(value) => setEditedData({ ...editedData, sportType: value })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="TENNIS">Tennis</SelectItem>
                                  <SelectItem value="PICKLEBALL">Pickleball</SelectItem>
                                  <SelectItem value="PADEL">Padel</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <p className="text-sm font-medium">{sportLabel}</p>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Join Type</p>
                            {isEditing ? (
                              <Select value={editedData.joinType} onValueChange={(value) => setEditedData({ ...editedData, joinType: value })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="OPEN">Open to All</SelectItem>
                                  <SelectItem value="INVITATION">Invitation Only</SelectItem>
                                  <SelectItem value="REQUEST">Request to Join</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <p className="text-sm font-medium">{joinTypeLabel}</p>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Status</p>
                            {isEditing ? (
                              <Select value={editedData.status} onValueChange={(value) => setEditedData({ ...editedData, status: value })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ACTIVE">Active</SelectItem>
                                  <SelectItem value="UPCOMING">Upcoming</SelectItem>
                                  <SelectItem value="ONGOING">Ongoing</SelectItem>
                                  <SelectItem value="FINISHED">Finished</SelectItem>
                                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <p className="text-sm font-medium capitalize">
                                {statusValue ? statusValue.toLowerCase() : "Not set"}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Location</p>
                            {isEditing ? (
                              <Input
                                value={editedData.location}
                                onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
                                placeholder="Enter location"
                              />
                            ) : (
                              <p className="text-sm font-medium">{locationLabel}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconClock className="h-5 w-5" />
                          Timeline
                        </CardTitle>
                        <CardDescription>Key timestamps for this league.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Created</span>
                          <span className="font-medium">{formatDateTime(leagueData.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Last Updated</span>
                          <span className="font-medium">{formatDateTime(leagueData.updatedAt)}</span>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">League ID</p>
                          <code className="mt-1 block rounded bg-muted px-2 py-1 text-xs font-mono">
                            {leagueData.id}
                          </code>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconSettings className="h-5 w-5" />
                        Sponsors
                      </CardTitle>
                      <CardDescription>Manage partners supporting this league.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <LeagueSponsorsSection
                        sponsorships={sponsorships}
                        leagueId={leagueId}
                        onSponsorDeleted={() => {
                          setRefreshTrigger((prev) => prev + 1);
                        }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/*
                <TabsContent value="members" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>League Players</CardTitle>
                      <CardDescription>Player management is temporarily hidden.</CardDescription>
                    </CardHeader>
                  </Card>
                </TabsContent>
                */}

                <TabsContent value="seasons" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconCalendar className="h-5 w-5" />
                        Seasons
                      </CardTitle>
                      <CardDescription>All seasons and tournaments for this league.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <LeagueSeasonsWrapper
                        seasons={seasons}
                        leagueId={leagueId}
                        leagueName={leagueData.name}
                        onRefresh={() => {
                          setActiveTab("seasons");
                          setRefreshTrigger((prev) => prev + 1);
                        }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
