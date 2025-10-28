"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  IconCalendar, 
  IconMail, 
  IconMapPin, 
  IconDotsVertical,
  IconUserMinus,
  IconUserCheck,
  IconEye,
  IconFilter,
  IconX,
  IconTrash,
  IconSearch,
  IconUserPlus,
  IconUsers,
  IconSend
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axiosInstance, { endpoints } from "@/lib/endpoints";

export interface LeaguePlayerRow {
  id: string;
  name: string;
  displayUsername?: string | null;
  email: string;
  emailVerified?: boolean | null;
  image?: string | null;
  area?: string | null;
  registeredDate?: string | Date | null;
  ratings?: { [sport: string]: number } | null;
  status?: string | null;
  joinType?: string | null;
  seasonMemberships?: Array<{
    seasonId: string;
    seasonName: string;
    status: string;
    joinedAt: string | Date;
  }>;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function formatDate(date: string | Date | null | undefined) {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function getSportLabel(sport: string) {
  const map: Record<string, string> = { 
    TENNIS: "Tennis", 
    PICKLEBALL: "Pickleball", 
    PADDLE: "Padel", 
    PADEL: "Padel",
    tennis: "Tennis",
    pickleball: "Pickleball", 
    padel: "Padel" 
  };
  return map[sport] || sport;
}


function getRatingLevel(rating: number) {
  if (rating >= 4.5) return "Elite";
  if (rating >= 4.0) return "Advanced";
  if (rating >= 3.5) return "Intermediate";
  if (rating >= 3.0) return "Beginner";
  return "Novice";
}

function getStatusBadge(status: string) {
  const variants: Record<string, { variant: string; className: string }> = {
    ACTIVE: { variant: "default", className: "bg-green-500 hover:bg-green-600 text-white" },
    ONGOING: { variant: "default", className: "bg-green-500 hover:bg-green-600 text-white" },
    UPCOMING: { variant: "secondary", className: "bg-blue-500 hover:bg-blue-600 text-white" },
    FINISHED: { variant: "outline", className: "border-gray-400" },
    INACTIVE: { variant: "outline", className: "border-gray-300" },
    CANCELLED: { variant: "destructive", className: "" },
    SUSPENDED: { variant: "default", className: "bg-orange-500 hover:bg-orange-600 text-white" },
  };
  
  const config = variants[status] || { variant: "outline", className: "" };
  return <Badge className={config.className}>{status}</Badge>;
}

function getJoinTypeLabel(joinType: string) {
  const map: Record<string, string> = {
    OPEN: "Open to All",
    INVITE_ONLY: "Invitation Only", 
    MANUAL: "Manual Approval",
    // Legacy support for lowercase values
    open: "Open to All",
    invite_only: "Invitation Only",
    manual: "Manual Approval"
  };
  return map[joinType] || joinType;
}


interface PlayerActionsProps {
  player: LeaguePlayerRow;
  onRemove?: (playerId: string) => void;
}

function PlayerActions({ player, onRemove }: PlayerActionsProps) {
  const router = useRouter();
  
  const handleViewProfile = () => {
    toast.info(`Viewing profile for ${player.name}`);
    // Navigate to player profile using Next.js router
    router.push(`/players/${player.id}`);
  };

  const handleRemove = () => {
    if (confirm(`Are you sure you want to remove ${player.name} from this league?`)) {
      onRemove?.(player.id);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <IconDotsVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleViewProfile}>
          <IconEye className="mr-2 h-4 w-4" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleRemove} className="text-destructive focus:text-destructive">
          <IconUserMinus className="mr-2 h-4 w-4" />
          Remove from League
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const makeColumns = (onRemove?: (playerId: string) => void): ColumnDef<LeaguePlayerRow>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Player",
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarImage src={p.image || undefined} alt={p.name} />
            <AvatarFallback className="text-xs">{getInitials(p.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="font-medium">{p.name}</div>
            {p.displayUsername && (
              <div className="text-sm text-muted-foreground">@{p.displayUsername}</div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <IconMail className="size-4 text-muted-foreground" />
        <span className="text-sm">{row.original.email}</span>
      </div>
    ),
  },
  {
    accessorKey: "area",
    header: "Area",
    cell: ({ row }) => {
      const area = row.original.area;
      return area ? (
        <div className="flex items-center gap-1 text-sm">
          <IconMapPin className="size-3" />
          {area}
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      );
    },
  },
  {
    accessorKey: "registeredDate",
    header: "Joined",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <IconCalendar className="size-4 text-muted-foreground" />
        <span className="text-sm">{formatDate(row.original.registeredDate)}</span>
      </div>
    ),
  },
  {
    accessorKey: "ratings",
    header: "Player Ratings",
    cell: ({ row }) => {
      const ratings = row.original.ratings;
      if (!ratings || Object.keys(ratings).length === 0) {
        return <span className="text-muted-foreground text-sm">No ratings</span>;
      }
      
      const ratingEntries = Object.entries(ratings);
      const visibleRatings = ratingEntries.slice(0, 3);
      const remainingCount = ratingEntries.length - 3;
      const remainingRatings = ratingEntries.slice(3);
      
      return (
        <div className="flex flex-wrap gap-1.5 max-w-xs">
          {visibleRatings.map(([sport, rating], idx) => {
            const ratingValue = typeof rating === 'number' ? rating : 0;
            return (
              <TooltipProvider key={idx}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span 
                      className="rounded-full px-2.5 py-0.5 text-xs font-medium cursor-help bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    >
                      {getSportLabel(sport)}: {ratingValue.toFixed(1)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-popover text-popover-foreground">
                    <div className="flex flex-col gap-1">
                      <div className="font-semibold text-xs">{getSportLabel(sport)} Rating</div>
                      <div className="text-xs">
                        <div>Rating: {ratingValue.toFixed(1)}/5.0</div>
                        <div>Level: {getRatingLevel(ratingValue)}</div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
          {remainingCount > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span 
                    className="rounded-full px-2.5 py-0.5 text-xs font-normal border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 cursor-help"
                  >
                    +{remainingCount}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs bg-popover text-popover-foreground">
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold text-xs mb-1">All Ratings:</div>
                    <div className="flex flex-wrap gap-1">
                      {ratingEntries.map(([sport, rating], idx) => {
                        const ratingValue = typeof rating === 'number' ? rating : 0;
                        return (
                          <span 
                            key={idx} 
                            className="rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                          >
                            {getSportLabel(sport)}: {ratingValue.toFixed(1)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return status ? getStatusBadge(status) : <span className="text-muted-foreground text-sm">-</span>;
    },
  },
  {
    accessorKey: "seasonMemberships",
    header: "Season Memberships",
    cell: ({ row }) => {
      const memberships = row.original.seasonMemberships || [];
      if (memberships.length === 0) {
        return <span className="text-sm text-muted-foreground">No seasons</span>;
      }
      
      return (
        <div className="flex flex-wrap gap-1">
          {memberships.map((membership) => (
            <Badge 
              key={membership.seasonId} 
              variant="outline" 
              className="text-xs"
            >
              {membership.seasonName}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <PlayerActions player={row.original} onRemove={onRemove} />,
  },
];

interface LeaguePlayersTableProps {
  players: LeaguePlayerRow[];
  leagueId?: string;
  onAddPlayer?: () => void;
}

export function LeaguePlayersTable({ players, leagueId, onAddPlayer }: LeaguePlayersTableProps) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [areaFilter, setAreaFilter] = React.useState<string>("all");
  const [isAddPlayerOpen, setIsAddPlayerOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedPlayers, setSelectedPlayers] = React.useState<Set<string>>(new Set());

  // Get unique areas for filter
  const uniqueAreas = React.useMemo(() => {
    const areas = new Set(players.map(p => p.area).filter(Boolean));
    return Array.from(areas).sort();
  }, [players]);

  const handleRemovePlayer = React.useCallback(async (playerId: string) => {
    // This is a read-only summary of players from all seasons
    // Players are managed at the season level, not league level
    toast.info("Players are managed through individual seasons. Please go to the Seasons tab to remove players from specific seasons.");
  }, []);


  const filtered = React.useMemo(() => {
    let result = players;

    // Filter by area
    if (areaFilter && areaFilter !== "all") {
      result = result.filter(p => p.area === areaFilter);
    }

    // Filter by search query
    if (globalFilter) {
      const q = globalFilter.toLowerCase();
      result = result.filter((p) =>
        [p.name, p.displayUsername || "", p.email, p.area || ""].some((v) =>
          (v || "").toLowerCase().includes(q)
        )
      );
    }

    return result;
  }, [players, globalFilter, areaFilter]);

  const table = useReactTable({
    data: filtered,
    columns: React.useMemo(() => makeColumns(handleRemovePlayer), [handleRemovePlayer]),
    state: { 
      sorting, 
      columnFilters, 
      globalFilter,
      rowSelection 
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  const handleBulkRemove = React.useCallback(async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map(row => row.original.id);
    
    if (selectedIds.length === 0) {
      toast.error("No players selected");
      return;
    }

    // This is a read-only summary of players from all seasons
    // Players are managed at the season level, not league level
    toast.info("Players are managed through individual seasons. Please go to the Seasons tab to remove players from specific seasons.");
    setRowSelection({});
  }, [table, setRowSelection]);

  const handleAddPlayer = () => {
    if (onAddPlayer) {
      onAddPlayer();
    } else {
      setIsAddPlayerOpen(true);
    }
  };

  // State for available players
  const [availablePlayers, setAvailablePlayers] = React.useState<any[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = React.useState(false);

  // Fetch available players from API
  React.useEffect(() => {
    const fetchAvailablePlayers = async () => {
      setIsLoadingPlayers(true);
      try {
        const response = await axiosInstance.get(endpoints.player.getAll);
        console.log("Players API response:", response.data);
        
        // Handle different response structures
        let players = [];
        if (Array.isArray(response.data)) {
          players = response.data;
        } else if (response.data && Array.isArray(response.data.players)) {
          players = response.data.players;
        } else if (response.data && Array.isArray(response.data.data)) {
          players = response.data.data;
        }
        
        setAvailablePlayers(players);
      } catch (error) {
        console.error("Error fetching available players:", error);
        toast.error("Failed to load available players");
        // Fallback to empty array
        setAvailablePlayers([]);
      } finally {
        setIsLoadingPlayers(false);
      }
    };

    if (isAddPlayerOpen) {
      fetchAvailablePlayers();
    }
  }, [isAddPlayerOpen]);

  const filteredAvailablePlayers = React.useMemo(() => {
    // Ensure availablePlayers is always an array and filter out invalid entries
    const players = Array.isArray(availablePlayers) 
      ? availablePlayers.filter(p => p && p.id) 
      : [];
    
    if (!searchQuery) return players;
    const q = searchQuery.toLowerCase();
    return players.filter(p => 
      p.name && p.email && p.username &&
      (p.name.toLowerCase().includes(q) || 
       p.email.toLowerCase().includes(q) ||
       p.username.toLowerCase().includes(q))
    );
  }, [availablePlayers, searchQuery]);

  const handleTogglePlayer = (playerId: string) => {
    const newSelected = new Set(selectedPlayers);
    if (newSelected.has(playerId)) {
      newSelected.delete(playerId);
    } else {
      newSelected.add(playerId);
    }
    setSelectedPlayers(newSelected);
  };

  const handleAddSelectedPlayers = async () => {
    // This is a read-only summary of players from all seasons
    // Players are managed at the season level, not league level
    toast.info("Players are managed through individual seasons. Please go to the Seasons tab to add players to specific seasons.");
    setIsAddPlayerOpen(false);
    setSelectedPlayers(new Set());
    setSearchQuery("");
  };

  const handleSendInvite = () => {
    setIsAddPlayerOpen(false);
    toast.info("Opening invite form...");
    // Navigate to invite page or open invite modal
    if (leagueId) {
      window.location.href = `/league/${leagueId}/invite`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={areaFilter} onValueChange={setAreaFilter}>
            <SelectTrigger className="w-[180px]">
              <IconFilter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Areas</SelectItem>
              {uniqueAreas.map((area) => (
                <SelectItem key={area} value={area!}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(globalFilter || areaFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setGlobalFilter("");
                setAreaFilter("all");
              }}
            >
              <IconX className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {/*
          <Button
            onClick={handleAddPlayer}
            size="sm"
          >
            <IconUsers className="h-4 w-4 mr-2" />
            View Players
          </Button>
          */}

          {selectedCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkRemove}
            >
              <IconTrash className="h-4 w-4 mr-2" />
              Remove {selectedCount}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id} colSpan={h.colSpan}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow 
                  key={row.id} 
                  className="hover:bg-muted/50"
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getAllLeafColumns().length} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <IconUserCheck className="h-8 w-8" />
                    <p>No players found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedCount > 0 ? (
            <span>{selectedCount} of {filtered.length} row(s) selected</span>
          ) : (
            <span>Showing {table.getRowModel().rows.length} of {filtered.length} player(s)</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => table.previousPage()} 
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => table.nextPage()} 
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Add Player Dialog */}
      <Dialog open={isAddPlayerOpen} onOpenChange={setIsAddPlayerOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>League Players Summary</DialogTitle>
            <DialogDescription>
              This is a read-only summary of all players from all seasons in this league. Players are managed through individual seasons.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 flex-1 overflow-hidden">
            {/* Search */}
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            {/* Players List */}
            <div className="flex-1 overflow-y-auto border rounded-md">
              {isLoadingPlayers ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                  <p>Loading players...</p>
                </div>
              ) : filteredAvailablePlayers.length > 0 ? (
                <div className="divide-y">
                  {filteredAvailablePlayers.map((player) => {
                    // Safety check to ensure player has required properties
                    if (!player || !player.id) {
                      return null;
                    }
                    
                    const isSelected = selectedPlayers.has(player.id);
                    return (
                      <div
                        key={player.id}
                        className={`flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer ${
                          isSelected ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => handleTogglePlayer(player.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleTogglePlayer(player.id)}
                        />
                        <Avatar className="size-10">
                          <AvatarFallback>
                            {player.name ? player.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">{player.name || 'Unknown Player'}</div>
                          <div className="text-sm text-muted-foreground">
                            @{player.username || 'no-username'} • {player.email || 'no-email'}
                          </div>
                        </div>
                        {player.area && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <IconMapPin className="size-3" />
                            {player.area}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <IconUserCheck className="h-12 w-12 mb-2" />
                  <p>No players found</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <Button
                variant="outline"
                onClick={handleSendInvite}
              >
                <IconSend className="h-4 w-4 mr-2" />
                Send Email Invite
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddPlayerOpen(false);
                    setSelectedPlayers(new Set());
                    setSearchQuery("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddSelectedPlayers}
                  disabled={selectedPlayers.size === 0}
                >
                  <IconUserPlus className="h-4 w-4 mr-2" />
                  Add {selectedPlayers.size > 0 ? `(${selectedPlayers.size})` : 'Players'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
