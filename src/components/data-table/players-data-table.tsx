"use client";

import * as React from "react";
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
import { SearchInput } from "@/components/ui/search-input";
import { FilterBar } from "@/components/ui/filter-bar";
import { FilterSelect, type FilterOption } from "@/components/ui/filter-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@tanstack/react-router";
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
    header: () => <span className="text-center block">#</span>,
    cell: ({ row, table }) => {
      const pageIndex = table.getState().pagination.pageIndex;
      const pageSize = table.getState().pagination.pageSize;
      return (
        <span className="text-center text-muted-foreground font-mono text-sm block">
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
            <div className="font-medium">{player.name}</div>
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
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <IconMapPin className="size-4 text-muted-foreground" />
        <span>{renderValue(row.original.area)}</span>
      </div>
    ),
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => {
      const gender = row.original.gender;
      return gender ? (
        <Badge variant="outline" className="capitalize">
          {gender}
        </Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
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

export function PlayersDataTable() {
  // React Query for data fetching
  const { data: queryData, isLoading, isError, error, refetch } = usePlayers();
  
  // Memoize data to ensure stable reference
  const data = React.useMemo(() => queryData ?? [], [queryData]);

  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Filter states
  const [sportFilter, setSportFilter] = React.useState<string | undefined>(undefined);
  const [locationFilter, setLocationFilter] = React.useState<string | undefined>(undefined);

  // Get unique sports and locations for filter options
  const uniqueSports = React.useMemo(() => {
    const sportsSet = new Set<string>();
    data.forEach((player) => {
      if (player.sports && player.sports.length > 0) {
        player.sports.forEach((sport) => sportsSet.add(sport));
      }
    });
    return Array.from(sportsSet).sort();
  }, [data]);

  const uniqueLocations = React.useMemo(() => {
    const locationsSet = new Set<string>();
    data.forEach((player) => {
      if (player.area) {
        locationsSet.add(player.area);
      }
    });
    return Array.from(locationsSet).sort();
  }, [data]);

  // Transform to FilterOption format
  const sportOptions: FilterOption[] = React.useMemo(() =>
    uniqueSports.map((sport) => ({ value: sport, label: sport.charAt(0).toUpperCase() + sport.slice(1) })),
    [uniqueSports]
  );

  const locationOptions: FilterOption[] = React.useMemo(() =>
    uniqueLocations.map((location) => ({ value: location, label: location })),
    [uniqueLocations]
  );

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

  // Clear all filters
  const clearFilters = () => {
    setSportFilter(undefined);
    setLocationFilter(undefined);
    setGlobalFilter("");
  };

  // Check if any filters are active
  const hasActiveFilters = sportFilter || locationFilter || globalFilter !== "";

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
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
      {/* Search and Filters */}
      <FilterBar onClearAll={clearFilters} showClearButton={!!hasActiveFilters}>
        {/* Search Input */}
        <SearchInput
          value={globalFilter}
          onChange={setGlobalFilter}
          placeholder="Search players..."
          className="w-[200px]"
        />

        {/* Sport Filter */}
        <FilterSelect
          value={sportFilter}
          onChange={setSportFilter}
          options={sportOptions}
          allLabel="All Sports"
          triggerClassName="w-[140px]"
        />

        {/* Location Filter */}
        <FilterSelect
          value={locationFilter}
          onChange={setLocationFilter}
          options={locationOptions}
          allLabel="All Locations"
          triggerClassName="w-[160px]"
        />
      </FilterBar>

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
          <TableBody>
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={TABLE_ANIMATIONS.ROW_HOVER}
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {LOADING_STATES.NO_DATA_TEXT}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
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
