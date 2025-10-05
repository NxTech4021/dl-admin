"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { CartesianGrid, XAxis, YAxis, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
 
import { 
  IconPlus, 
  IconTrophy, 
  IconUsers, 
  IconCalendar, 
  IconCurrencyDollar,
  IconEye,
  IconEdit,
  IconTarget,
  IconStar,
  IconTemplate,
  IconUser,
  IconPlayerPlay,
  IconClock,
  IconCheck,
  IconX,
  IconTrendingUp,
  IconBolt,
  IconChartBar,
  IconActivity,
  IconGift
} from "@tabler/icons-react";
import { toast } from "sonner";
import { 
  LeagueCreateModal, 
  LeagueTemplateModal
} from "../../components/modal";

// Enhanced mock data with all new features
const mockLeagues = [
  {
    id: 1,
    name: "KL Pickleball Championship",
    sport: "Pickleball",
    city: "Kuala Lumpur",
    season: "Season 2 - 2025",
    participants: 32,
    maxParticipants: 32,
    status: "active",
    revenue: 3840,
    entryFee: 120,
    startDate: "2025-01-15",
    endDate: "2025-03-15",
    divisions: 4,
    seasons: 2,
    matches: {
      total: 96,
      completed: 45,
      pending: 51
    },
    sponsor: {
      name: "SportsTech Malaysia",
      logo: "/sponsors/sportstech.png"
    },
    prizes: {
      total: 2500,
      positions: 4
    }
  },
  {
    id: 2,
    name: "PJ Tennis League",
    sport: "Tennis",
    city: "Petaling Jaya",
    season: "Season 1 - 2025",
    participants: 24,
    maxParticipants: 32,
    status: "registration",
    revenue: 3600,
    entryFee: 150,
    startDate: "2025-02-01",
    endDate: "2025-04-01",
    divisions: 3,
    seasons: 1,
    matches: {
      total: 0,
      completed: 0,
      pending: 0
    },
    sponsor: {
      name: "Wilson Sports",
      logo: "/sponsors/wilson.png"
    },
    prizes: {
      total: 1800,
      positions: 3
    }
  },
  {
    id: 3,
    name: "Subang Table Tennis Pro",
    sport: "Table Tennis",
    city: "Subang Jaya",
    season: "Season 3 - 2025",
    participants: 28,
    maxParticipants: 28,
    status: "completed",
    revenue: 3360,
    entryFee: 120,
    startDate: "2024-10-01",
    endDate: "2024-12-01",
    divisions: 3,
    seasons: 3,
    matches: {
      total: 84,
      completed: 84,
      pending: 0
    },
    sponsor: {
      name: "Butterfly Malaysia",
      logo: "/sponsors/butterfly.png"
    },
    prizes: {
      total: 2000,
      positions: 5
    }
  }
];

const quickStats = {
  totalLeagues: 3,
  activeLeagues: 1,
  totalPlayers: 84,
  totalRevenue: 11760,
  totalMatches: 180,
  completedMatches: 129,
  totalSeasons: 6,
  totalDivisions: 10,
  totalPrizes: 6300,
  averageParticipants: 28
};

const recentActivity = [
  {
    id: 1,
    type: "match_completed",
    description: "Ahmad Rahman defeated Lim Wei Ming in KL Pickleball Championship",
    time: "2 hours ago",
    icon: IconTrophy,
    color: "text-green-600"
  },
  {
    id: 2,
    type: "player_joined",
    description: "3 new players registered for PJ Tennis League",
    time: "4 hours ago",
    icon: IconUsers,
    color: "text-blue-600"
  },
  {
    id: 3,
    type: "season_created",
    description: "Season 4 created for Subang Table Tennis Pro",
    time: "1 day ago",
    icon: IconCalendar,
    color: "text-purple-600"
  },
  {
    id: 4,
    type: "prize_updated",
    description: "Prize structure updated for KL Pickleball Championship",
    time: "2 days ago",
    icon: IconGift,
    color: "text-orange-600"
  },
  {
    id: 5,
    type: "sponsor_added",
    description: "New sponsor Wilson Sports added to PJ Tennis League",
    time: "3 days ago",
    icon: IconUser,
    color: "text-indigo-600"
  }
];

export default function LeaguePage() {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [leagues, setLeagues] = useState(mockLeagues);
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Ensure component is mounted before rendering dynamic content
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLeagueCreated = (newLeagueData?: any) => {
    console.log("League created, refreshing list...");
    
    // If we have new league data, add it to the leagues list
    if (newLeagueData) {
      const newLeague = {
        id: Math.max(...leagues.map(l => l.id), 0) + 1, // More stable ID generation
        name: newLeagueData.leagueName || "New League",
        sport: newLeagueData.sport || "Tennis",
        city: newLeagueData.location || "Unknown",
        season: "Season 1 - 2025",
        participants: 0,
        maxParticipants: parseInt(newLeagueData.maxPlayers) || 32,
        status: newLeagueData.status || "draft",
        revenue: 0,
        entryFee: parseInt(newLeagueData.entryFee) || 0,
        startDate: newLeagueData.startDate || "2025-02-01",
        endDate: newLeagueData.endDate || "2025-04-01",
        divisions: parseInt(newLeagueData.divisions) || 1,
        seasons: 1,
        matches: {
          total: 0,
          completed: 0,
          pending: 0
        },
        sponsor: newLeagueData.hasSponsor ? {
          name: newLeagueData.sponsorName || "Sponsor",
          logo: newLeagueData.sponsorLogo || "/sponsors/default.png"
        } : {
          name: "No Sponsor",
          logo: "/sponsors/default.png"
        },
        prizes: {
          total: 0,
          positions: 0
        }
      };
      
      setLeagues(prevLeagues => [...prevLeagues, newLeague]);
      toast.success(`League "${newLeagueData.leagueName}" created successfully!`);
    } else {
      toast.success("League created successfully!");
    }
    
    setSelectedTemplate(null); // Clear template after creation
  };

  const handleTemplateSelect = (template: any) => {
    console.log("Template selected:", template);
    setSelectedTemplate(template);
    setIsCreateDialogOpen(true); // Open create modal with template
    toast.success(`Template "${template.name}" selected!`);
  };

  const handleViewLeague = (league: typeof leagues[0]) => {
    router.push(`/league/view/${league.id}`);
  };

  const handleEditLeague = (league: typeof leagues[0]) => {
    router.push(`/league/edit/${league.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "registration": return "secondary";
      case "completed": return "outline";
      case "upcoming": return "secondary";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <IconPlayerPlay className="size-3" />;
      case "registration": return <IconClock className="size-3" />;
      case "completed": return <IconCheck className="size-3" />;
      case "upcoming": return <IconCalendar className="size-3" />;
      default: return <IconClock className="size-3" />;
    }
  };

  // Build analytics datasets from leagues
  const participationData = leagues.map((l) => ({
    league: l.name,
    participants: l.participants,
    capacity: l.maxParticipants,
  }));

  const revenueData = leagues.map((l) => ({
    league: l.name,
    revenue: l.revenue,
  }));

  const matchesData = leagues
    .filter((l) => l.matches.total > 0)
    .map((l) => ({
      league: l.name,
      completed: l.matches.completed,
      remaining: Math.max(l.matches.total - l.matches.completed, 0),
    }));

  const sportCounts = leagues.reduce<Record<string, number>>((acc, l) => {
    acc[l.sport] = (acc[l.sport] || 0) + 1;
    return acc;
  }, {});

  const sportData = Object.entries(sportCounts).map(([sport, count]) => ({
    sport,
    count,
  }));

  const participationChartConfig: ChartConfig = {
    participants: { label: "Participants", color: "#3B82F6" },
    capacity: { label: "Capacity", color: "#A3A3A3" },
  };

  const revenueChartConfig: ChartConfig = {
    revenue: { label: "Revenue (RM)", color: "#10B981" },
  };

  const matchesChartConfig: ChartConfig = {
    completed: { label: "Completed", color: "#22C55E" },
    remaining: { label: "Remaining", color: "#F97316" },
  };

  const sportChartColors = ["#60A5FA", "#F97316", "#34D399", "#A78BFA", "#F43F5E", "#F59E0B"];

  // Top 5 active leagues by utilization
  const topActiveLeagues = leagues
    .filter((l) => l.status === "active")
    .sort((a, b) => (b.participants / b.maxParticipants) - (a.participants / a.maxParticipants))
    .slice(0, 5);

  // Pagination for all leagues
  const totalPages = Math.max(1, Math.ceil(leagues.length / pageSize));
  const paginatedLeagues = leagues.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
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
        <SiteHeader items={[{ label: "League", href: "/league" }, { label: "Overview" }]} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6">
              {/* Enhanced Page Header */}
              <div className="border-b bg-gradient-to-r from-background/95 to-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-4 lg:px-6 py-8">
                  <div className="flex flex-col gap-6">
                    
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconTrophy className="size-8 text-primary" />
                          </div>
                          <div>
                            <h1 className="text-3xl font-bold tracking-tight">League Management</h1>
                            <p className="text-muted-foreground">
                              
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <LeagueTemplateModal onTemplateSelect={handleTemplateSelect}>
                          <Button variant="outline">
                            <IconTemplate className="mr-2 h-4 w-4" />
                            Templates
                              </Button>
                        </LeagueTemplateModal>
                        <LeagueCreateModal
                          open={isCreateDialogOpen}
                          onOpenChange={setIsCreateDialogOpen}
                          onLeagueCreated={handleLeagueCreated}
                          selectedTemplate={selectedTemplate}
                        >
                          <Button>
                            <IconPlus className="mr-2 h-4 w-4" />
                            Create League
                              </Button>
                        </LeagueCreateModal>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="flex-1 px-4 lg:px-6 py-6">
                <div className="space-y-8">
                  {/* Enhanced Overview Stats */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Leagues</CardTitle>
                        <IconTrophy className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{quickStats.totalLeagues}</div>
                        <p className="text-xs text-muted-foreground">
                          {quickStats.activeLeagues} active, {quickStats.totalSeasons} seasons
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                        <IconUsers className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{quickStats.totalPlayers}</div>
                        <p className="text-xs text-muted-foreground">
                          Avg {quickStats.averageParticipants} per league
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <IconCurrencyDollar className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">RM {quickStats.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                          RM {quickStats.totalPrizes.toLocaleString()} in prizes
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Match Progress</CardTitle>
                        <IconActivity className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{Math.round((quickStats.completedMatches / quickStats.totalMatches) * 100)}%</div>
                        <p className="text-xs text-muted-foreground">
                          {quickStats.completedMatches} of {quickStats.totalMatches} completed
                        </p>
                      </CardContent>
                    </Card>
                              </div>

                  {/* League Overview - main content only */}
                  <Card>
                            <CardHeader>
                      <CardTitle>League Overview</CardTitle>
                              <CardDescription>
                        Manage and track your leagues at a glance. Top active leagues are highlighted below; use pagination to browse all.
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                      <div className="space-y-6">
                        {topActiveLeagues.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium text-muted-foreground">Top Active Leagues</h3>
                              <span className="text-xs text-muted-foreground">Showing top {topActiveLeagues.length}</span>
                            </div>
                            <div className="space-y-3 transition-opacity duration-300">
                              {topActiveLeagues.map((league) => (
                                <Card key={`top-${league.id}`} className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-3 flex-1">
                                      <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                          <h3 className="font-semibold text-lg">{league.name}</h3>
                                          <Badge variant={getStatusColor(league.status)} className="flex items-center gap-1">
                                            {getStatusIcon(league.status)}
                                            {league.status}
                                          </Badge>
                        </div>
                                        {league.sponsor && (
                                          <Badge variant="outline" className="text-xs">
                                            <IconUser className="size-3 mr-1" />
                                            {league.sponsor.name}
                                          </Badge>
                          )}
                        </div>

                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                          <IconUsers className="size-4 text-muted-foreground" />
                                          <span>{league.participants}/{league.maxParticipants} players</span>
                                        </div>
                                <div className="flex items-center gap-2">
                                          <IconTarget className="size-4 text-muted-foreground" />
                                          <span>{league.divisions} divisions</span>
                                </div>
                                <div className="flex items-center gap-2">
                                          <IconCalendar className="size-4 text-muted-foreground" />
                                          <span>{league.seasons} seasons</span>
                                </div>
                                <div className="flex items-center gap-2">
                                          <IconCurrencyDollar className="size-4 text-muted-foreground" />
                                          <span>RM {league.revenue.toLocaleString()}</span>
                                </div>
                        </div>

                                      {league.matches.total > 0 && (
                        <div className="space-y-2">
                                          <div className="flex justify-between text-sm">
                                            <span>Match Progress</span>
                                            <span>{league.matches.completed}/{league.matches.total}</span>
                                          </div>
                                          <Progress 
                                            value={(league.matches.completed / league.matches.total) * 100} 
                                            className="h-2"
                                          />
                            </div>
                          )}

                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <IconGift className="size-4" />
                                        <span>RM {league.prizes.total.toLocaleString()} prize pool ({league.prizes.positions} positions)</span>
                              </div>
                            </div>
                            
                                    <div className="flex flex-col gap-2 ml-4">
                                      <Button size="sm" onClick={() => handleViewLeague(league)}>
                                        <IconEye className="size-4 mr-1" />
                                        View
                              </Button>
                                      <Button variant="outline" size="sm" onClick={() => handleEditLeague(league)}>
                                        <IconEdit className="size-4 mr-1" />
                                        Edit
                              </Button>
                            </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                            <Separator />
                          </div>
                        )}

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground">All Leagues</h3>
                            <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages}</span>
                              </div>
                          <div className="space-y-3 transition-opacity duration-300">
                            {paginatedLeagues.map((league) => (
                              <Card key={league.id} className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg">{league.name}</h3>
                                        <Badge variant={getStatusColor(league.status)} className="flex items-center gap-1">
                                          {getStatusIcon(league.status)}
                                          {league.status}
                                        </Badge>
                              </div>
                                      {league.sponsor && (
                                        <Badge variant="outline" className="text-xs">
                                          <IconUser className="size-3 mr-1" />
                                          {league.sponsor.name}
                                        </Badge>
                                      )}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                      <div className="flex items-center gap-2">
                                        <IconUsers className="size-4 text-muted-foreground" />
                                        <span>{league.participants}/{league.maxParticipants} players</span>
                                  </div>
                                      <div className="flex items-center gap-2">
                                        <IconTarget className="size-4 text-muted-foreground" />
                                        <span>{league.divisions} divisions</span>
                        </div>
                                      <div className="flex items-center gap-2">
                                        <IconCalendar className="size-4 text-muted-foreground" />
                                        <span>{league.seasons} seasons</span>
                      </div>
                                      <div className="flex items-center gap-2">
                                        <IconCurrencyDollar className="size-4 text-muted-foreground" />
                                        <span>RM {league.revenue.toLocaleString()}</span>
                                </div>
                              </div>

                                    {league.matches.total > 0 && (
                                      <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                          <span>Match Progress</span>
                                          <span>{league.matches.completed}/{league.matches.total}</span>
                      </div>
                                        <Progress 
                                          value={(league.matches.completed / league.matches.total) * 100} 
                                          className="h-2"
                                        />
                                  </div>
                                    )}

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <IconGift className="size-4" />
                                      <span>RM {league.prizes.total.toLocaleString()} prize pool ({league.prizes.positions} positions)</span>
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-2 ml-4">
                                    <Button size="sm" onClick={() => handleViewLeague(league)}>
                                      <IconEye className="size-4 mr-1" />
                                      View
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleEditLeague(league)}>
                                      <IconEdit className="size-4 mr-1" />
                                      Edit
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>

                          <Pagination className="pt-2">
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious
                                  href="#"
                                  className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                                  onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.max(1, p - 1)); }}
                                />
                              </PaginationItem>
                              {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .slice(
                                  Math.max(0, currentPage - 3),
                                  Math.min(totalPages, Math.max(0, currentPage - 3) + 5)
                                )
                                .map((page) => (
                                  <PaginationItem key={page}>
                                    <PaginationLink
                                      href="#"
                                      isActive={page === currentPage}
                                      onClick={(e) => { e.preventDefault(); setCurrentPage(page); }}
                                    >
                                      {page}
                                    </PaginationLink>
                                  </PaginationItem>
                                ))}
                              <PaginationItem>
                                <PaginationNext
                                  href="#"
                                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                                  onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.min(totalPages, p + 1)); }}
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                                </div>
                              </div>
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