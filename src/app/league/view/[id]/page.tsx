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
import { leagueService } from "@/lib/league-service";

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
  sport: string;
  location: string;
  status: "draft" | "registration" | "active" | "completed" | "cancelled" | "archived";
  playerCount: number;
  maxPlayers: number;
  registrationDeadline: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  createdBy: string;
  divisions: number;
  pendingRequests: number;
  description?: string;
  rules?: string;
  fees?: number;
  currency?: string;
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

// Mock data - this should be dynamic based on league ID
const mockLeagues: { [key: string]: League } = {
  "1": {
    id: "1",
    name: "KL Pickleball Championship",
    sport: "pickleball",
    location: "Kuala Lumpur",
    status: "active",
    playerCount: 32,
    maxPlayers: 32,
    registrationDeadline: "2025-01-10",
    startDate: "2025-01-15",
    endDate: "2025-03-15",
    createdAt: "2024-12-01",
    createdBy: "Admin User",
    divisions: 4,
    pendingRequests: 3,
    description: "Premier pickleball championship in Kuala Lumpur featuring multiple divisions for players of all skill levels. Join us for exciting matches and improve your pickleball skills!",
    rules: "Best of 3 games to 11 points. Must win by 2 points. Service alternates every 2 points. Non-volley zone rules apply.",
    fees: 120,
    currency: "RM"
  },
  "2": {
    id: "2",
    name: "PJ Tennis League",
    sport: "tennis",
    location: "Petaling Jaya",
    status: "registration",
    playerCount: 24,
    maxPlayers: 32,
    registrationDeadline: "2025-01-25",
    startDate: "2025-02-01",
    endDate: "2025-04-01",
    createdAt: "2024-12-15",
    createdBy: "Admin User",
    divisions: 3,
    pendingRequests: 8,
    description: "Competitive tennis league for intermediate to advanced players in Petaling Jaya. Perfect for players looking to improve their game!",
    rules: "Best of 3 sets. Tiebreak at 6-6 in each set. No-ad scoring system. All matches must be played within scheduled timeframe.",
    fees: 120,
    currency: "RM"
  },
  "3": {
    id: "3",
    name: "Subang Table Tennis Pro",
    sport: "table tennis",
    location: "Subang Jaya",
    status: "completed",
    playerCount: 28,
    maxPlayers: 28,
    registrationDeadline: "2024-09-15",
    startDate: "2024-10-01",
    endDate: "2024-12-01",
    createdAt: "2024-08-15",
    createdBy: "Admin User",
    divisions: 3,
    pendingRequests: 0,
    description: "Professional table tennis tournament with prize pool and sponsor support. Completed season with great success!",
    rules: "Best of 5 sets to 11 points. 2-point advantage required. Service alternates every 2 points. Professional tournament rules apply.",
    fees: 100,
    currency: "RM"
  }
};

const mockPlayers: Player[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    rating: 4.2,
    division: "Advanced",
    joinedAt: "2024-01-05",
    matchesPlayed: 8,
    wins: 6,
    losses: 2,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    rating: 3.8,
    division: "Intermediate",
    joinedAt: "2024-01-06",
    matchesPlayed: 6,
    wins: 4,
    losses: 2,
  },
  // Add more mock players...
];

const mockDivisions: Division[] = [
  {
    id: "1",
    name: "Beginner",
    minRating: 0,
    maxRating: 2.5,
    playerCount: 6,
    maxPlayers: 10,
    status: "active",
  },
  {
    id: "2",
    name: "Intermediate",
    minRating: 2.5,
    maxRating: 4.0,
    playerCount: 10,
    maxPlayers: 12,
    status: "active",
  },
  {
    id: "3",
    name: "Advanced",
    minRating: 4.0,
    maxRating: 7.0,
    playerCount: 8,
    maxPlayers: 10,
    status: "active",
  },
];

// Helper functions
const getLocationLabel = (locationValue: string) => {
  return LOCATION_OPTIONS.find(loc => loc.value === locationValue)?.label || locationValue;
};

const getSportLabel = (sportValue: string) => {
  const sports: Record<string, string> = {
    "tennis": "Tennis",
    "pickleball": "Pickleball", 
    "padel": "Padel",
    "badminton": "Badminton",
    "table-tennis": "Table Tennis"
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
        const response = await leagueService.getLeagueById(leagueId);
        const leagueData = response.data.league;

        if (!leagueData) {
          toast.error("League not found");
          router.push("/league");
          return;
        }

        // Transform backend data to match component interface
        const transformedLeague: League = {
          id: leagueData.id,
          name: leagueData.name,
          sport: leagueData.sport.toLowerCase(),
          location: leagueData.location,
          status: leagueData.status.toLowerCase() as any,
          playerCount: 0, // TODO: Get from backend when available
          maxPlayers: leagueData.settings?.maxPlayersPerDivision || 32,
          registrationDeadline: leagueData.createdAt, // TODO: Get actual deadline
          startDate: leagueData.createdAt,
          endDate: leagueData.updatedAt,
          createdAt: leagueData.createdAt,
          createdBy: "Admin User", // TODO: Get from backend
          divisions: 0, // TODO: Get count from backend
          pendingRequests: leagueData._count?.joinRequests || 0,
          description: leagueData.description,
          rules: leagueData.settings?.customRulesText,
          fees: leagueData.settings?.paymentSettings?.fees?.flat || 0,
          currency: leagueData.settings?.paymentSettings?.fees?.currency || "RM",
        };

        setLeague(transformedLeague);
        // TODO: Fetch players and divisions when endpoints are ready
        setPlayers(mockPlayers);
        setDivisions(mockDivisions);
      } catch (error: any) {
        console.error("Error loading league data:", error);
        toast.error(error?.response?.data?.message || "Failed to load league details");
        // Fallback to mock data
        const leagueData = mockLeagues[leagueId];
        if (leagueData) {
          setLeague(leagueData);
          setPlayers(mockPlayers);
          setDivisions(mockDivisions);
        } else {
          router.push("/league");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (leagueId) {
      loadData();
    }
  }, [leagueId, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "registration":
        return <Badge variant="secondary">Registration Open</Badge>;
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "completed":
        return <Badge variant="outline">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "archived":
        return <Badge variant="secondary">Archived</Badge>;
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

  const registrationProgress = (league.playerCount / league.maxPlayers) * 100;

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
                            {getLocationLabel(league.location)}
                          </span>
                          <span className="flex items-center gap-1">
                            <IconTrophy className="size-4" />
                            {getSportLabel(league.sport)}
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
                        {league.pendingRequests > 0 && (
                          <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                            {league.pendingRequests}
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
                              <p className="text-2xl font-bold">{league.playerCount}</p>
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
                              <p className="text-2xl font-bold">{league.divisions}</p>
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
                              <p className="text-2xl font-bold">{league.pendingRequests}</p>
                              <p className="text-sm text-muted-foreground">Pending Requests</p>
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
                              <Badge variant="outline">{getSportLabel(league.sport)}</Badge>
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
                              <span className="text-muted-foreground">Created By:</span>
                              <span>{league.createdBy}</span>
                            </div>
                            {league.fees && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Entry Fee:</span>
                                <span>{league.currency} {league.fees}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Registration Progress */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Registration Status</CardTitle>
                          <CardDescription>
                            Current player enrollment progress
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Players Registered</span>
                              <span>{league.playerCount} / {league.maxPlayers}</span>
                            </div>
                            <Progress value={registrationProgress} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                              {league.maxPlayers - league.playerCount} spots remaining
                            </p>
                          </div>
                          
                          <Separator />
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Registration Deadline:</span>
                              <span>{formatDate(league.registrationDeadline)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>League Start:</span>
                              <span>{formatDate(league.startDate)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>League End:</span>
                              <span>{formatDate(league.endDate)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Description and Rules */}
                    {(league.description || league.rules) && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {league.description && (
                          <Card>
                            <CardHeader>
                              <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm leading-relaxed">{league.description}</p>
                            </CardContent>
                          </Card>
                        )}
                        
                        {league.rules && (
                          <Card>
                            <CardHeader>
                              <CardTitle>League Rules</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm leading-relaxed">{league.rules}</p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
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
                                <span>{getSportLabel(league.sport)}</span>
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
                            <h4 className="font-semibold">Timeline</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Created:</span>
                                <span>{formatDate(league.createdAt)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Registration Deadline:</span>
                                <span>{formatDate(league.registrationDeadline)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Start Date:</span>
                                <span>{formatDate(league.startDate)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">End Date:</span>
                                <span>{formatDate(league.endDate)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Created By:</span>
                                <span>{league.createdBy}</span>
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
