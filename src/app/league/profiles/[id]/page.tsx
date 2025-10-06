"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  IconArrowLeft,
  IconPlus,
  IconUsers,
  IconTrophy,
  IconEdit,
  IconTrash,
  IconMail,
  IconPhone,
  IconCalendar,
  IconStar,
  IconTarget,
  IconCheck,
  IconX,
  IconUser,
  IconSearch,
  IconFilter,
  IconEye,
} from "@tabler/icons-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface UserAccount {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  dateJoined: string;
  lastActive: string;
  isVerified: boolean;
  status: "active" | "inactive" | "suspended";
}

interface PlayerProfile {
  id: string;
  userId: string;
  leagueId: string;
  rating: number;
  wins: number;
  losses: number;
  points: number;
  divisionId?: string;
  joinDate: string;
  status: "active" | "inactive" | "suspended";
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalNotes?: string;
  preferences?: {
    preferredTime: string;
    availableDays: string[];
  };
}

interface League {
  id: string;
  name: string;
  sport: string;
  totalPlayers: number;
}

// Mock data
const mockLeague: League = {
  id: "league-1",
  name: "Kuala Lumpur Badminton League",
  sport: "Badminton",
  totalPlayers: 48,
};

const mockUserAccounts: UserAccount[] = [
  {
    id: "user-1",
    email: "ahmad.rahman@email.com",
    firstName: "Ahmad",
    lastName: "Rahman",
    phone: "+60123456789",
    avatar: "/avatars/ahmad.jpg",
    dateJoined: "2023-01-15",
    lastActive: "2024-10-04",
    isVerified: true,
    status: "active"
  },
  {
    id: "user-2",
    email: "lim.weiming@email.com",
    firstName: "Lim",
    lastName: "Wei Ming",
    phone: "+60198765432",
    dateJoined: "2023-02-20",
    lastActive: "2024-10-03",
    isVerified: true,
    status: "active"
  },
  {
    id: "user-3",
    email: "siti.nurhaliza@email.com",
    firstName: "Siti",
    lastName: "Nurhaliza",
    phone: "+60187654321",
    dateJoined: "2023-03-10",
    lastActive: "2024-10-04",
    isVerified: true,
    status: "active"
  },
  // Unlinked users
  {
    id: "user-4",
    email: "john.doe@email.com",
    firstName: "John",
    lastName: "Doe",
    phone: "+60176543210",
    dateJoined: "2024-09-15",
    lastActive: "2024-10-02",
    isVerified: true,
    status: "active"
  },
  {
    id: "user-5",
    email: "jane.smith@email.com",
    firstName: "Jane",
    lastName: "Smith",
    phone: "+60165432109",
    dateJoined: "2024-09-20",
    lastActive: "2024-10-01",
    isVerified: false,
    status: "active"
  }
];

const mockPlayerProfiles: PlayerProfile[] = [
  {
    id: "player-1",
    userId: "user-1",
    leagueId: "league-1",
    rating: 1950,
    wins: 8,
    losses: 2,
    points: 24,
    divisionId: "div-1",
    joinDate: "2023-01-20",
    status: "active",
    emergencyContact: {
      name: "Fatimah Rahman",
      phone: "+60123456790",
      relationship: "Spouse"
    },
    medicalNotes: "No known medical conditions",
    preferences: {
      preferredTime: "Evening",
      availableDays: ["Monday", "Wednesday", "Friday"]
    }
  },
  {
    id: "player-2",
    userId: "user-2",
    leagueId: "league-1",
    rating: 1880,
    wins: 7,
    losses: 3,
    points: 21,
    divisionId: "div-1",
    joinDate: "2023-02-25",
    status: "active",
    emergencyContact: {
      name: "Mary Lim",
      phone: "+60198765433",
      relationship: "Mother"
    },
    preferences: {
      preferredTime: "Morning",
      availableDays: ["Tuesday", "Thursday", "Saturday"]
    }
  },
  {
    id: "player-3",
    userId: "user-3",
    leagueId: "league-1",
    rating: 1820,
    wins: 6,
    losses: 4,
    points: 18,
    divisionId: "div-1",
    joinDate: "2023-03-15",
    status: "active",
    emergencyContact: {
      name: "Ali Nurhaliza",
      phone: "+60187654322",
      relationship: "Brother"
    },
    medicalNotes: "Mild knee injury - avoid excessive jumping",
    preferences: {
      preferredTime: "Afternoon",
      availableDays: ["Monday", "Tuesday", "Thursday", "Sunday"]
    }
  }
];

export default function PlayerProfilesPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;
  
  const [league, setLeague] = useState<League>(mockLeague);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(mockUserAccounts);
  const [playerProfiles, setPlayerProfiles] = useState<PlayerProfile[]>(mockPlayerProfiles);
  const [selectedTab, setSelectedTab] = useState("linked");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLinkingPlayer, setIsLinkingPlayer] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  const handleBack = () => {
    router.push(`/league/view/${leagueId}`);
  };

  const getLinkedPlayers = () => {
    return playerProfiles.map(profile => {
      const user = userAccounts.find(u => u.id === profile.userId);
      return { ...profile, user };
    }).filter(p => p.user);
  };

  const getUnlinkedUsers = () => {
    const linkedUserIds = playerProfiles.map(p => p.userId);
    return userAccounts.filter(user => !linkedUserIds.includes(user.id));
  };

  const handleLinkPlayer = (user: UserAccount) => {
    const newProfile: PlayerProfile = {
      id: `player-${Date.now()}`,
      userId: user.id,
      leagueId: leagueId,
      rating: 1000, // Default rating
      wins: 0,
      losses: 0,
      points: 0,
      joinDate: new Date().toISOString().split('T')[0],
      status: "active"
    };

    setPlayerProfiles([...playerProfiles, newProfile]);
    setIsLinkingPlayer(false);
    setSelectedUser(null);
    toast.success(`${user.firstName} ${user.lastName} linked to league successfully!`);
  };

  const handleUnlinkPlayer = (profileId: string) => {
    const profile = playerProfiles.find(p => p.id === profileId);
    if (!profile) return;

    const user = userAccounts.find(u => u.id === profile.userId);
    if (confirm(`Are you sure you want to unlink ${user?.firstName} ${user?.lastName} from this league?`)) {
      setPlayerProfiles(playerProfiles.filter(p => p.id !== profileId));
      toast.success("Player unlinked successfully!");
    }
  };

  const handleViewProfile = (userId: string) => {
    router.push(`/user/profile/${userId}`);
  };

  const handleEditProfile = (profileId: string) => {
    router.push(`/league/player/edit/${profileId}`);
  };

  const filteredLinkedPlayers = getLinkedPlayers().filter(player => {
    if (!searchQuery) return true;
    const user = player.user!;
    return (
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredUnlinkedUsers = getUnlinkedUsers().filter(user => {
    if (!searchQuery) return true;
    return (
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "inactive": return "secondary";
      case "suspended": return "destructive";
      default: return "outline";
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
        <SiteHeader items={[{ label: "League", href: "/league" }, { label: league ? league.name : "Details", href: `/league/view/${leagueId}` }, { label: "Profiles" }]} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6">
              {/* Page Header */}
              <div className="border-b bg-gradient-to-r from-background/95 to-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-4 lg:px-6 py-8">
                  <div className="flex flex-col gap-6">
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem>
                          <BreadcrumbLink href="/league">League</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbLink href={`/league/view/${leagueId}`}>{league?.name || "Details"}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>Profiles</BreadcrumbPage>
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
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
                              <IconUser className="size-8 text-primary" />
                            </div>
                            <div>
                              <h1 className="text-3xl font-bold tracking-tight">Player Profiles</h1>
                              <p className="text-muted-foreground">
                                Manage player accounts and profiles for {league.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Dialog open={isLinkingPlayer} onOpenChange={setIsLinkingPlayer}>
                        <DialogTrigger asChild>
                          <Button>
                            <IconPlus className="mr-2 h-4 w-4" />
                            Link Player Account
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Link Player Account</DialogTitle>
                            <DialogDescription>
                              Select a user account to link with this league
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Search Users</Label>
                              <Input
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                            </div>
                            <div className="max-h-96 overflow-y-auto space-y-2">
                              {filteredUnlinkedUsers.map((user) => (
                                <Card key={user.id} className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Avatar>
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback>
                                          {user.firstName[0]}{user.lastName[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="font-medium">
                                          {user.firstName} {user.lastName}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {user.email}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Badge variant={getStatusBadgeVariant(user.status)}>
                                            {user.status}
                                          </Badge>
                                          {user.isVerified && (
                                            <Badge variant="outline">Verified</Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() => handleLinkPlayer(user)}
                                    >
                                      <IconCheck className="size-4 mr-2" />
                                      Link
                                    </Button>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 px-4 lg:px-6 py-6">
                <div className="space-y-6">
                  {/* Overview Cards */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Linked Players</CardTitle>
                        <IconUsers className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{playerProfiles.length}</div>
                        <p className="text-xs text-muted-foreground">
                          Connected to user accounts
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available Users</CardTitle>
                        <IconUser className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{getUnlinkedUsers().length}</div>
                        <p className="text-xs text-muted-foreground">Ready to link</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
                        <IconCheck className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {userAccounts.filter(u => u.isVerified).length}
                        </div>
                        <p className="text-xs text-muted-foreground">Email verified</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Players</CardTitle>
                        <IconTrophy className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {playerProfiles.filter(p => p.status === "active").length}
                        </div>
                        <p className="text-xs text-muted-foreground">Currently playing</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Main Content */}
                  <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                    <div className="flex items-center justify-between">
                      <TabsList>
                        <TabsTrigger value="linked">Linked Players</TabsTrigger>
                        <TabsTrigger value="available">Available Users</TabsTrigger>
                      </TabsList>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Search players..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-64"
                        />
                      </div>
                    </div>

                    <TabsContent value="linked" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Linked Player Accounts</CardTitle>
                          <CardDescription>
                            Players who have connected user accounts in this league
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Player</TableHead>
                                <TableHead>Account Details</TableHead>
                                <TableHead>League Stats</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredLinkedPlayers.map((player) => {
                                const user = player.user!;
                                return (
                                  <TableRow key={player.id}>
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        <Avatar>
                                          <AvatarImage src={user.avatar} />
                                          <AvatarFallback>
                                            {user.firstName[0]}{user.lastName[0]}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <div className="font-medium">
                                            {user.firstName} {user.lastName}
                                          </div>
                                          <div className="text-sm text-muted-foreground">
                                            Rating: {player.rating}
                                          </div>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm">
                                          <IconMail className="size-3" />
                                          {user.email}
                                        </div>
                                        {user.phone && (
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <IconPhone className="size-3" />
                                            {user.phone}
                                          </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                          <Badge variant={getStatusBadgeVariant(user.status)}>
                                            {user.status}
                                          </Badge>
                                          {user.isVerified && (
                                            <Badge variant="outline">Verified</Badge>
                                          )}
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="space-y-1 text-sm">
                                        <div>{player.wins}W - {player.losses}L</div>
                                        <div className="text-muted-foreground">
                                          {player.points} points
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant={getStatusBadgeVariant(player.status)}>
                                        {player.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <div className="text-sm">
                                        {formatDate(player.joinDate)}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleViewProfile(user.id)}
                                        >
                                          <IconEye className="size-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleEditProfile(player.id)}
                                        >
                                          <IconEdit className="size-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleUnlinkPlayer(player.id)}
                                        >
                                          <IconX className="size-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="available" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Available User Accounts</CardTitle>
                          <CardDescription>
                            User accounts that can be linked to this league
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Account Status</TableHead>
                                <TableHead>Joined Platform</TableHead>
                                <TableHead>Last Active</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredUnlinkedUsers.map((user) => (
                                <TableRow key={user.id}>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <Avatar>
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback>
                                          {user.firstName[0]}{user.lastName[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="font-medium">
                                          {user.firstName} {user.lastName}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {user.email}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {user.phone && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <IconPhone className="size-3" />
                                        {user.phone}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Badge variant={getStatusBadgeVariant(user.status)}>
                                        {user.status}
                                      </Badge>
                                      {user.isVerified && (
                                        <Badge variant="outline">Verified</Badge>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      {formatDate(user.dateJoined)}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      {formatDate(user.lastActive)}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleViewProfile(user.id)}
                                      >
                                        <IconEye className="size-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleLinkPlayer(user)}
                                      >
                                        <IconCheck className="size-4 mr-1" />
                                        Link
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
