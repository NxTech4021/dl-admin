"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  IconArrowLeft,
  IconPlus,
  IconCalendar,
  IconUsers,
  IconTrophy,
  IconCurrencyDollar,
  IconEye,
  IconEdit,
  IconCopy,
  IconTrash,
  IconArchive,
  IconPlayerPlay,
  IconX,
  IconCheck,
  IconClock,
  IconStar,
} from "@tabler/icons-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
 
import SeasonCreateModal from "@/components/modal/season-create-modal";

interface Season {
  id: string;
  name: string;
  number: number;
  status: "draft" | "registration" | "active" | "completed" | "cancelled";
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  participants: number;
  maxParticipants: number;
  entryFee: number;
  revenue: number;
  divisions: number;
  matches: number;
  completedMatches: number;
  createdAt: string;
  format: string;
  sponsor?: string;
  description?: string;
  prizes?: {
    first: string;
    second: string;
    third: string;
  };
}

interface League {
  id: string;
  name: string;
  sport: string;
  city: string;
  status: string;
  totalSeasons: number;
  activeSeasons: number;
  totalParticipants: number;
  totalRevenue: number;
}

// Mock data for seasons
const mockSeasons: Season[] = [
  {
    id: "season-1",
    name: "Spring Championship 2024",
    number: 1,
    status: "completed",
    startDate: "2024-03-01",
    endDate: "2024-05-31",
    registrationDeadline: "2024-02-15",
    participants: 24,
    maxParticipants: 24,
    entryFee: 150,
    revenue: 3600,
    divisions: 3,
    matches: 72,
    completedMatches: 72,
    createdAt: "2024-01-15",
    format: "Singles",
    sponsor: "SportsTech Malaysia",
    description: "Inaugural season of the Kuala Lumpur Badminton League",
    prizes: {
      first: "RM 1,000 + Trophy",
      second: "RM 500 + Medal",
      third: "RM 250 + Medal"
    }
  },
  {
    id: "season-2",
    name: "Summer Open 2024",
    number: 2,
    status: "active",
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    registrationDeadline: "2024-05-15",
    participants: 32,
    maxParticipants: 32,
    entryFee: 150,
    revenue: 4800,
    divisions: 4,
    matches: 96,
    completedMatches: 45,
    createdAt: "2024-04-20",
    format: "Singles",
    sponsor: "SportsTech Malaysia",
    description: "Summer season with expanded divisions"
  },
  {
    id: "season-3",
    name: "Autumn Challenge 2024",
    number: 3,
    status: "registration",
    startDate: "2024-09-01",
    endDate: "2024-11-30",
    registrationDeadline: "2024-08-15",
    participants: 18,
    maxParticipants: 28,
    entryFee: 150,
    revenue: 2700,
    divisions: 3,
    matches: 0,
    completedMatches: 0,
    createdAt: "2024-07-10",
    format: "Singles",
    description: "Fall season with new format innovations"
  }
];

// Mock league data
const mockLeague: League = {
  id: "league-1",
  name: "Kuala Lumpur Badminton League",
  sport: "Badminton",
  city: "Kuala Lumpur",
  status: "active",
  totalSeasons: 3,
  activeSeasons: 2,
  totalParticipants: 74,
  totalRevenue: 11100
};

export default function LeagueSeasonsPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;
  
  const [league, setLeague] = useState<League>(mockLeague);
  const [seasons, setSeasons] = useState<Season[]>(mockSeasons);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);

  const handleBack = () => {
    router.push(`/league/view/${leagueId}`);
  };

  const handleSeasonCreated = () => {
    // TODO: Refresh seasons list
    console.log("Season created, refreshing list...");
    toast.success("Season created successfully!");
  };

  const handleViewSeason = (season: Season) => {
    router.push(`/season/view/${season.id}`);
  };

  const handleEditSeason = (season: Season) => {
    router.push(`/season/edit/${season.id}`);
  };

  const handleDuplicateSeason = (season: Season) => {
    // Create a new season based on the selected one
    const nextSeasonNumber = Math.max(...seasons.map(s => s.number)) + 1;
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    
    // Calculate new dates (3 months after the original season ends)
    const originalEndDate = new Date(season.endDate);
    const newStartDate = new Date(originalEndDate);
    newStartDate.setMonth(originalEndDate.getMonth() + 1);
    
    const newEndDate = new Date(newStartDate);
    newEndDate.setMonth(newStartDate.getMonth() + 3);
    
    const registrationDeadline = new Date(newStartDate);
    registrationDeadline.setDate(newStartDate.getDate() - 15);

    const newSeason: Season = {
      id: `season-${Date.now()}`,
      name: season.name.replace(/\d{4}/, nextYear.toString()).replace(`Season ${season.number}`, `Season ${nextSeasonNumber}`),
      number: nextSeasonNumber,
      status: "draft",
      startDate: newStartDate.toISOString().split('T')[0],
      endDate: newEndDate.toISOString().split('T')[0],
      registrationDeadline: registrationDeadline.toISOString().split('T')[0],
      participants: 0,
      maxParticipants: season.maxParticipants,
      entryFee: season.entryFee,
      revenue: 0,
      divisions: season.divisions,
      matches: 0,
      completedMatches: 0,
      createdAt: new Date().toISOString().split('T')[0],
      format: season.format,
      sponsor: season.sponsor,
      description: `${season.description} - Season ${nextSeasonNumber}`,
      prizes: season.prizes
    };

    setSeasons([...seasons, newSeason]);
    toast.success(`Season ${nextSeasonNumber} created based on ${season.name}!`);
  };

  const handleDeleteSeason = (season: Season) => {
    if (season.status === "active") {
      toast.error("Cannot delete an active season");
      return;
    }
    
    if (confirm(`Are you sure you want to delete ${season.name}? This action cannot be undone.`)) {
      // TODO: Implement season deletion
      toast.success("Season deleted successfully");
    }
  };

  const getStatusColor = (status: Season["status"]) => {
    switch (status) {
      case "active": return "default";
      case "registration": return "secondary";
      case "completed": return "outline";
      case "draft": return "outline";
      case "cancelled": return "destructive";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: Season["status"]) => {
    switch (status) {
      case "active": return <IconPlayerPlay className="size-3" />;
      case "registration": return <IconClock className="size-3" />;
      case "completed": return <IconCheck className="size-3" />;
      case "draft": return <IconEdit className="size-3" />;
      case "cancelled": return <IconX className="size-3" />;
      default: return <IconClock className="size-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-MY", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

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
        <SiteHeader items={[{ label: "League", href: "/league" }, { label: league ? league.name : "Details", href: `/league/view/${leagueId}` }, { label: "Seasons" }]} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6">
              {/* Page Header */}
              <div className="border-b bg-gradient-to-r from-background/95 to-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-4 lg:px-6 py-8">
                  <div className="flex flex-col gap-6">
                    
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBack}
                        >
                          <IconArrowLeft className="size-4 mr-2" />
                          Back to League
                        </Button>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <IconCalendar className="size-8 text-primary" />
                            </div>
                            <div>
                              <h1 className="text-3xl font-bold tracking-tight">Season Management</h1>
                              <p className="text-muted-foreground">
                                Manage seasons for {league.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <SeasonCreateModal
                        open={isCreateDialogOpen}
                        onOpenChange={setIsCreateDialogOpen}
                        onSeasonCreated={handleSeasonCreated}
                      >
                        <Button>
                          <IconPlus className="mr-2 h-4 w-4" />
                          Create New Season
                        </Button>
                      </SeasonCreateModal>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 px-4 lg:px-6 py-6">
                <div className="space-y-6">
                  {/* League Overview Cards */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Seasons</CardTitle>
                        <IconTrophy className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{league.totalSeasons}</div>
                        <p className="text-xs text-muted-foreground">
                          {league.activeSeasons} currently active
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                        <IconUsers className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{league.totalParticipants}</div>
                        <p className="text-xs text-muted-foreground">Across all seasons</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <IconCurrencyDollar className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">RM {league.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">From all season entry fees</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average per Season</CardTitle>
                        <IconStar className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{Math.round(league.totalParticipants / league.totalSeasons)}</div>
                        <p className="text-xs text-muted-foreground">Players per season</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Seasons Table */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>All Seasons</CardTitle>
                          <CardDescription>View and manage all seasons for this league</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Season</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Participants</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Revenue</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {seasons.map((season) => (
                            <TableRow key={season.id}>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{season.name}</span>
                                  <span className="text-sm text-muted-foreground">Season {season.number}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getStatusColor(season.status)} className="flex items-center gap-1 w-fit">
                                  {getStatusIcon(season.status)}
                                  {season.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col text-sm">
                                  <span>{formatDate(season.startDate)} - {formatDate(season.endDate)}</span>
                                  <span className="text-muted-foreground">
                                    Reg. deadline: {formatDate(season.registrationDeadline)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{season.participants}/{season.maxParticipants}</span>
                                  <span className="text-sm text-muted-foreground">{season.divisions} divisions</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {season.status === "active" || season.status === "completed" ? (
                                  <div className="flex flex-col">
                                    <span className="font-medium">{season.completedMatches}/{season.matches}</span>
                                    <span className="text-sm text-muted-foreground">matches completed</span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <IconCurrencyDollar className="size-4 text-muted-foreground" />
                                  <span className="font-medium">RM {season.revenue.toLocaleString()}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewSeason(season)}
                                  >
                                    <IconEye className="size-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditSeason(season)}
                                  >
                                    <IconEdit className="size-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDuplicateSeason(season)}
                                  >
                                    <IconCopy className="size-4" />
                                  </Button>
                                  {season.status !== "active" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteSeason(season)}
                                    >
                                      <IconTrash className="size-4" />
                                    </Button>
                                  )}
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
