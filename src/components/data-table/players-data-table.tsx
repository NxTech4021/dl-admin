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
  IconFilter,
  IconX,
  IconChevronDown,
  IconChevronUp,
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

import { z } from "zod";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Checkbox } from "@/components/ui/checkbox";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import Link from "next/link";
import axiosInstance, { endpoints } from "@/lib/endpoints";

// Player schema based on the database structure and onboarding data

export const playerSchema = z.object({
  id: z.string(),

  name: z.string(),

  displayUsername: z.string().nullable(),

  email: z.string().email(),

  emailVerified: z.boolean(),

  image: z.string().nullable(),

  area: z.string().nullish(), // Updated to handle null or undefined

  gender: z.enum(["male", "female"]).nullable(),

  // Use z.coerce.date() to automatically convert date strings from the API

  dateOfBirth: z.coerce.date().nullable(),

  registeredDate: z.coerce.date(),

  lastLoginDate: z.coerce.date().nullish(), // Updated to handle null or undefined

  sports: z.array(z.string()), // Sports from ALL questionnaires (completed and incomplete)

  skillRatings: z

    .record(
      z.string(),

      z.object({
        rating: z.number(),

        confidence: z.string(),

        rd: z.number(),
      })
    )

    .nullable(),

  status: z.enum(["active", "inactive", "suspended"]).nullish(),

  completedOnboarding: z.boolean().default(false), // Updated to handle undefined with a default
});

export type Player = z.infer<typeof playerSchema>;

const getInitials = (name: string) => {
  return name

    .split(" ")

    .map((n) => n[0])

    .join("")

    .toUpperCase();
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-MY", {
    year: "numeric",

    month: "short",

    day: "numeric",
  });
};

const getOnboardingBadgeVariant = (completedOnboarding: boolean) => {
  return completedOnboarding ? "default" : "secondary";
};

const getSportsDisplay = (player: Player): React.ReactNode => {
  // The backend now provides sports from ALL questionnaires (completed and incomplete)

  const sportsToShow = player.sports;

  if (!sportsToShow || sportsToShow.length === 0) {
    return <span className="text-muted-foreground text-xs">No sports</span>;
  }

  return sportsToShow.map((sport) => (
    <Badge key={sport} variant="outline" className="text-xs capitalize">
      {sport}
    </Badge>
  ));
};

const columns: ColumnDef<Player>[] = [
  {
    id: "select",

    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),

    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),

    enableSorting: false,

    enableHiding: false,
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

        <span>{row.original.area}</span>
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

        <span>{formatDate(row.original.registeredDate)}</span>
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
              className="hover:bg-muted hover:text-foreground transition-colors flex size-8"
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
              <Link href={`/players/${player.id}`}>
                <IconEye className="mr-2 size-4" />
                View Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
              onClick={() => {
                // TODO: Implement edit player functionality

                console.log("Edit player:", player.id);
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
                // TODO: Implement delete player functionality

                console.log("Delete player:", player.id);
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
  const [data, setData] = React.useState<Player[]>([]);

  const [isLoading, setIsLoading] = React.useState(true);

  const [rowSelection, setRowSelection] = React.useState({});

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [globalFilter, setGlobalFilter] = React.useState("");

  // Filter states

  const [sportFilter, setSportFilter] = React.useState<string>("all");

  const [locationFilter, setLocationFilter] = React.useState<string>("all");

  const [showFilters, setShowFilters] = React.useState<boolean>(false);

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

  // Filter data based on selected filters

  const filteredData = React.useMemo(() => {
    let filtered = data;

    // Apply sport filter

    if (sportFilter !== "all") {
      filtered = filtered.filter(
        (player) => player.sports && player.sports.includes(sportFilter)
      );
    }

    // Apply location filter

    if (locationFilter !== "all") {
      filtered = filtered.filter((player) => player.area === locationFilter);
    }

    return filtered;
  }, [data, sportFilter, locationFilter]);

  // Clear all filters

  const clearFilters = () => {
    setSportFilter("all");

    setLocationFilter("all");

    setGlobalFilter("");
  };

  // Check if any filters are active

  const hasActiveFilters =
    sportFilter !== "all" || locationFilter !== "all" || globalFilter !== "";

  React.useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true);

      try {
        const response = await axiosInstance.get(endpoints.player.getAll);
        if (response.status !== 200) {
          throw new Error("Network response was not ok");
        }
        // Backend returns: { success, status, data: [...], message }
        // Players are returned directly in data array, not wrapped
        const players = response.data.data;

        if (Array.isArray(players)) {
          const parsedData = z.array(playerSchema).parse(players);
          setData(parsedData);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error("Failed to fetch players:", error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const table = useReactTable({
    data: filteredData,

    columns,

    state: {
      sorting,

      columnVisibility,

      rowSelection,

      columnFilters,

      globalFilter,
    },

    enableRowSelection: true,

    onRowSelectionChange: setRowSelection,

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

  return (
    <div className="space-y-4">
      {/* Search and Filters */}

      <div className="px-4 lg:px-6 space-y-4">
        {/* Search Bar and Filter Toggle */}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search players by name, email, or area..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="w-80"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`${
                hasActiveFilters ? "border-primary bg-primary/10" : ""
              }`}
            >
              <IconFilter className="size-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {(sportFilter !== "all" ? 1 : 0) +
                    (locationFilter !== "all" ? 1 : 0)}
                </Badge>
              )}
              {showFilters ? (
                <IconChevronUp className="size-4 ml-2" />
              ) : (
                <IconChevronDown className="size-4 ml-2" />
              )}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} player(s) selected
            </div>
          </div>
        </div>

        {/* Filter Controls - Collapsible */}

        {showFilters && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/30 rounded-lg border animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2"></div>

            {/* Sport Filter */}

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sport:</span>

              <Select value={sportFilter} onValueChange={setSportFilter}>
                <SelectTrigger
                  className={`w-[140px] ${
                    sportFilter !== "all" ? "border-primary" : ""
                  }`}
                >
                  <SelectValue placeholder="All Sports" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>

                  {uniqueSports.map((sport) => (
                    <SelectItem
                      key={sport}
                      value={sport}
                      className="capitalize"
                    >
                      {sport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {sportFilter !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {sportFilter}
                </Badge>
              )}
            </div>

            {/* Location Filter */}

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Location:</span>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger
                  className={`w-[140px] ${
                    locationFilter !== "all" ? "border-primary" : ""
                  }`}
                >
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>

                  {uniqueLocations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {locationFilter !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {locationFilter}
                </Badge>
              )}
            </div>

            {/* Clear Filters Button */}

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-2 lg:px-3"
              >
                <IconX className="size-4 mr-1" />
                Clear Filters
              </Button>
            )}

            {/* Active Filters Count */}

            {hasActiveFilters && (
              <div className="text-sm text-muted-foreground">
                Showing {filteredData.length} of {data.length} players
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table Container */}

      <div className="rounded-md border mx-4 lg:mx-6 bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,

                            header.getContext()
                          )}
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
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Loading players...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,

                        cell.getContext()
                      )}
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
                  No players found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}

      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} player(s)
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
    </div>
  );
}
