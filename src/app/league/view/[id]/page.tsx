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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { IconArrowLeft } from "@tabler/icons-react";
import { toast } from "sonner";
import axiosInstance, { endpoints } from "@/lib/endpoints";

// Import the LeagueTabs component
import { LeagueTabs } from "@/components/league/league-tabs";

// Import shared types
import { 
  League, 
  Player, 
  Division, 
  Season, 
  Category, 
  Sponsor 
} from "@/components/league/types";
import { EditSponsorModal } from "@/components/modal/edit-sponsor-modal";
import { CreateSponsorModal } from "@/components/modal/sponsor-create-modal";

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
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCreateSponsorOpen, setIsCreateSponsorOpen] = useState(false);
  const [isEditSponsorOpen, setIsEditSponsorOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);


  const handleAddSponsor = () => setIsCreateSponsorOpen(true);
const handleEditSponsor = (sponsor: Sponsor) => {
  setSelectedSponsor(sponsor);
  setIsEditSponsorOpen(true);
};

useEffect(() => {
  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data: apiData } = await axiosInstance.get(endpoints.league.getById(leagueId));
      const leagueData = apiData?.data?.league;

      if (!leagueData) {
        toast.error("League not found");
        return;
      }

      // Set league
      const {
        id,
        name,
        sportType,
        location,
        status,
        joinType,
        gameType,
        createdAt,
        updatedAt,
        description,
        createdBy,
        _count: { memberships = 0, seasons = 0, categories = 0 } = {},
        sponsorships = [], // <- destructure sponsorships
      } = leagueData;

      setLeague({
        id,
        name,
        sportType,
        location,
        status,
        joinType,
        gameType,
        createdAt,
        updatedAt,
        description,
        memberCount: memberships,
        seasonCount: seasons,
        categoryCount: categories,
        createdBy,
      });

      // Set related arrays
      setPlayers([]); // can populate when endpoint exists
      setDivisions([]);
      setSeasons([]);
      setCategories([]);

      // Map sponsorships to your Sponsor interface
      const transformedSponsors = sponsorships.map((s: any) => ({
        id: s.id,
        packageTier: s.packageTier,
        contractAmount: s.contractAmount,
        sponsorRevenue: s.sponsorRevenue,
        sponsoredName: s.sponsoredName,
        isActive: s.isActive,
        createdById: s.createdById,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      }));

      setSponsors(transformedSponsors);

    } catch (error) {
      console.error("Error loading league data:", error);
      toast.error("Failed to load league details");
    } finally {
      setIsLoading(false);
    }
  };

  if (leagueId) loadData();
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

  const handleSeasonCreated = () => {
    // Refresh the seasons data when a new season is created
    console.log("Season created, refreshing data...");
    // TODO: Implement actual data refresh when season endpoints are available
    // For now, this will just log the event
  };

  if (isLoading) {
    return <LeagueSkeleton />;
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

                  </div>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="flex-1 px-4 lg:px-6 py-6">
                <LeagueTabs
                  league={league}
                  players={players}
                  divisions={divisions}
                  seasons={seasons}
                  categories={categories}
                  sponsors={sponsors}
                  getLocationLabel={getLocationLabel}
                  getSportLabel={getSportLabel}
                  getStatusBadge={getStatusBadge}
                  formatDate={formatDate}
                  calculateWinRate={calculateWinRate}
                  onSeasonCreated={handleSeasonCreated}
                  onEditSponsor={handleEditSponsor}
                  onAddSponsor={handleAddSponsor}
                />
              </div>

                 <CreateSponsorModal
        open={isCreateSponsorOpen}
        onOpenChange={setIsCreateSponsorOpen}
        leagueId={league?.id!}
        onSponsorCreated={() => {
          setIsCreateSponsorOpen(false);
          // Reload sponsors
        }}
      />

      <EditSponsorModal
        open={isEditSponsorOpen}
        onOpenChange={setIsEditSponsorOpen}
        sponsor={selectedSponsor}
        onSponsorUpdated={() => {
          setIsEditSponsorOpen(false);
          // Reload sponsors
        }}
      />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

const LeagueSkeleton = () => (
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
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-6">
            {/* Page Header Skeleton */}
            <div className="border-b bg-white">
              <div className="px-4 lg:px-6 py-6">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center">
                    <Skeleton className="h-8 w-32" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content Skeleton */}
            <div className="flex-1 px-4 lg:px-6 py-6">
              <div className="space-y-6">
                {/* Tabs Skeleton */}
                <div className="grid w-full grid-cols-6 gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>

                {/* Content Skeleton */}
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Left Column */}
                  <div className="md:col-span-1 space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Skeleton className="size-16 rounded-lg" />
                            <div className="space-y-2">
                              <Skeleton className="h-7 w-32" />
                              <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-5 w-18" />
                              </div>
                            </div>
                          </div>
                          <Skeleton className="h-8 w-8 rounded" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-5/6" />
                        <Skeleton className="h-5 w-4/6" />
                        <Skeleton className="h-5 w-full" />
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Right Column */}
                  <div className="md:col-span-2 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                          <CardContent className="p-6">
                            <div className="flex items-center gap-2">
                              <Skeleton className="size-5 rounded" />
                              <div className="space-y-1">
                                <Skeleton className="h-6 w-8" />
                                <Skeleton className="h-4 w-20" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Cards */}
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Card key={i}>
                        <CardHeader>
                          <Skeleton className="h-6 w-40" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {Array.from({ length: 3 }).map((_, j) => (
                            <Skeleton key={j} className="h-16 w-full" />
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
);

