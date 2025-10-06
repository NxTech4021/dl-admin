"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconArrowLeft,
  IconPlus,
  IconUsers,
  IconTrophy,
  IconEdit,
  IconTrash,
  IconTarget,
  IconStar,
  IconArrowUp,
  IconArrowDown,
  IconArrowsShuffle,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconSettings,
} from "@tabler/icons-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
 

interface Division {
  id: string;
  name: string;
  level: number;
  minRating: number;
  maxRating: number;
  playerCount: number;
  maxPlayers: number;
  status: "active" | "full" | "draft";
  description?: string;
  color: string;
}

interface Player {
  id: string;
  name: string;
  rating: number;
  divisionId: string;
  wins: number;
  losses: number;
  points: number;
  status: "active" | "inactive";
}

interface League {
  id: string;
  name: string;
  sport: string;
  totalPlayers: number;
  totalDivisions: number;
}

// Mock data
const mockLeague: League = {
  id: "league-1",
  name: "Kuala Lumpur Badminton League",
  sport: "Badminton",
  totalPlayers: 48,
  totalDivisions: 4,
};

const mockDivisions: Division[] = [
  {
    id: "div-1",
    name: "Premier Division",
    level: 1,
    minRating: 1800,
    maxRating: 2200,
    playerCount: 12,
    maxPlayers: 12,
    status: "full",
    description: "Elite level players",
    color: "#FFD700", // Gold
  },
  {
    id: "div-2",
    name: "Division 1",
    level: 2,
    minRating: 1500,
    maxRating: 1799,
    playerCount: 14,
    maxPlayers: 16,
    status: "active",
    description: "Advanced competitive players",
    color: "#C0C0C0", // Silver
  },
  {
    id: "div-3",
    name: "Division 2",
    level: 3,
    minRating: 1200,
    maxRating: 1499,
    playerCount: 16,
    maxPlayers: 16,
    status: "full",
    description: "Intermediate level players",
    color: "#CD7F32", // Bronze
  },
  {
    id: "div-4",
    name: "Division 3",
    level: 4,
    minRating: 800,
    maxRating: 1199,
    playerCount: 6,
    maxPlayers: 12,
    status: "active",
    description: "Beginner to intermediate players",
    color: "#4A90E2", // Blue
  },
];

const mockPlayers: Player[] = [
  // Premier Division
  { id: "p1", name: "Ahmad Rahman", rating: 1950, divisionId: "div-1", wins: 8, losses: 2, points: 24, status: "active" },
  { id: "p2", name: "Lim Wei Ming", rating: 1880, divisionId: "div-1", wins: 7, losses: 3, points: 21, status: "active" },
  { id: "p3", name: "Siti Nurhaliza", rating: 1820, divisionId: "div-1", wins: 6, losses: 4, points: 18, status: "active" },
  
  // Division 1
  { id: "p4", name: "Raj Kumar", rating: 1650, divisionId: "div-2", wins: 9, losses: 1, points: 27, status: "active" },
  { id: "p5", name: "Chen Li Hua", rating: 1580, divisionId: "div-2", wins: 5, losses: 5, points: 15, status: "active" },
  { id: "p6", name: "Fatimah Ali", rating: 1520, divisionId: "div-2", wins: 4, losses: 6, points: 12, status: "active" },
  
  // Division 2
  { id: "p7", name: "David Tan", rating: 1350, divisionId: "div-3", wins: 7, losses: 3, points: 21, status: "active" },
  { id: "p8", name: "Maria Santos", rating: 1280, divisionId: "div-3", wins: 6, losses: 4, points: 18, status: "active" },
  { id: "p9", name: "Kumar Patel", rating: 1220, divisionId: "div-3", wins: 3, losses: 7, points: 9, status: "active" },
  
  // Division 3
  { id: "p10", name: "Sarah Johnson", rating: 1050, divisionId: "div-4", wins: 4, losses: 2, points: 12, status: "active" },
  { id: "p11", name: "Ali Hassan", rating: 950, divisionId: "div-4", wins: 2, losses: 4, points: 6, status: "active" },
  { id: "p12", name: "Jenny Wong", rating: 880, divisionId: "div-4", wins: 1, losses: 5, points: 3, status: "active" },
];

export default function DivisionManagementPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;
  
  const [league, setLeague] = useState<League>(mockLeague);
  const [divisions, setDivisions] = useState<Division[]>(mockDivisions);
  const [players, setPlayers] = useState<Player[]>(mockPlayers);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(divisions[0]);
  const [isCreateDivisionOpen, setIsCreateDivisionOpen] = useState(false);
  const [isEditDivisionOpen, setIsEditDivisionOpen] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [newDivision, setNewDivision] = useState({
    name: "",
    minRating: 0,
    maxRating: 0,
    maxPlayers: 12,
    description: "",
    color: "#4A90E2",
  });

  const handleBack = () => {
    router.push(`/league/view/${leagueId}`);
  };

  const handleCreateDivision = () => {
    if (!newDivision.name.trim()) {
      toast.error("Division name is required");
      return;
    }

    if (newDivision.minRating >= newDivision.maxRating) {
      toast.error("Minimum rating must be less than maximum rating");
      return;
    }

    const division: Division = {
      id: `div-${Date.now()}`,
      name: newDivision.name,
      level: divisions.length + 1,
      minRating: newDivision.minRating,
      maxRating: newDivision.maxRating,
      playerCount: 0,
      maxPlayers: newDivision.maxPlayers,
      status: "draft",
      description: newDivision.description,
      color: newDivision.color,
    };

    setDivisions([...divisions, division]);
    setIsCreateDivisionOpen(false);
    setNewDivision({
      name: "",
      minRating: 0,
      maxRating: 0,
      maxPlayers: 12,
      description: "",
      color: "#4A90E2",
    });
    toast.success("Division created successfully!");
  };

  const handleEditDivision = (division: Division) => {
    setEditingDivision(division);
    setIsEditDivisionOpen(true);
  };

  const handleUpdateDivision = () => {
    if (!editingDivision) return;

    setDivisions(divisions.map(div => 
      div.id === editingDivision.id ? editingDivision : div
    ));
    setIsEditDivisionOpen(false);
    setEditingDivision(null);
    toast.success("Division updated successfully!");
  };

  const handleDeleteDivision = (division: Division) => {
    if (division.playerCount > 0) {
      toast.error("Cannot delete division with players. Move players first.");
      return;
    }

    if (confirm(`Are you sure you want to delete ${division.name}?`)) {
      setDivisions(divisions.filter(div => div.id !== division.id));
      if (selectedDivision?.id === division.id) {
        setSelectedDivision(divisions[0] || null);
      }
      toast.success("Division deleted successfully!");
    }
  };

  const handleAutoAssignPlayers = () => {
    // TODO: Implement auto-assignment based on ratings
    toast.success("Players auto-assigned to divisions based on ratings!");
  };

  const handlePromotePlayer = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const currentDivision = divisions.find(d => d.id === player.divisionId);
    if (!currentDivision || currentDivision.level === 1) {
      toast.error("Player is already in the highest division");
      return;
    }

    const higherDivision = divisions.find(d => d.level === currentDivision.level - 1);
    if (!higherDivision) return;

    if (higherDivision.playerCount >= higherDivision.maxPlayers) {
      toast.error("Target division is full");
      return;
    }

    // Update player's division
    setPlayers(players.map(p => 
      p.id === playerId ? { ...p, divisionId: higherDivision.id } : p
    ));

    // Update division player counts
    setDivisions(divisions.map(d => {
      if (d.id === currentDivision.id) return { ...d, playerCount: d.playerCount - 1 };
      if (d.id === higherDivision.id) return { ...d, playerCount: d.playerCount + 1 };
      return d;
    }));

    toast.success(`${player.name} promoted to ${higherDivision.name}!`);
  };

  const handleDemotePlayer = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const currentDivision = divisions.find(d => d.id === player.divisionId);
    if (!currentDivision || currentDivision.level === divisions.length) {
      toast.error("Player is already in the lowest division");
      return;
    }

    const lowerDivision = divisions.find(d => d.level === currentDivision.level + 1);
    if (!lowerDivision) return;

    if (lowerDivision.playerCount >= lowerDivision.maxPlayers) {
      toast.error("Target division is full");
      return;
    }

    // Update player's division
    setPlayers(players.map(p => 
      p.id === playerId ? { ...p, divisionId: lowerDivision.id } : p
    ));

    // Update division player counts
    setDivisions(divisions.map(d => {
      if (d.id === currentDivision.id) return { ...d, playerCount: d.playerCount - 1 };
      if (d.id === lowerDivision.id) return { ...d, playerCount: d.playerCount + 1 };
      return d;
    }));

    toast.success(`${player.name} moved to ${lowerDivision.name}!`);
  };

  const getDivisionPlayers = (divisionId: string) => {
    return players.filter(p => p.divisionId === divisionId);
  };

  const getStatusColor = (status: Division["status"]) => {
    switch (status) {
      case "active": return "default";
      case "full": return "secondary";
      case "draft": return "outline";
      default: return "outline";
    }
  };

  const predefinedColors = [
    "#FFD700", // Gold
    "#C0C0C0", // Silver
    "#CD7F32", // Bronze
    "#4A90E2", // Blue
    "#50C878", // Green
    "#FF6B6B", // Red
    "#9B59B6", // Purple
    "#F39C12", // Orange
  ];

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
        <SiteHeader items={[{ label: "League", href: "/league" }, { label: league ? league.name : "Details", href: `/league/view/${leagueId}` }, { label: "Divisions" }]} />
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
                              <IconTarget className="size-8 text-primary" />
                            </div>
                            <div>
                              <h1 className="text-3xl font-bold tracking-tight">Division Management</h1>
                              <p className="text-muted-foreground">
                                Manage divisions and player assignments for {league.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={handleAutoAssignPlayers}
                        >
                          <IconArrowsShuffle className="mr-2 h-4 w-4" />
                          Auto-Assign Players
                        </Button>
                        <Dialog open={isCreateDivisionOpen} onOpenChange={setIsCreateDivisionOpen}>
                          <DialogTrigger asChild>
                            <Button>
                              <IconPlus className="mr-2 h-4 w-4" />
                              Create Division
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create New Division</DialogTitle>
                              <DialogDescription>
                                Add a new division to organize players by skill level.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="divisionName">Division Name *</Label>
                                <Input
                                  id="divisionName"
                                  value={newDivision.name}
                                  onChange={(e) => setNewDivision(prev => ({ ...prev, name: e.target.value }))}
                                  placeholder="e.g., Premier Division, Division 1"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="minRating">Min Rating *</Label>
                                  <Input
                                    id="minRating"
                                    type="number"
                                    value={newDivision.minRating}
                                    onChange={(e) => setNewDivision(prev => ({ ...prev, minRating: parseInt(e.target.value) || 0 }))}
                                    placeholder="800"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="maxRating">Max Rating *</Label>
                                  <Input
                                    id="maxRating"
                                    type="number"
                                    value={newDivision.maxRating}
                                    onChange={(e) => setNewDivision(prev => ({ ...prev, maxRating: parseInt(e.target.value) || 0 }))}
                                    placeholder="1199"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="maxPlayers">Max Players</Label>
                                <Input
                                  id="maxPlayers"
                                  type="number"
                                  value={newDivision.maxPlayers}
                                  onChange={(e) => setNewDivision(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) || 12 }))}
                                  placeholder="12"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                  id="description"
                                  value={newDivision.description}
                                  onChange={(e) => setNewDivision(prev => ({ ...prev, description: e.target.value }))}
                                  placeholder="Brief description of the division level"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Division Color</Label>
                                <div className="flex gap-2">
                                  {predefinedColors.map((color) => (
                                    <button
                                      key={color}
                                      className={`w-8 h-8 rounded-full border-2 ${
                                        newDivision.color === color ? 'border-primary' : 'border-muted'
                                      }`}
                                      style={{ backgroundColor: color }}
                                      onClick={() => setNewDivision(prev => ({ ...prev, color }))}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                              <Button variant="outline" onClick={() => setIsCreateDivisionOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleCreateDivision}>
                                Create Division
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 px-4 lg:px-6 py-6">
                <div className="space-y-6">
                  {/* Division Overview Cards */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Divisions</CardTitle>
                        <IconTarget className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{divisions.length}</div>
                        <p className="text-xs text-muted-foreground">
                          {divisions.filter(d => d.status === "active").length} active
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                        <IconUsers className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{players.length}</div>
                        <p className="text-xs text-muted-foreground">Across all divisions</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average per Division</CardTitle>
                        <IconStar className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{Math.round(players.length / divisions.length)}</div>
                        <p className="text-xs text-muted-foreground">Players per division</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Capacity Used</CardTitle>
                        <IconTrophy className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {Math.round((divisions.reduce((acc, div) => acc + div.playerCount, 0) / 
                                      divisions.reduce((acc, div) => acc + div.maxPlayers, 0)) * 100)}%
                        </div>
                        <p className="text-xs text-muted-foreground">Of total capacity</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Divisions Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Division Overview</CardTitle>
                      <CardDescription>Manage division structure and player capacity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Division</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Rating Range</TableHead>
                            <TableHead>Players</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {divisions.map((division) => (
                            <TableRow key={division.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: division.color }}
                                  />
                                  <div>
                                    <div className="font-medium">{division.name}</div>
                                    {division.description && (
                                      <div className="text-sm text-muted-foreground">{division.description}</div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">Level {division.level}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {division.minRating} - {division.maxRating}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{division.playerCount}/{division.maxPlayers}</span>
                                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary"
                                      style={{
                                        width: `${(division.playerCount / division.maxPlayers) * 100}%`
                                      }}
                                    />
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getStatusColor(division.status)}>
                                  {division.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedDivision(division)}
                                  >
                                    <IconUsers className="size-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditDivision(division)}
                                  >
                                    <IconEdit className="size-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteDivision(division)}
                                    disabled={division.playerCount > 0}
                                  >
                                    <IconTrash className="size-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Division Players */}
                  {selectedDivision && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: selectedDivision.color }}
                          />
                          <div>
                            <CardTitle>{selectedDivision.name} Players</CardTitle>
                            <CardDescription>
                              Manage players in this division ({selectedDivision.playerCount}/{selectedDivision.maxPlayers})
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Player</TableHead>
                              <TableHead>Rating</TableHead>
                              <TableHead>Record</TableHead>
                              <TableHead>Points</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getDivisionPlayers(selectedDivision.id).map((player) => (
                              <TableRow key={player.id}>
                                <TableCell className="font-medium">{player.name}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{player.rating}</Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {player.wins}W - {player.losses}L
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">{player.points}</TableCell>
                                <TableCell>
                                  <Badge variant={player.status === "active" ? "default" : "secondary"}>
                                    {player.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    {selectedDivision.level > 1 && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handlePromotePlayer(player.id)}
                                        title="Promote to higher division"
                                      >
                                        <IconArrowUp className="size-4" />
                                      </Button>
                                    )}
                                    {selectedDivision.level < divisions.length && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDemotePlayer(player.id)}
                                        title="Move to lower division"
                                      >
                                        <IconArrowDown className="size-4" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => router.push(`/player/edit/${player.id}`)}
                                    >
                                      <IconEdit className="size-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Edit Division Dialog */}
      <Dialog open={isEditDivisionOpen} onOpenChange={setIsEditDivisionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Division</DialogTitle>
            <DialogDescription>
              Update division settings and requirements.
            </DialogDescription>
          </DialogHeader>
          {editingDivision && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editDivisionName">Division Name *</Label>
                <Input
                  id="editDivisionName"
                  value={editingDivision.name}
                  onChange={(e) => setEditingDivision(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editMinRating">Min Rating *</Label>
                  <Input
                    id="editMinRating"
                    type="number"
                    value={editingDivision.minRating}
                    onChange={(e) => setEditingDivision(prev => prev ? { ...prev, minRating: parseInt(e.target.value) || 0 } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editMaxRating">Max Rating *</Label>
                  <Input
                    id="editMaxRating"
                    type="number"
                    value={editingDivision.maxRating}
                    onChange={(e) => setEditingDivision(prev => prev ? { ...prev, maxRating: parseInt(e.target.value) || 0 } : null)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editMaxPlayers">Max Players</Label>
                <Input
                  id="editMaxPlayers"
                  type="number"
                  value={editingDivision.maxPlayers}
                  onChange={(e) => setEditingDivision(prev => prev ? { ...prev, maxPlayers: parseInt(e.target.value) || 12 } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Input
                  id="editDescription"
                  value={editingDivision.description || ""}
                  onChange={(e) => setEditingDivision(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label>Division Color</Label>
                <div className="flex gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${
                        editingDivision.color === color ? 'border-primary' : 'border-muted'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditingDivision(prev => prev ? { ...prev, color } : null)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditDivisionOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDivision}>
              Update Division
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
