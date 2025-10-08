"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  IconArrowLeft,
  IconTrophy,
  IconUsers,
  IconUser,
  IconCalendar,
  IconMapPin,
  IconEdit,
  IconStar,
  IconClock,
  IconTarget,
  IconTrendingUp,
  IconEye,
  IconUserCheck,
  IconUserX,
  IconCopy,
  IconDownload,
  IconShare
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import axiosInstance, { endpoints } from "@/lib/endpoints";

// Location options for label mapping
const LOCATION_OPTIONS = [
  { value: "kuala-lumpur", label: "Kuala Lumpur" },
  { value: "petaling-jaya", label: "Petaling Jaya" },
  { value: "subang-jaya", label: "Subang Jaya" },
  { value: "shah-alam", label: "Shah Alam" },
  { value: "klang", label: "Klang" },
  { value: "ampang", label: "Ampang" },
  { value: "cheras", label: "Cheras" },
  { value: "puchong", label: "Puchong" },
  { value: "cyberjaya", label: "Cyberjaya" },
  { value: "putrajaya", label: "Putrajaya" },
];
 

interface League {
  id: string;
  name: string;
  sportType: string;
  location: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "UPCOMING" | "ONGOING" | "FINISHED" | "CANCELLED";
  registrationType: "OPEN" | "INVITE_ONLY" | "MANUAL";
  gameType: "SINGLES" | "DOUBLES";
  createdAt: string;
  updatedAt: string;
  description?: string | null;
  memberCount?: number;
  seasonCount?: number;
  categoryCount?: number;
}

interface Player {
  id: string;
  name: string;
  email: string;
  rating: number;
  division: string;
  joinedAt: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
}

interface Division {
  id: string;
  name: string;
  minRating: number;
  maxRating: number;
  playerCount: number;
  maxPlayers: number;
  status: string;
}

// Helper functions for data formatting
const getLocationLabel = (locationValue: string) => {
  return LOCATION_OPTIONS.find(loc => loc.value === locationValue)?.label || locationValue;
};

const getSportLabel = (sportValue: string) => {
  const sports: Record<string, string> = {
    "tennis": "Tennis",
    "pickleball": "Pickleball", 
    "padel": "Padel",
    "badminton": "Badminton",
    "table-tennis": "Table Tennis",
    "PICKLEBALL": "Pickleball",
    "TENNIS": "Tennis",
    "PADDLE": "Padel"
  };
  return sports[sportValue] || sportValue;
};

export default function LeagueViewPage() {
  const router = useRouter();
  const params = useParams();
  const leagueId = params.id as string;

  const [league, setLeague] = useState<League | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch league data from API
        const response = await axiosInstance.get(endpoints.league.getById(leagueId));
        
        if (!response.data || !response.data.data || !response.data.data.league) {
          toast.error("League not found");
          return;
        }
        
        const leagueData = response.data.data.league;
        
        // Transform the data to match our interface
        const transformedLeague: League = {
          id: leagueData.id,
          name: leagueData.name,
          sportType: leagueData.sportType,
          location: leagueData.location,
          status: leagueData.status,
          registrationType: leagueData.registrationType,
          gameType: leagueData.gameType,
          createdAt: leagueData.createdAt,
          updatedAt: leagueData.updatedAt,
          description: leagueData.description,
          memberCount: leagueData._count?.memberships || 0,
          seasonCount: leagueData._count?.seasons || 0,
          categoryCount: leagueData._count?.categories || 0,
        };
        
        setLeague(transformedLeague);
        
        // TODO: Fetch players and divisions data when those endpoints are available
        setPlayers([]);
        setDivisions([]);
      } catch (error) {
        console.error("Error loading league data:", error);
        toast.error("Failed to load league details");
      } finally {
        setIsLoading(false);
      }
    };

    if (leagueId) {
      loadData();
    }
  }, [leagueId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
      case "ONGOING":
        return <Badge variant="default">Active</Badge>;
      case "UPCOMING":
        return <Badge variant="secondary">Upcoming</Badge>;
      case "FINISHED":
        return <Badge variant="outline">Finished</Badge>;
      case "INACTIVE":
        return <Badge variant="outline">Inactive</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "SUSPENDED":
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSportLabel = (sport: string) => {
    const sportLabels: Record<string, string> = {
      tennis: "Tennis",
      pickleball: "Pickleball",
      padel: "Padel",
    };
    return sportLabels[sport] || sport;
  };

  const calculateWinRate = (wins: number, losses: number) => {
    const total = wins + losses;
    return total > 0 ? Math.round((wins / total) * 100) : 0;
  };

  if (isLoading) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="size-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Loading league details...</span>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!league) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">League Not Found</h2>
              <p className="text-muted-foreground mb-4">The requested league could not be found.</p>
              <Button onClick={() => router.push("/league")}>
                Back to Leagues
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const registrationProgress = league.memberCount ? (league.memberCount / (league.memberCount + 10)) * 100 : 0;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader items={[{ label: "League", href: "/league" }, { label: league ? league.name : "Details" }]} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6">
              {/* Page Header */}
              <div className="border-b bg-white">
                <div className="px-4 lg:px-6 py-6">
                  <div className="flex flex-col gap-6">
                    {/* Back Button */}
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/league")}
                        className="bg-white border-gray-200 hover:bg-gray-50"
                      >
                        <IconArrowLeft className="size-4 mr-2" />
                        Back to Dashboard
                      </Button>
                    </div>

                    {/* League Info */}
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        <IconTrophy className="size-8 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{league.name}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <IconMapPin className="size-4" />
                            {getLocationLabel(league.location || "")}
                          </span>
                          <span className="flex items-center gap-1">
                            <IconTrophy className="size-4" />
                            {getSportLabel(league.sportType)}
                          </span>
                          {getStatusBadge(league.status)}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        onClick={() => router.push(`/league/edit/${league.id}`)}
                        className="bg-gray-900 hover:bg-gray-800 text-white"
                      >
                        <IconEdit className="size-4 mr-2" />
                        Edit League
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/league/matches/${league.id}`)}
                        className="bg-white border-gray-200 hover:bg-gray-50"
                      >
                        <IconTarget className="size-4 mr-2" />
                        Matches
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/league/leaderboard/${league.id}`)}
                        className="bg-white border-gray-200 hover:bg-gray-50"
                      >
                        <IconStar className="size-4 mr-2" />
                        Leaderboard
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/league/players/${league.id}`)}
                        className="bg-white border-gray-200 hover:bg-gray-50"
                      >
                        <IconUsers className="size-4 mr-2" />
                        Players
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/league/profiles/${league.id}`)}
                        className="bg-white border-gray-200 hover:bg-gray-50"
                      >
                        <IconUser className="size-4 mr-2" />
                        Profiles
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/league/requests/${league.id}`)}
                        className="bg-white border-gray-200 hover:bg-gray-50"
                      >
                        <IconUserCheck className="size-4 mr-2" />
                        Requests
                        {league.memberCount && league.memberCount > 0 && (
                          <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                            {league.memberCount} members
                          </Badge>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success("League link copied to clipboard");
                        }}
                        className="bg-white border-gray-200 hover:bg-gray-50"
                      >
                        <IconShare className="size-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="flex-1 px-4 lg:px-6 py-6">
                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="players">Players</TabsTrigger>
                    <TabsTrigger value="divisions">Divisions</TabsTrigger>
                    <TabsTrigger value="settings">Details</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2">
                            <IconUsers className="size-5 text-blue-500" />
                            <div>
                              <p className="text-2xl font-bold">{league.memberCount || 0}</p>
                              <p className="text-sm text-muted-foreground">Total Players</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2">
                            <IconTarget className="size-5 text-green-500" />
                            <div>
                              <p className="text-2xl font-bold">{league.categoryCount || 0}</p>
                              <p className="text-sm text-muted-foreground">Divisions</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2">
                            <IconClock className="size-5 text-yellow-500" />
                            <div>
                              <p className="text-2xl font-bold">{league.seasonCount || 0}</p>
                              <p className="text-sm text-muted-foreground">Seasons</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2">
                            <IconTrendingUp className="size-5 text-purple-500" />
                            <div>
                              <p className="text-2xl font-bold">{Math.round(registrationProgress)}%</p>
                              <p className="text-sm text-muted-foreground">Registration</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* League Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle>League Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Sport:</span>
                              <Badge variant="outline">{getSportLabel(league.sportType)}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Location:</span>
                              <span>{league.location}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Status:</span>
                              {getStatusBadge(league.status)}
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Created:</span>
                              <span>{formatDate(league.createdAt)}</span>
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
                          </div>
                        </CardContent>
                      </Card>

                      {/* Description */}
                      {league.description && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Description</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground">{league.description}</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  {/* Players Tab */}
                  <TabsContent value="players" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>League Players</CardTitle>
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
                              <div key={player.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                  <div className="p-2 bg-primary/10 rounded-lg">
                                    <IconUsers className="size-5 text-primary" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">{player.name}</h4>
                                    <p className="text-sm text-muted-foreground">{player.email}</p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                      <span className="flex items-center gap-1">
                                        <IconStar className="size-3" />
                                        {player.rating} rating
                                      </span>
                                      <span>{player.division} Division</span>
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

                  {/* Divisions Tab */}
                  <TabsContent value="divisions" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {divisions.map((division) => (
                        <Card key={division.id}>
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              {division.name}
                              <Badge variant="outline">{division.status}</Badge>
                            </CardTitle>
                            <CardDescription>
                              Rating: {division.minRating} - {division.maxRating}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span>Players:</span>
                                <span>{division.playerCount} / {division.maxPlayers}</span>
                              </div>
                              <Progress 
                                value={(division.playerCount / division.maxPlayers) * 100} 
                                className="h-2" 
                              />
                              <p className="text-xs text-muted-foreground">
                                {division.maxPlayers - division.playerCount} spots available
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Details Tab */}
                  <TabsContent value="settings" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>League Details</CardTitle>
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
                                <span>{league.location}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Status:</span>
                                {getStatusBadge(league.status)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <h4 className="font-semibold">League Info</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Created:</span>
                                <span>{formatDate(league.createdAt)}</span>
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
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
