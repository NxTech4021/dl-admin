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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  IconArrowLeft,
  IconTrophy,
  IconUsers,
  IconPlus,
  IconEdit,
  IconTrash,
  IconUserPlus,
  IconUserMinus,
  IconSearch,
  IconFilter,
  IconDownload,
  IconStar,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCalendar
} from "@tabler/icons-react";
import { toast } from "sonner";
 

interface Player {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  rating: number;
  division: string;
  status: "active" | "inactive" | "suspended";
  joinedDate: string;
  lastActive: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  winPercentage: number;
  location?: string;
  emergencyContact?: string;
  medicalInfo?: string;
  notes?: string;
}

interface League {
  id: string;
  name: string;
  sport: string;
  location: string;
  status: string;
  maxPlayers: number;
  currentPlayers: number;
}

// Mock league lookup by id to reflect current league route
const mockLeaguesById: Record<string, League> = {
  "1": { id: "1", name: "KL Tennis Championship", sport: "tennis", location: "Kuala Lumpur", status: "active", maxPlayers: 32, currentPlayers: 24 },
  "2": { id: "2", name: "PJ Tennis League", sport: "tennis", location: "Petaling Jaya", status: "registration", maxPlayers: 24, currentPlayers: 16 },
  "3": { id: "3", name: "Subang Table Tennis Pro", sport: "table-tennis", location: "Subang Jaya", status: "completed", maxPlayers: 28, currentPlayers: 28 },
};

const mockPlayers: Player[] = [
  {
    id: "p1",
    userId: "u1",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+60123456789",
    rating: 4.5,
    division: "Division A",
    status: "active",
    joinedDate: "2024-01-15",
    lastActive: "2024-01-26",
    matchesPlayed: 7,
    wins: 6,
    losses: 1,
    winPercentage: 85.7,
    location: "Kuala Lumpur",
    emergencyContact: "Jane Smith - +60123456788",
    notes: "Experienced player, good sportsmanship",
  },
  {
    id: "p2",
    userId: "u2",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+60123456790",
    rating: 4.2,
    division: "Division A",
    status: "active",
    joinedDate: "2024-01-16",
    lastActive: "2024-01-25",
    matchesPlayed: 6,
    wins: 3,
    losses: 3,
    winPercentage: 50.0,
    location: "Petaling Jaya",
  },
  {
    id: "p3",
    name: "Mike Davis",
    email: "mike.davis@email.com",
    rating: 4.8,
    division: "Division A",
    status: "active",
    joinedDate: "2024-01-10",
    lastActive: "2024-01-26",
    matchesPlayed: 8,
    wins: 7,
    losses: 1,
    winPercentage: 87.5,
    location: "Kuala Lumpur",
  },
  {
    id: "p4",
    name: "Emily Brown",
    email: "emily.b@email.com",
    rating: 4.0,
    division: "Division B",
    status: "inactive",
    joinedDate: "2024-01-12",
    lastActive: "2024-01-20",
    matchesPlayed: 5,
    wins: 1,
    losses: 4,
    winPercentage: 20.0,
    location: "Shah Alam",
    notes: "Requested temporary break",
  },
];

// Available users not in league
const mockAvailableUsers = [
  { id: "u5", name: "Alex Wilson", email: "alex.wilson@email.com", rating: 4.3 },
  { id: "u6", name: "Lisa Chen", email: "lisa.chen@email.com", rating: 4.1 },
  { id: "u7", name: "David Kim", email: "david.kim@email.com", rating: 3.8 },
  { id: "u8", name: "Maria Garcia", email: "maria.garcia@email.com", rating: 4.6 },
];

export default function PlayerManagementPage() {
  const router = useRouter();
  const params = useParams();
  const leagueId = params.id as string;

  const [league, setLeague] = useState<League | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [availableUsers, setAvailableUsers] = useState(mockAvailableUsers);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [divisionFilter, setDivisionFilter] = useState<string>("all");
  
  // Add player dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [newPlayerDivision, setNewPlayerDivision] = useState("");
  
  // Edit player dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    rating: 0,
    division: "",
    status: "active" as Player["status"],
    location: "",
    emergencyContact: "",
    notes: "",
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API calls
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const resolvedLeague = mockLeaguesById[leagueId] ?? null;
        setLeague(resolvedLeague);
        setPlayers(mockPlayers);
      } catch (error) {
        console.error("Error loading player data:", error);
        toast.error("Failed to load player details");
      } finally {
        setIsLoading(false);
      }
    };

    if (leagueId) {
      loadData();
    }
  }, [leagueId]);

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || player.status === statusFilter;
    const matchesDivision = divisionFilter === "all" || player.division === divisionFilter;
    
    return matchesSearch && matchesStatus && matchesDivision;
  });

  const handleAddPlayer = async () => {
    if (!selectedUser || !newPlayerDivision) {
      toast.error("Please select a user and division");
      return;
    }

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = availableUsers.find(u => u.id === selectedUser);
      if (user) {
        console.log("Adding player to league:", { userId: selectedUser, division: newPlayerDivision });
        toast.success(`${user.name} added to league successfully!`);
        
        // Reset form
        setSelectedUser("");
        setNewPlayerDivision("");
        setIsAddDialogOpen(false);
        
        // TODO: Refresh players list
      }
    } catch (error) {
      console.error("Error adding player:", error);
      toast.error("Failed to add player");
    }
  };

  const handleEditPlayer = async () => {
    if (!editingPlayer) return;

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Updating player:", editingPlayer.id, editForm);
      toast.success("Player updated successfully!");
      
      setEditingPlayer(null);
      setIsEditDialogOpen(false);
      
      // TODO: Refresh players list
    } catch (error) {
      console.error("Error updating player:", error);
      toast.error("Failed to update player");
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Removing player from league:", playerId);
      toast.success("Player removed from league");
      
      // TODO: Refresh players list
    } catch (error) {
      console.error("Error removing player:", error);
      toast.error("Failed to remove player");
    }
  };

  const handleBulkRemove = async () => {
    if (selectedPlayers.length === 0) {
      toast.error("No players selected");
      return;
    }

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Removing players from league:", selectedPlayers);
      toast.success(`${selectedPlayers.length} players removed from league`);
      
      setSelectedPlayers([]);
      
      // TODO: Refresh players list
    } catch (error) {
      console.error("Error removing players:", error);
      toast.error("Failed to remove players");
    }
  };

  const openEditDialog = (player: Player) => {
    setEditingPlayer(player);
    setEditForm({
      name: player.name,
      email: player.email,
      phone: player.phone || "",
      rating: player.rating,
      division: player.division,
      status: player.status,
      location: player.location || "",
      emergencyContact: player.emergencyContact || "",
      notes: player.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: Player["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
              <p className="text-muted-foreground">Loading player data...</p>
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
        <SiteHeader items={[{ label: "League", href: "/league" }, { label: league ? league.name : "Details", href: `/league/view/${leagueId}` }, { label: "Players" }]} />
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
                          <IconUsers className="size-8 text-primary" />
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold tracking-tight">Player Management</h1>
                          <p className="text-muted-foreground">
                            {league.name} - Manage league players and registrations
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <IconUserPlus className="size-4 mr-2" />
                            Add Player
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Player to League</DialogTitle>
                            <DialogDescription>
                              Select a user and assign them to a division
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="user">Select User</Label>
                              <Select value={selectedUser} onValueChange={setSelectedUser}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a user to add" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableUsers.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                      <div className="flex items-center justify-between w-full">
                                        <span>{user.name}</span>
                                        <div className="flex items-center gap-2 ml-4">
                                          <Badge variant="outline" className="text-xs">
                                            {user.rating}
                                          </Badge>
                                          <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="division">Division</Label>
                              <Select value={newPlayerDivision} onValueChange={setNewPlayerDivision}>
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
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleAddPlayer}>
                              Add Player
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {selectedPlayers.length > 0 && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                              <IconUserMinus className="size-4 mr-2" />
                              Remove Selected ({selectedPlayers.length})
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Players</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {selectedPlayers.length} selected players from this league?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleBulkRemove}>
                                Remove Players
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 px-4 lg:px-6 py-6">
                <div className="space-y-6">
                  {/* League Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Players</p>
                            <p className="text-3xl font-bold">{league.currentPlayers}</p>
                            <p className="text-xs text-muted-foreground">of {league.maxPlayers} max</p>
                          </div>
                          <IconUsers className="size-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Active Players</p>
                            <p className="text-3xl font-bold text-green-600">
                              {players.filter(p => p.status === "active").length}
                            </p>
                          </div>
                          <IconUserPlus className="size-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                            <p className="text-3xl font-bold text-yellow-600">
                              {players.filter(p => p.status === "inactive").length}
                            </p>
                          </div>
                          <IconUserMinus className="size-8 text-yellow-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Available Spots</p>
                            <p className="text-3xl font-bold text-blue-600">
                              {league.maxPlayers - league.currentPlayers}
                            </p>
                          </div>
                          <IconPlus className="size-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Filters and Search */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Players</CardTitle>
                      <CardDescription>Manage all players in this league</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                          <div className="relative">
                            <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search players..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-8"
                            />
                          </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={divisionFilter} onValueChange={setDivisionFilter}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by division" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Divisions</SelectItem>
                            <SelectItem value="Division A">Division A</SelectItem>
                            <SelectItem value="Division B">Division B</SelectItem>
                            <SelectItem value="Division C">Division C</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <Checkbox
                                checked={selectedPlayers.length === filteredPlayers.length && filteredPlayers.length > 0}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedPlayers(filteredPlayers.map(p => p.id));
                                  } else {
                                    setSelectedPlayers([]);
                                  }
                                }}
                              />
                            </TableHead>
                            <TableHead>Player</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Division</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Performance</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPlayers.map((player) => (
                            <TableRow key={player.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedPlayers.includes(player.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedPlayers([...selectedPlayers, player.id]);
                                    } else {
                                      setSelectedPlayers(selectedPlayers.filter(id => id !== player.id));
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">{player.name}</div>
                                  {player.userId && (
                                    <Badge variant="outline" className="text-xs">
                                      Linked Account
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-sm">
                                    <IconMail className="size-3" />
                                    {player.email}
                                  </div>
                                  {player.phone && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <IconPhone className="size-3" />
                                      {player.phone}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <IconStar className="size-4 text-yellow-500" />
                                  <span className="font-medium">{player.rating}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{player.division}</Badge>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(player.status)}
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm font-medium">
                                    {player.wins}W - {player.losses}L
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {player.winPercentage}% win rate
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm">{formatDate(player.joinedDate)}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Last active: {formatDate(player.lastActive)}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditDialog(player)}
                                  >
                                    <IconEdit className="size-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <IconTrash className="size-4 text-red-500" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Remove Player</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to remove {player.name} from this league?
                                          This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleRemovePlayer(player.id)}>
                                          Remove Player
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

      {/* Edit Player Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Player</DialogTitle>
            <DialogDescription>
              Update player information and settings
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={editForm.rating}
                  onChange={(e) => setEditForm(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="division">Division</Label>
                <Select value={editForm.division} onValueChange={(value) => setEditForm(prev => ({ ...prev, division: value }))}>
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
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={editForm.status} onValueChange={(value: Player["status"]) => setEditForm(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editForm.location}
                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency">Emergency Contact</Label>
                <Input
                  id="emergency"
                  value={editForm.emergencyContact}
                  onChange={(e) => setEditForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={editForm.notes}
                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this player..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPlayer}>
              Update Player
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
