"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconDotsVertical,
  IconMail,
  IconMapPin,
  IconCalendar,
  IconEye,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// Animation variants now handled inline for better control over loading state transitions
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link, useNavigate } from "@tanstack/react-router";
import { Player } from "@/constants/zod/player-schema";
import { usePlayers } from "@/hooks/use-queries";
import { getSportLabel, getSportColor } from "@/constants/sports";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import {
  formatTableDate,
  getInitials,
  renderValue,
  LOADING_STATES,
  TABLE_ANIMATIONS,
} from './constants';


const getOnboardingBadgeVariant = (completedOnboarding: boolean) => {
  return completedOnboarding ? "default" : "secondary";
};

const getGenderIcon = (gender: string | null): React.ReactNode => {
  if (!gender) return null;
  const g = gender.toLowerCase();
  if (g === 'male') return <span className="text-blue-500 ml-1" title="Male">♂</span>;
  if (g === 'female') return <span className="text-pink-500 ml-1" title="Female">♀</span>;
  return null;
};


const getSportsDisplay = (player: Player): React.ReactNode => {
  const sportsToShow = player.sports;

  if (!sportsToShow || sportsToShow.length === 0) {
    return <span className="text-muted-foreground text-xs">No sports</span>;
  }

  return sportsToShow.map((sport) => {
    const sportColor = getSportColor(sport.toUpperCase());
    const sportLabel = getSportLabel(sport.toUpperCase());
    
    return (
      <Badge 
        key={sport} 
        variant="outline" 
        className="text-xs capitalize border-current"
        style={{ 
          color: sportColor,
          borderColor: sportColor + '40',
          backgroundColor: sportColor + '10'
        }}
      >
        {sportLabel}
      </Badge>
    );
  });
};

const columns: ColumnDef<Player>[] = [
  {
    id: "rowNumber",
    header: () => <span className="text-center block pl-2">#</span>,
    cell: ({ row, table }) => {
      const pageIndex = table.getState().pagination.pageIndex;
      const pageSize = table.getState().pagination.pageSize;
      return (
        <span className="text-center text-muted-foreground font-mono text-sm block pl-2">
          {pageIndex * pageSize + row.index + 1}
        </span>
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 50,
  },
  {
    accessorKey: "name",
    header: "Player",
    cell: ({ row }) => {
      const player = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarImage src={player.image || undefined} alt={player.name} />
            <AvatarFallback className="text-xs">
              {getInitials(player.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="font-medium flex items-center">
              {player.name}
              {getGenderIcon(player.gender)}
            </div>
            {player.displayUsername && (
              <div className="text-sm text-muted-foreground">
                @{player.displayUsername}
              </div>
            )}
          </div>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const player = row.original;
      return (
        <div className="flex items-center gap-2">
          <IconMail className="size-4 text-muted-foreground" />
          <span>{player.email}</span>
          {!player.emailVerified && (
            <Badge variant="destructive" className="text-xs">
              Unverified
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "area",
    header: "Area",
    cell: ({ row }) => {
      const area = renderValue(row.original.area);
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 min-w-[200px] max-w-[300px]">
              <IconMapPin className="size-4 text-muted-foreground shrink-0" />
              <span className="truncate">{area}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[350px]">
            <p className="break-words">{area}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    size: 320,
  },
  {
    accessorKey: "sports",
    header: "Sports",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {getSportsDisplay(row.original)}
      </div>
    ),
  },
  {
    accessorKey: "leagueCount",
    header: "Leagues",
    cell: ({ row }) => {
      const count = row.original.leagueCount ?? 0;
      return (
        <div className="flex justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-md bg-muted font-medium text-sm cursor-default">
                {count}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {count} {count === 1 ? "league" : "leagues"} joined
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
    size: 80,
  },
  {
    accessorKey: "seasonCount",
    header: "Seasons",
    cell: ({ row }) => {
      const count = row.original.seasonCount ?? 0;
      return (
        <div className="flex justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-md bg-muted font-medium text-sm cursor-default">
                {count}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {count} {count === 1 ? "season" : "seasons"} joined
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
    size: 80,
  },
  {
    id: "matchesPlayed",
    header: "Matches",
    cell: ({ row }) => {
      const leagueMatches = row.original.leagueMatchesPlayed ?? 0;
      const friendlyMatches = row.original.friendlyMatchesPlayed ?? 0;
      const totalMatches = leagueMatches + friendlyMatches;
      return (
        <div className="flex justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-md bg-muted font-medium text-sm cursor-default">
                {totalMatches}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex flex-col gap-0.5">
                <span>{leagueMatches} league {leagueMatches === 1 ? "match" : "matches"} played</span>
                <span>{friendlyMatches} friendly {friendlyMatches === 1 ? "match" : "matches"} played</span>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
    size: 80,
  },
  {
    accessorKey: "registeredDate",
    header: "Registered",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <IconCalendar className="size-4 text-muted-foreground" />
        <span>{formatTableDate(row.original.registeredDate)}</span>
      </div>
    ),
  },
  {
    accessorKey: "completedOnboarding",
    header: "Onboarding",
    cell: ({ row }) => (
      <Badge
        variant={getOnboardingBadgeVariant(row.original.completedOnboarding)}
        className="capitalize"
      >
        {row.original.completedOnboarding ? "Onboarded" : "Incomplete"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const player = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`${TABLE_ANIMATIONS.ROW_HOVER} ${TABLE_ANIMATIONS.TRANSITION} flex size-8`}
              size="icon"
            >
              <IconDotsVertical className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem
              asChild
              className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
            >
              <Link to="/players/$playerId" params={{ playerId: player.id }}>
                <IconEye className="mr-2 size-4" />
                View Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
              onClick={() => {
                // TODO: Implement edit player modal
                toast.info("Edit player functionality coming soon");
              }}
            >
              <IconEdit className="mr-2 size-4" />
              Edit Player
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer focus:bg-destructive focus:text-destructive-foreground"
              onClick={() => {
                // TODO: Implement delete player confirmation
                toast.info("Delete player functionality coming soon");
              }}
            >
              <IconTrash className="mr-2 size-4" />
              Delete Player
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface PlayersDataTableProps {
  searchQuery?: string;
  sportFilter?: string;
  locationFilter?: string;
}

export function PlayersDataTable({
  searchQuery = "",
  sportFilter: externalSportFilter,
  locationFilter: externalLocationFilter,
}: PlayersDataTableProps) {
  const navigate = useNavigate();
  // React Query for data fetching
  const { data: queryData, isLoading, isError, error, refetch } = usePlayers();

  // Memoize data to ensure stable reference
  const data = React.useMemo(() => queryData ?? [], [queryData]);

  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Use external filters if provided, otherwise use internal state
  const [internalSportFilter, setInternalSportFilter] = React.useState<string | undefined>(undefined);
  const [internalLocationFilter, setInternalLocationFilter] = React.useState<string | undefined>(undefined);

  const sportFilter = externalSportFilter !== undefined ? externalSportFilter : internalSportFilter;
  const locationFilter = externalLocationFilter !== undefined ? externalLocationFilter : internalLocationFilter;

  // Filter data based on selected filters
  const filteredData = React.useMemo(() => {
    let filtered = data;
    if (sportFilter) {
      filtered = filtered.filter(
        (player) => player.sports && player.sports.includes(sportFilter)
      );
    }
    if (locationFilter) {
      filtered = filtered.filter((player) => player.area === locationFilter);
    }
    return filtered;
  }, [data, sportFilter, locationFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      globalFilter: searchQuery,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    globalFilterFn: "includesString",
  });

  // Error state UI - must be after all hooks
  if (isError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Failed to load players</h3>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "An error occurred while fetching data."}
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <tbody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className={TABLE_ANIMATIONS.LOADING_SPINNER}></div>
                    {LOADING_STATES.LOADING_TEXT}
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              <AnimatePresence>
                {table.getRowModel().rows.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: index * 0.03,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    data-state={row.getIsSelected() && "selected"}
                    className={`${TABLE_ANIMATIONS.ROW_HOVER} border-b transition-colors cursor-pointer`}
                    onClick={() => navigate({ to: "/players/$playerId", params: { playerId: row.original.id } })}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        onClick={cell.column.id === "actions" ? (e) => e.stopPropagation() : undefined}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {LOADING_STATES.NO_DATA_TEXT}
                </TableCell>
              </TableRow>
            )}
          </tbody>
        </Table>

        {/* Pagination */}
        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )} of {table.getFilteredRowModel().rows.length} player(s)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, table.getPageCount()) },
                  (_, i) => {
                    const currentPage = table.getState().pagination.pageIndex;
                    const totalPages = table.getPageCount();
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage <= 2) {
                      pageNum = i;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => table.setPageIndex(pageNum)}
                      >
                        {pageNum + 1}
                      </Button>
                    );
                  }
                )}
              </div>
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
        )}
      </div>
    </div>
  );
}
