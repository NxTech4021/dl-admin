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
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { endpoints } from "@/lib/endpoints";
import { toast } from "sonner";
import { LeaguePlayersTable, LeaguePlayerRow } from "@/components/league/league-players-table";
import LeagueSponsorsSection from "@/components/league/league-sponsors-section";
import { LeagueLeaderboard } from "@/components/league/league-leaderboard";
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
  IconTarget,
  IconCheck,
  IconCalendar,
  IconActivity,
  IconFlame,
  IconEdit,
  IconX,
  IconUser
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
    PADEL: "Padel"
  };
  return map[sport] || sport;
}


function getGameTypeOptionsForSport(sport: string): { value: string; label: string }[] {
  switch (sport) {
    case "TENNIS":
      return [
        { value: "SINGLES", label: "Singles" },
        { value: "DOUBLES", label: "Doubles" },
        { value: "MIXED", label: "Mixed Doubles" },
      ];
    case "PADEL":
      return [
        { value: "DOUBLES", label: "Doubles" },
        { value: "MIXED", label: "Mixed Doubles" },
        { value: "SINGLES", label: "Singles" },
      ];
    case "PICKLEBALL":
      return [
        { value: "SINGLES", label: "Singles" },
        { value: "DOUBLES", label: "Doubles" },
        { value: "MIXED", label: "Mixed Doubles" },
      ];
    default:
      return [
        { value: "SINGLES", label: "Singles" },
        { value: "DOUBLES", label: "Doubles" },
        { value: "MIXED", label: "Mixed Doubles" },
      ];
  }
}
function getGameTypeLabel(gameType: string) {
  const map: Record<string, string> = {
    SINGLES: "Singles",
    DOUBLES: "Doubles",
    MIXED: "Mixed Doubles",
    singles: "Singles",
    doubles: "Doubles",
    mixed: "Mixed Doubles"
  };
  return map[gameType] || gameType;
}

function getJoinTypeValue(label: string) {
  const reverseMap: Record<string, string> = {
    "Singles": "SINGLES",
    "Doubles": "DOUBLES",
    "Mixed Doubles": "MIXED"
  };
  return reverseMap[label] || label;
}

function getJoinTypeLabel(joinType: string) {
  const map: Record<string, string> = {
    OPEN: "Open to All",
    INVITATION: "Invitation Only",
    REQUEST: "Request to Join",
    open: "Open to All",
    invitation: "Invitation Only",
    request: "Request to Join"
  };
  return map[joinType] || joinType;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "short", 
    day: "numeric" 
  });
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "short", 
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

async function getLeague(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_HOST_URL || 'http://localhost:82';
    const url = `${baseUrl}${endpoints.league.getById(id)}`;
    
    console.log('Fetching league from:', url);
    
    const res = await fetch(url, {
      cache: "no-store",
      next: { revalidate: 0 },
      credentials: 'include',
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

function transformPlayers(memberships: any[]): LeaguePlayerRow[] {
  return (memberships || []).map((membership: any) => ({
    id: membership.user?.id,
    name: membership.user?.name || membership.user?.email?.split("@")[0] || "Unknown",
    displayUsername: membership.user?.username ?? null,
    email: membership.user?.email || "",
    image: membership.user?.image ?? null,
    area: membership.user?.area ?? null,
    registeredDate: membership.createdAt ?? null,
    ratings: membership.user?.ratings ?? null,
  }));
}

export default function LeagueViewPage({ params }: { params: Promise<{ id: string }> }) {
  const leagueId = React.use(params).id;
  const [leagueData, setLeagueData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch league data
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
            gameType: data.gameType || "SINGLES",
            joinType: data.joinType || "OPEN",
            status: data.status || "ACTIVE",
            categoryName: data.categoryName || "",
            matchFormat: data.matchFormat || "",
            maxPlayers: data.maxPlayers || 0,
            maxTeams: data.maxTeams || 0,
            divisionsCount: data.divisionsCount || 0,
            genderRestriction: data.genderRestriction || "OPEN",
          });
        }
      })
      .finally(() => setIsLoading(false));
  }, [leagueId]);

  // Auto-sync game type and default category when sport type changes in edit mode
  React.useEffect(() => {
    if (!leagueData) return;
    const sport = (editedData.sportType || leagueData.sportType) as string;
    const gameOptions = getGameTypeOptionsForSport(sport);
    if (!gameOptions.some((o) => o.value === editedData.gameType)) {
      setEditedData((prev: any) => ({ ...prev, gameType: gameOptions[0]?.value || "SINGLES" }));
    }
  }, [editedData.sportType, leagueData]);
  
  const handleSave = async () => {
    try {
      // Validate league name length
      if (editedData.name.length > 30) {
        toast.error('League name cannot exceed 30 characters');
        return;
      }
      
      // TODO: Implement API call to save changes
      console.log("Saving:", editedData);
      setIsEditing(false);
      // Update leagueData with edited values
      setLeagueData({ ...leagueData, ...editedData });
      toast.success('League updated successfully');
    } catch (error) {
      console.error("Failed to save:", error);
      toast.error('Failed to save changes');
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    // Reset edited data to original
    if (leagueData) {
      setEditedData({
        name: leagueData.name,
        description: leagueData.description || "",
        location: leagueData.location || "",
        sportType: leagueData.sportType || "TENNIS",
        gameType: leagueData.gameType || "SINGLES",
        joinType: leagueData.joinType || "OPEN",
        status: leagueData.status || "ACTIVE",
        categoryName: leagueData.categoryName || "",
        matchFormat: leagueData.matchFormat || "",
        maxPlayers: leagueData.maxPlayers || 0,
        maxTeams: leagueData.maxTeams || 0,
        divisionsCount: leagueData.divisionsCount || 0,
        genderRestriction: leagueData.genderRestriction || "OPEN",
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

  // Add competition settings to league data if not present
  if (!leagueData.categoryName) {
    leagueData.categoryName = 'Open Singles';
  }
  if (!leagueData.matchFormat) {
    leagueData.matchFormat = 'Best of 3 sets';
  }
  if (!leagueData.maxPlayers) {
    leagueData.maxPlayers = 32;
  }
  if (!leagueData.maxTeams) {
    leagueData.maxTeams = 16;
  }
  if (!leagueData.divisionsCount) {
    leagueData.divisionsCount = 3;
  }
  if (!leagueData.genderRestriction) {
    leagueData.genderRestriction = 'OPEN';
  }

  const members = leagueData.memberships || [];
  const seasons = leagueData.seasons || [];
  const divisions = leagueData.divisions || [];
  const categories = leagueData.categories || [];
  const sponsorships = leagueData.sponsorships || [];

  // Debug: Log sponsorships data
  console.log("League sponsorships data:", sponsorships);
  console.log("League data structure:", leagueData);
  console.log("Sponsorships length:", sponsorships.length);

  if (!leagueData._count) {
    leagueData._count = {
      memberships: members.length,
      seasons: seasons.length
    };
  }
  // Description comes from API, no default needed

  const players: LeaguePlayerRow[] = transformPlayers(members);

  return (
    <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 56)", "--header-height": "calc(var(--spacing) * 12)" } as any}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader items={[{ label: "League", href: "/league" }, { label: leagueData.name }]} />

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col">
            <Tabs defaultValue="overview" className="flex flex-1 flex-col">
              {/* Hero Header */}
              <div className="bg-gradient-to-r from-background to-muted/20">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                    </div>
                    <div className="flex-1" />
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-6">
                

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-7">
                  {/* Top row: Quick Info (left) + Description (right, shortened) */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Quick Info (left) - text only, no card */}
                    <div className="space-y-4 ml-2 md:ml-10 mt-10">
                      <div className="flex items-center gap-3 flex-wrap">
                        {isEditing ? (
                          <>
                            <Input
                              value={editedData.name}
                              onChange={(e) => {
                                const text = e.target.value;
                                if (text.length <= 30) {
                                  setEditedData({ ...editedData, name: text });
                                } else {
                                  toast.error('League name cannot exceed 34 characters');
                                }
                              }}
                              className="text-5xl font-bold tracking-tight h-auto py-0 px-0 border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent min-h-[4rem] leading-tight"
                              style={{ fontSize: '3rem', lineHeight: '1.1' }}
                              placeholder="League Name"
                            />
                            {getStatusBadge(leagueData.status)}
                          </>
                        ) : (
                          <>
                            <h1 className="text-5xl font-bold tracking-tight">{leagueData.name}</h1>
                            {getStatusBadge(leagueData.status)}
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="gap-2 px-3 py-1 text-sm">
                          <IconTrophy className="w-4 h-4" />
                          {getSportLabel(isEditing ? editedData.sportType : leagueData.sportType)}
                        </Badge>
                        <Badge variant="secondary" className="gap-2 px-3 py-1 text-sm">
                          <IconUsers className="w-4 h-4" />
                          {getGameTypeOptionsForSport(isEditing ? editedData.sportType : leagueData.sportType).find(o => o.value === (isEditing ? editedData.gameType : leagueData.gameType))?.label || getGameTypeLabel(isEditing ? editedData.gameType : leagueData.gameType)}
                        </Badge>
                        {(isEditing ? editedData.categoryName : leagueData.categoryName) && (
                          <Badge variant="secondary" className="gap-2 px-3 py-1 text-sm">
                            <IconTarget className="w-4 h-4" />
                            {isEditing ? editedData.categoryName : leagueData.categoryName}
                          </Badge>
                        )}
                        {(leagueData.genderRestriction || (isEditing && editedData.genderRestriction)) && (
                          <Badge variant="secondary" className="gap-2 px-3 py-1 text-sm">
                            <IconUser className="w-4 h-4" />
                            {(() => {
                              const g = (isEditing ? editedData.genderRestriction : leagueData.genderRestriction) || "OPEN";
                              return g === "OPEN" ? "Open" : g === "MALE" ? "Male" : g === "FEMALE" ? "Female" : g === "MIXED" ? "Mixed" : g;
                            })()}
                          </Badge>
                        )}
                        {leagueData.joinType && (
                          <Badge variant="secondary" className="gap-2 px-3 py-1 text-sm">
                            <IconInfoCircle className="w-4 h-4" />
                            {getJoinTypeLabel(isEditing ? editedData.joinType : leagueData.joinType)}
                          </Badge>
                        )}
                        {(leagueData.location || (isEditing && editedData.location)) && (
                          <Badge variant="secondary" className="gap-2 px-3 py-1 text-sm">
                            <IconMapPin className="w-4 h-4" />
                            {isEditing ? editedData.location : leagueData.location}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Right column: Tabs bar aligned to description width + description card */}
                    <div>
                      <div className="mb-4 flex items-center justify-end gap-4">
                        <Button asChild variant="ghost" size="sm">
                          <a href="/league">← Back</a>
                        </Button>
                        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                          <TabsTrigger value="overview" className="gap-2">
                            <IconInfoCircle className="w-4 h-4" />
                            Overview
                          </TabsTrigger>
                          <TabsTrigger value="members" className="gap-2">
                            <IconUsers className="w-4 h-4" />
                            Players
                            <Badge variant="secondary" className="ml-1">{members.length}</Badge>
                          </TabsTrigger>
                          <TabsTrigger value="seasons" className="gap-2">
                            <IconCalendar className="w-4 h-4" />
                            Seasons
                            <Badge variant="secondary" className="ml-1">{seasons.length}</Badge>
                          </TabsTrigger>
                        </TabsList>
                        {isEditing ? (
                          <>
                            <Button size="sm" className="gap-2 bg-black hover:bg-black/90 text-white" onClick={handleSave}>
                              <IconCheck className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2" onClick={handleCancel}>
                              <IconX className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsEditing(true)}>
                            <IconEdit className="w-4 h-4" />
                            Edit
                          </Button>
                        )}
                      </div>
                      <Card>
                        <CardHeader>
                          <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent className="max-h-40 overflow-y-auto">
                          {isEditing ? (
                            <Textarea
                              value={editedData.description}
                              onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                              className="min-h-[100px] text-muted-foreground leading-relaxed"
                              placeholder="Enter league description..."
                            />
                          ) : (
                            <p className="text-muted-foreground leading-relaxed">
                              {leagueData.description || "No description provided"}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Key Metrics removed as requested */}


                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconInfoCircle className="w-5 h-5" />
                          League Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
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
                              <p className="font-medium">{getSportLabel(leagueData.sportType)}</p>
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
                              <p className="font-medium">{leagueData.joinType ? getJoinTypeLabel(leagueData.joinType) : "Not set"}</p>
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
                              <p className="font-medium capitalize">{leagueData.status.toLowerCase()}</p>
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
                              <p className="font-medium">{leagueData.location || "Not specified"}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconClock className="w-5 h-5" />
                          Timeline
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Created</span>
                            <span className="text-sm font-medium">{formatDateTime(leagueData.createdAt)}</span>
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Last Updated</span>
                            <span className="text-sm font-medium">{formatDateTime(leagueData.updatedAt)}</span>
                          </div>
                          <Separator />
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">League ID</p>
                            <code className="text-xs bg-muted px-2 py-1 rounded block font-mono">
                              {leagueData.id}
                            </code>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Competition Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconSettings className="w-5 h-5" />
                        League Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {/* Category free text with hint */}
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Category</p>
                          {isEditing ? (
                            <Input
                              value={editedData.categoryName}
                              onChange={(e) => setEditedData({ ...editedData, categoryName: e.target.value })}
                              placeholder="e.g., Junior Singles"
                            />
                          ) : (
                            <p className="font-medium">{leagueData.categoryName || "Not set"}</p>
                          )}
                        </div>
                        {/* Game Type dropdown (renamed from previous sport-aware Category) */}
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Game Type</p>
                          {isEditing ? (
                            <Select value={editedData.gameType} onValueChange={(value) => setEditedData({ ...editedData, gameType: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {getGameTypeOptionsForSport(editedData.sportType || leagueData.sportType).map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="font-medium">{
                              getGameTypeOptionsForSport(leagueData.sportType).find(o => o.value === leagueData.gameType)?.label || getGameTypeLabel(leagueData.gameType)
                            }</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Match Format</p>
                          {isEditing ? (
                            <Input
                              value={editedData.matchFormat}
                              onChange={(e) => setEditedData({ ...editedData, matchFormat: e.target.value })}
                              placeholder="e.g., Best of 3 sets"
                            />
                          ) : (
                            <p className="font-medium">{leagueData.matchFormat || "Not set"}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Max Players</p>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editedData.maxPlayers}
                              onChange={(e) => setEditedData({ ...editedData, maxPlayers: parseInt(e.target.value) || 0 })}
                              placeholder="0 for unlimited"
                            />
                          ) : (
                            <p className="font-medium">{leagueData.maxPlayers || "Unlimited"}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Max Teams</p>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editedData.maxTeams}
                              onChange={(e) => setEditedData({ ...editedData, maxTeams: parseInt(e.target.value) || 0 })}
                              placeholder="0 for unlimited"
                            />
                          ) : (
                            <p className="font-medium">{leagueData.maxTeams || "Unlimited"}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Divisions</p>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editedData.divisionsCount}
                              onChange={(e) => setEditedData({ ...editedData, divisionsCount: parseInt(e.target.value) || 0 })}
                              placeholder="Number of divisions"
                            />
                          ) : (
                            <p className="font-medium">{leagueData.divisions?.length || leagueData.divisionsCount || "Not set"}</p>
                          )}
                        </div>
                        {/* Gender relocated here */}
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Gender Restriction</p>
                          {isEditing ? (
                            <Select value={editedData.genderRestriction} onValueChange={(value) => setEditedData({ ...editedData, genderRestriction: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="OPEN">Open</SelectItem>
                                <SelectItem value="MALE">Male Only</SelectItem>
                                <SelectItem value="FEMALE">Female Only</SelectItem>
                                <SelectItem value="MIXED">Mixed</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant="outline" className="mt-1">
                              {leagueData.genderRestriction === 'OPEN' ? 'Open' : 
                               leagueData.genderRestriction === 'MALE' ? 'Male Only' : 
                               leagueData.genderRestriction === 'FEMALE' ? 'Female Only' : 
                               leagueData.genderRestriction === 'MIXED' ? 'Mixed' : 'Not set'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Sponsors Section */}
                      <Separator />
                      <LeagueSponsorsSection sponsorships={sponsorships} leagueId={leagueId} />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Players Tab */}
                <TabsContent value="members" className="space-y-6">
                  <div className="flex items-center justify-end gap-4">
                    <Button asChild variant="ghost" size="sm">
                      <a href="/league">← Back</a>
                    </Button>
                    <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                      <TabsTrigger value="overview" className="gap-2">
                        <IconInfoCircle className="w-4 h-4" />
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="members" className="gap-2">
                        <IconUsers className="w-4 h-4" />
                        Players
                        <Badge variant="secondary" className="ml-1">{members.length}</Badge>
                      </TabsTrigger>
                      <TabsTrigger value="seasons" className="gap-2">
                        <IconCalendar className="w-4 h-4" />
                        Seasons
                        <Badge variant="secondary" className="ml-1">{seasons.length}</Badge>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>League Players</CardTitle>
                      <CardDescription>
                        All registered players with their sport ratings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <LeaguePlayersTable players={players} leagueId={leagueId} />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Seasons Tab */}
                <TabsContent value="seasons" className="space-y-6">
                  <div className="flex items-center justify-end gap-4">
                    <Button asChild variant="ghost" size="sm">
                      <a href="/league">← Back</a>
                    </Button>
                    <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                      <TabsTrigger value="overview" className="gap-2">
                        <IconInfoCircle className="w-4 h-4" />
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="members" className="gap-2">
                        <IconUsers className="w-4 h-4" />
                        Players
                        <Badge variant="secondary" className="ml-1">{members.length}</Badge>
                      </TabsTrigger>
                      <TabsTrigger value="seasons" className="gap-2">
                        <IconCalendar className="w-4 h-4" />
                        Seasons
                        <Badge variant="secondary" className="ml-1">{seasons.length}</Badge>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>League Seasons</CardTitle>
                      <CardDescription>
                        All seasons and tournaments for this league
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <LeagueSeasonsWrapper seasons={seasons} leagueId={leagueId} />
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
