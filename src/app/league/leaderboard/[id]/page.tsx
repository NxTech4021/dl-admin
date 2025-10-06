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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  IconArrowLeft,
  IconTrophy,
  IconUsers,
  IconTarget,
  IconStar,
  IconTrendingUp,
  IconEdit,
  IconRefresh,
  IconDownload,
  IconSettings,
  IconMedal,
  IconCrown
} from "@tabler/icons-react";
import { toast } from "sonner";
 

interface LeaderboardEntry {
  id: string;
  playerId: string;
  playerName: string;
  division: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  points: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  winPercentage: number;
  setDifference: number;
  gameDifference: number;
  rank: number;
  previousRank?: number;
  form: string[]; // Last 5 match results: 'W' or 'L'
  lastUpdated: string;
}

interface League {
  id: string;
  name: string;
  sport: string;
  location: string;
  status: string;
}

// Mock league lookup to reflect the requested league id
const mockLeaguesById: Record<string, League> = {
  "1": { id: "1", name: "KL Tennis Championship", sport: "tennis", location: "Kuala Lumpur", status: "active" },
  "2": { id: "2", name: "PJ Tennis League", sport: "tennis", location: "Petaling Jaya", status: "registration" },
  "3": { id: "3", name: "Subang Table Tennis Pro", sport: "table-tennis", location: "Subang Jaya", status: "completed" },
};

const mockLeaderboard: LeaderboardEntry[] = [
  {
    id: "1",
    playerId: "p3",
    playerName: "Mike Davis",
    division: "Division A",
    matchesPlayed: 8,
    wins: 7,
    losses: 1,
    points: 21,
    setsWon: 15,
    setsLost: 4,
    gamesWon: 96,
    gamesLost: 62,
    winPercentage: 87.5,
    setDifference: 11,
    gameDifference: 34,
    rank: 1,
    previousRank: 2,
    form: ['W', 'W', 'W', 'L', 'W'],
    lastUpdated: "2024-01-26T16:30:00Z",
  },
  {
    id: "2",
    playerId: "p1",
    playerName: "John Smith",
    division: "Division A",
    matchesPlayed: 7,
    wins: 6,
    losses: 1,
    points: 18,
    setsWon: 13,
    setsLost: 5,
    gamesWon: 84,
    gamesLost: 58,
    winPercentage: 85.7,
    setDifference: 8,
    gameDifference: 26,
    rank: 2,
    previousRank: 1,
    form: ['W', 'W', 'W', 'W', 'L'],
    lastUpdated: "2024-01-25T12:00:00Z",
  },
  {
    id: "3",
    playerId: "p5",
    playerName: "Alex Wilson",
    division: "Division A",
    matchesPlayed: 6,
    wins: 4,
    losses: 2,
    points: 12,
    setsWon: 9,
    setsLost: 7,
    gamesWon: 72,
    gamesLost: 68,
    winPercentage: 66.7,
    setDifference: 2,
    gameDifference: 4,
    rank: 3,
    previousRank: 3,
    form: ['W', 'L', 'W', 'W', 'L'],
    lastUpdated: "2024-01-24T14:00:00Z",
  },
  {
    id: "4",
    playerId: "p2",
    playerName: "Sarah Johnson",
    division: "Division A",
    matchesPlayed: 6,
    wins: 3,
    losses: 3,
    points: 9,
    setsWon: 8,
    setsLost: 8,
    gamesWon: 68,
    gamesLost: 72,
    winPercentage: 50.0,
    setDifference: 0,
    gameDifference: -4,
    rank: 4,
    previousRank: 4,
    form: ['L', 'W', 'L', 'W', 'L'],
    lastUpdated: "2024-01-23T10:00:00Z",
  },
  {
    id: "5",
    playerId: "p4",
    playerName: "Emily Brown",
    division: "Division A",
    matchesPlayed: 5,
    wins: 1,
    losses: 4,
    points: 3,
    setsWon: 3,
    setsLost: 9,
    gamesWon: 42,
    gamesLost: 78,
    winPercentage: 20.0,
    setDifference: -6,
    gameDifference: -36,
    rank: 5,
    previousRank: 5,
    form: ['L', 'L', 'W', 'L', 'L'],
    lastUpdated: "2024-01-22T16:00:00Z",
  },
];

export default function LeaderboardPage() {
  const router = useRouter();
  const params = useParams();
  const leagueId = params.id as string;

  const [league, setLeague] = useState<League | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [manualAdjustment, setManualAdjustment] = useState({
    points: 0,
    reason: "",
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API calls
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Resolve league details based on the URL id
        const resolvedLeague = mockLeaguesById[leagueId] ?? { id: leagueId, name: `League ${leagueId}`, sport: "tennis", location: "-", status: "active" };
        setLeague(resolvedLeague);
        setLeaderboard(mockLeaderboard);
      } catch (error) {
        console.error("Error loading leaderboard data:", error);
        toast.error("Failed to load leaderboard details");
      } finally {
        setIsLoading(false);
      }
    };

    if (leagueId) {
      loadData();
    }
  }, [leagueId]);

  const handleRefreshLeaderboard = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call to recalculate standings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Refreshing leaderboard from match results...");
      toast.success("Leaderboard updated from match results!");
      
      // TODO: Reload leaderboard data
    } catch (error) {
      console.error("Error refreshing leaderboard:", error);
      toast.error("Failed to refresh leaderboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualAdjustment = async () => {
    if (!selectedEntry) return;
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Manual adjustment for player:", selectedEntry.playerName, manualAdjustment);
      toast.success("Points adjusted successfully!");
      
      setSelectedEntry(null);
      setIsEditDialogOpen(false);
      setManualAdjustment({ points: 0, reason: "" });
      
      // TODO: Reload leaderboard data
    } catch (error) {
      console.error("Error adjusting points:", error);
      toast.error("Failed to adjust points");
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <IconCrown className="size-5 text-yellow-500" />;
      case 2:
        return <IconMedal className="size-5 text-gray-400" />;
      case 3:
        return <IconMedal className="size-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankChange = (current: number, previous?: number) => {
    if (!previous) return null;
    
    const change = previous - current;
    if (change > 0) {
      return (
        <div className="flex items-center text-green-600">
          <IconTrendingUp className="size-3 mr-1" />
          <span className="text-xs">+{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-600">
          <IconTrendingUp className="size-3 mr-1 rotate-180" />
          <span className="text-xs">{change}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center text-muted-foreground">
        <span className="text-xs">-</span>
      </div>
    );
  };

  const getFormBadges = (form: string[]) => {
    return form.map((result, index) => (
      <Badge
        key={index}
        variant={result === 'W' ? 'default' : 'destructive'}
        className="text-xs w-6 h-6 p-0 flex items-center justify-center"
      >
        {result}
      </Badge>
    ));
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading leaderboard...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!league) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <IconTrophy className="size-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">League Not Found</h2>
              <p className="text-muted-foreground mb-4">The requested league could not be found.</p>
              <Button onClick={() => router.push("/league")}>
                <IconArrowLeft className="size-4 mr-2" />
                Back to Leagues
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

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
        <SiteHeader items={[{ label: "League", href: "/league" }, { label: league ? league.name : "Details", href: `/league/view/${leagueId}` }, { label: "Leaderboard" }]} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6">
              {/* Page Header */}
              <div className="border-b bg-gradient-to-r from-background/95 to-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-4 lg:px-6 py-8">
                  <div className="flex flex-col gap-6">
                    
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/league/view/${leagueId}`)}
                      >
                        <IconArrowLeft className="size-4 mr-2" />
                        Back
                      </Button>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconTrophy className="size-8 text-primary" />
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
                          <p className="text-muted-foreground">
                            {league.name} - Current standings and rankings
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleRefreshLeaderboard}>
                        <IconRefresh className="size-4 mr-2" />
                        Refresh from Matches
                      </Button>
                      <Button variant="outline" size="sm">
                        <IconDownload className="size-4 mr-2" />
                        Export
                      </Button>
                    </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 px-4 lg:px-6 py-6">
                <div className="space-y-6">
                  {/* Top 3 Podium */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconCrown className="size-5 text-yellow-500" />
                        Top 3 Players
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {leaderboard.slice(0, 3).map((entry, index) => (
                          <Card key={entry.id} className={`relative overflow-hidden ${index === 0 ? 'ring-2 ring-yellow-500' : ''}`}>
                            <CardContent className="p-6 text-center">
                              <div className="absolute top-2 right-2">
                                {getRankIcon(entry.rank)}
                              </div>
                              <div className="space-y-2">
                                <h3 className="text-lg font-semibold">{entry.playerName}</h3>
                                <div className="text-sm text-muted-foreground">{entry.division}</div>
                                <div className="space-y-1">
                                  <div className="text-2xl font-bold text-primary">{entry.points} pts</div>
                                  <div className="text-sm">
                                    {entry.wins}W - {entry.losses}L ({entry.winPercentage}%)
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Set diff: {entry.setDifference > 0 ? '+' : ''}{entry.setDifference}
                                  </div>
                                </div>
                                <div className="flex justify-center gap-1">
                                  {getFormBadges(entry.form)}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Full Leaderboard */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Complete Standings</CardTitle>
                          <CardDescription>
                            Automatically updated from match results • Last updated: {new Date().toLocaleString()}
                          </CardDescription>
                        </div>
                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <IconEdit className="size-4 mr-2" />
                              Manual Override
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Manual Points Adjustment</DialogTitle>
                              <DialogDescription>
                                Make manual adjustments to player points (admin override)
                              </DialogDescription>
                            </DialogHeader>
                            {selectedEntry && (
                              <div className="space-y-4">
                                <div className="p-4 bg-muted rounded-lg">
                                  <h4 className="font-medium">{selectedEntry.playerName}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Current points: {selectedEntry.points}
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="points">Points Adjustment</Label>
                                  <Input
                                    id="points"
                                    type="number"
                                    placeholder="Enter points to add/subtract (use negative for deduction)"
                                    value={manualAdjustment.points}
                                    onChange={(e) => setManualAdjustment(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="reason">Reason for Adjustment</Label>
                                  <Input
                                    id="reason"
                                    placeholder="Enter reason for this adjustment"
                                    value={manualAdjustment.reason}
                                    onChange={(e) => setManualAdjustment(prev => ({ ...prev, reason: e.target.value }))}
                                  />
                                </div>
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                  <p className="text-sm text-yellow-800">
                                    <strong>New total:</strong> {selectedEntry.points + manualAdjustment.points} points
                                  </p>
                                </div>
                              </div>
                            )}
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleManualAdjustment}>
                                Apply Adjustment
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">Rank</TableHead>
                            <TableHead>Player</TableHead>
                            <TableHead>Division</TableHead>
                            <TableHead>Played</TableHead>
                            <TableHead>W-L</TableHead>
                            <TableHead>Win %</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead>Sets</TableHead>
                            <TableHead>Games</TableHead>
                            <TableHead>Form</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {leaderboard.map((entry) => (
                            <TableRow key={entry.id} className={entry.rank <= 3 ? 'bg-muted/30' : ''}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getRankIcon(entry.rank)}
                                  {getRankChange(entry.rank, entry.previousRank)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{entry.playerName}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {entry.division}
                                </Badge>
                              </TableCell>
                              <TableCell>{entry.matchesPlayed}</TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">{entry.wins}-{entry.losses}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{entry.winPercentage}%</div>
                              </TableCell>
                              <TableCell>
                                <div className="font-bold text-primary">{entry.points}</div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm">{entry.setsWon}-{entry.setsLost}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {entry.setDifference > 0 ? '+' : ''}{entry.setDifference}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm">{entry.gamesWon}-{entry.gamesLost}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {entry.gameDifference > 0 ? '+' : ''}{entry.gameDifference}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  {getFormBadges(entry.form)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedEntry(entry);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <IconEdit className="size-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
