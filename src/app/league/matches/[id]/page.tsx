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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Textarea } from "@/components/ui/textarea";
import { 
  IconArrowLeft,
  IconTrophy,
  IconUsers,
  IconCalendar,
  IconMapPin,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconClock,
  IconTarget,
  IconStar
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
 

interface Match {
  id: string;
  leagueId: string;
  player1: {
    id: string;
    name: string;
    rating: number;
  };
  player2: {
    id: string;
    name: string;
    rating: number;
  };
  scheduledDate: string;
  scheduledTime: string;
  venue?: string;
  division: string;
  round: string;
  status: "scheduled" | "in_progress" | "completed" | "disputed" | "cancelled";
  result?: {
    player1Score: string;
    player2Score: string;
    winner: string;
    sets?: string[];
  };
  dispute?: {
    reportedBy: string;
    reason: string;
    reportedAt: string;
    status: "open" | "resolved";
    resolution?: string;
    resolvedBy?: string;
    resolvedAt?: string;
  };
  confirmedBy?: string[];
  createdAt: string;
  updatedAt: string;
}

interface League {
  id: string;
  name: string;
  sport: string;
  location: string;
  status: string;
}

// Mock data
const mockLeague: League = {
  id: "1",
  name: "KL Tennis Championship",
  sport: "tennis",
  location: "Kuala Lumpur",
  status: "active",
};

const mockMatches: Match[] = [
  {
    id: "1",
    leagueId: "1",
    player1: { id: "p1", name: "John Smith", rating: 4.5 },
    player2: { id: "p2", name: "Sarah Johnson", rating: 4.2 },
    scheduledDate: "2024-01-25",
    scheduledTime: "10:00",
    venue: "Court 1",
    division: "Division A",
    round: "Round 1",
    status: "completed",
    result: {
      player1Score: "6-4, 6-3",
      player2Score: "4-6, 3-6",
      winner: "p1",
      sets: ["6-4", "6-3"]
    },
    confirmedBy: ["p1", "p2"],
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-25T12:00:00Z",
  },
  {
    id: "2",
    leagueId: "1",
    player1: { id: "p3", name: "Mike Davis", rating: 4.8 },
    player2: { id: "p4", name: "Emily Brown", rating: 4.0 },
    scheduledDate: "2024-01-26",
    scheduledTime: "14:00",
    venue: "Court 2",
    division: "Division A",
    round: "Round 1",
    status: "disputed",
    result: {
      player1Score: "6-2, 7-5",
      player2Score: "2-6, 5-7",
      winner: "p3",
      sets: ["6-2", "7-5"]
    },
    dispute: {
      reportedBy: "p4",
      reason: "Disputed line call on match point. Player claims ball was out but opponent disagrees.",
      reportedAt: "2024-01-26T16:30:00Z",
      status: "open"
    },
    confirmedBy: ["p3"],
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-26T16:30:00Z",
  },
  {
    id: "3",
    leagueId: "1",
    player1: { id: "p5", name: "Alex Wilson", rating: 4.3 },
    player2: { id: "p6", name: "Lisa Chen", rating: 4.1 },
    scheduledDate: "2024-01-28",
    scheduledTime: "09:00",
    venue: "Court 3",
    division: "Division B",
    round: "Round 1",
    status: "scheduled",
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
  },
];

const mockPlayers = [
  { id: "p1", name: "John Smith", rating: 4.5 },
  { id: "p2", name: "Sarah Johnson", rating: 4.2 },
  { id: "p3", name: "Mike Davis", rating: 4.8 },
  { id: "p4", name: "Emily Brown", rating: 4.0 },
  { id: "p5", name: "Alex Wilson", rating: 4.3 },
  { id: "p6", name: "Lisa Chen", rating: 4.1 },
];

export default function MatchManagementPage() {
  const router = useRouter();
  const params = useParams();
  const leagueId = params.id as string;

  const [league, setLeague] = useState<League | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [disputeResolution, setDisputeResolution] = useState("");

  // Create match form data
  const [matchForm, setMatchForm] = useState({
    player1Id: "",
    player2Id: "",
    scheduledDate: "",
    scheduledTime: "",
    venue: "",
    division: "",
    round: "",
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API calls
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setLeague(mockLeague);
        setMatches(mockMatches);
      } catch (error) {
        console.error("Error loading match data:", error);
        toast.error("Failed to load match details");
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
      case "scheduled":
        return <Badge variant="outline"><IconClock className="size-3 mr-1" />Scheduled</Badge>;
      case "in_progress":
        return <Badge variant="secondary"><IconTarget className="size-3 mr-1" />In Progress</Badge>;
      case "completed":
        return <Badge variant="default"><IconCheck className="size-3 mr-1" />Completed</Badge>;
      case "disputed":
        return <Badge variant="destructive"><IconAlertTriangle className="size-3 mr-1" />Disputed</Badge>;
      case "cancelled":
        return <Badge variant="outline"><IconX className="size-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCreateMatch = async () => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Creating match:", matchForm);
      toast.success("Match scheduled successfully!");
      
      // Reset form and close dialog
      setMatchForm({
        player1Id: "",
        player2Id: "",
        scheduledDate: "",
        scheduledTime: "",
        venue: "",
        division: "",
        round: "",
      });
      setIsCreateDialogOpen(false);
      
      // Reload matches
      // TODO: Refresh matches list
    } catch (error) {
      console.error("Error creating match:", error);
      toast.error("Failed to schedule match");
    }
  };

  const handleResolveDispute = async (matchId: string) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Resolving dispute for match:", matchId, "Resolution:", disputeResolution);
      toast.success("Dispute resolved successfully!");
      
      setDisputeResolution("");
      setSelectedMatch(null);
      
      // TODO: Refresh matches list
    } catch (error) {
      console.error("Error resolving dispute:", error);
      toast.error("Failed to resolve dispute");
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Deleting match:", matchId);
      toast.success("Match deleted successfully!");
      
      // TODO: Refresh matches list
    } catch (error) {
      console.error("Error deleting match:", error);
      toast.error("Failed to delete match");
    }
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
              <p className="text-muted-foreground">Loading match data...</p>
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
        <SiteHeader items={[{ label: "League", href: "/league" }, { label: league ? league.name : "Details", href: `/league/view/${leagueId}` }, { label: "Matches" }]} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6">
              {/* Page Header */}
              <div className="border-b bg-gradient-to-r from-background/95 to-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-4 lg:px-6 py-8">
                  <div className="flex flex-col gap-6">
                    
                    <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/league")}
                    >
                      <IconArrowLeft className="size-4 mr-2" />
                      Back to Dashboard
                    </Button>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconTarget className="size-8 text-primary" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold tracking-tight">Match Management</h1>
                        <p className="text-muted-foreground">
                          {league.name} - Manage matches, results, and disputes
                        </p>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 px-4 lg:px-6 py-6">
                <div className="space-y-6">
                  {/* Match Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Matches</p>
                            <p className="text-3xl font-bold">{matches.length}</p>
                          </div>
                          <IconTarget className="size-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Completed</p>
                            <p className="text-3xl font-bold text-green-600">
                              {matches.filter(m => m.status === "completed").length}
                            </p>
                          </div>
                          <IconCheck className="size-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Disputed</p>
                            <p className="text-3xl font-bold text-red-600">
                              {matches.filter(m => m.status === "disputed").length}
                            </p>
                          </div>
                          <IconAlertTriangle className="size-8 text-red-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                            <p className="text-3xl font-bold text-blue-600">
                              {matches.filter(m => m.status === "scheduled").length}
                            </p>
                          </div>
                          <IconClock className="size-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Matches Table */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>All Matches</CardTitle>
                          <CardDescription>Manage match schedules, results, and disputes</CardDescription>
                        </div>
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                          <DialogTrigger asChild>
                            <Button>
                              <IconPlus className="mr-2 h-4 w-4" />
                              Schedule Match
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Schedule New Match</DialogTitle>
                              <DialogDescription>
                                Create a new match between two players
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="player1">Player 1</Label>
                                  <Select value={matchForm.player1Id} onValueChange={(value) => setMatchForm(prev => ({ ...prev, player1Id: value }))}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select player 1" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {mockPlayers.map((player) => (
                                        <SelectItem key={player.id} value={player.id}>
                                          {player.name} (Rating: {player.rating})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="player2">Player 2</Label>
                                  <Select value={matchForm.player2Id} onValueChange={(value) => setMatchForm(prev => ({ ...prev, player2Id: value }))}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select player 2" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {mockPlayers.filter(p => p.id !== matchForm.player1Id).map((player) => (
                                        <SelectItem key={player.id} value={player.id}>
                                          {player.name} (Rating: {player.rating})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="date">Date</Label>
                                  <Input
                                    id="date"
                                    type="date"
                                    value={matchForm.scheduledDate}
                                    onChange={(e) => setMatchForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="time">Time</Label>
                                  <Input
                                    id="time"
                                    type="time"
                                    value={matchForm.scheduledTime}
                                    onChange={(e) => setMatchForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="venue">Venue</Label>
                                  <Input
                                    id="venue"
                                    placeholder="Court 1"
                                    value={matchForm.venue}
                                    onChange={(e) => setMatchForm(prev => ({ ...prev, venue: e.target.value }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="division">Division</Label>
                                  <Select value={matchForm.division} onValueChange={(value) => setMatchForm(prev => ({ ...prev, division: value }))}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select division" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Division A">Division A</SelectItem>
                                      <SelectItem value="Division B">Division B</SelectItem>
                                      <SelectItem value="Division C">Division C</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="round">Round</Label>
                                <Select value={matchForm.round} onValueChange={(value) => setMatchForm(prev => ({ ...prev, round: value }))}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select round" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Round 1">Round 1</SelectItem>
                                    <SelectItem value="Round 2">Round 2</SelectItem>
                                    <SelectItem value="Quarter Finals">Quarter Finals</SelectItem>
                                    <SelectItem value="Semi Finals">Semi Finals</SelectItem>
                                    <SelectItem value="Finals">Finals</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleCreateMatch}>
                                Schedule Match
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
                            <TableHead>Players</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Venue</TableHead>
                            <TableHead>Division/Round</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Result</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {matches.map((match) => (
                            <TableRow key={match.id}>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{match.player1.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {match.player1.rating}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground">vs</div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{match.player2.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {match.player2.rating}
                                    </Badge>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <IconCalendar className="size-3 text-muted-foreground" />
                                    <span className="text-sm">{formatDate(match.scheduledDate)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <IconClock className="size-3 text-muted-foreground" />
                                    <span className="text-sm">{match.scheduledTime}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <IconMapPin className="size-3 text-muted-foreground" />
                                  <span className="text-sm">{match.venue || "TBD"}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm font-medium">{match.division}</div>
                                  <div className="text-sm text-muted-foreground">{match.round}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(match.status)}
                              </TableCell>
                              <TableCell>
                                {match.result ? (
                                  <div className="space-y-1">
                                    <div className="text-sm font-medium">
                                      {match.result.winner === match.player1.id ? match.player1.name : match.player2.name} won
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {match.result.player1Score}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">Not played</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm">
                                    <IconEdit className="size-4" />
                                  </Button>
                                  {match.status === "disputed" && (
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedMatch(match)}>
                                          <IconAlertTriangle className="size-4 text-red-500" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Resolve Dispute</DialogTitle>
                                          <DialogDescription>
                                            Review and resolve the match dispute
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <h4 className="font-medium text-red-800 mb-2">Dispute Details</h4>
                                            <p className="text-sm text-red-700 mb-2">
                                              <strong>Reported by:</strong> {match.dispute?.reportedBy === match.player1.id ? match.player1.name : match.player2.name}
                                            </p>
                                            <p className="text-sm text-red-700">
                                              <strong>Reason:</strong> {match.dispute?.reason}
                                            </p>
                                          </div>
                                          <div className="space-y-2">
                                            <Label htmlFor="resolution">Resolution</Label>
                                            <Textarea
                                              id="resolution"
                                              placeholder="Enter your resolution for this dispute..."
                                              value={disputeResolution}
                                              onChange={(e) => setDisputeResolution(e.target.value)}
                                            />
                                          </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                          <Button variant="outline" onClick={() => setSelectedMatch(null)}>
                                            Cancel
                                          </Button>
                                          <Button onClick={() => handleResolveDispute(match.id)}>
                                            Resolve Dispute
                                          </Button>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  )}
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <IconTrash className="size-4 text-red-500" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Match</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this match? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteMatch(match.id)}>
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
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
