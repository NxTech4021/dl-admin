/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import {
  IconDotsVertical,
  IconCalendar,
  IconEye,
  IconTrash,
  IconTrophy,
  IconChevronDown,
  IconArrowsMaximize,
  IconArrowsMinimize,
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
  type Row,
  type Cell,
} from "@tanstack/react-table";
import { Season } from "@/ZodSchema/season-schema";

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
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axiosInstance, { endpoints } from "@/lib/endpoints";

export type SeasonsDataTableProps = {
  data: Season[];
  isLoading: boolean;
  onViewSeason?: (seasonId: string) => void;
};

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return "Not set";

  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return "Invalid date";

    return dateObj.toLocaleDateString("en-MY", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error, "Input:", date);
    return "Invalid date";
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(amount);
};

const getLeagueTypeBadgeVariant = (leagueType: string) => {
  switch (leagueType) {
    case "Pickleball":
      return "default";
    case "Tennis":
      return "secondary";
    case "Padel":
      return "outline";
    default:
      return "outline";
  }
};

const getSportColor = (leagueType: string) => {
  switch (leagueType) {
    case "PICKLEBALL":
      return "#8e41e6ff";
    case "TENNIS":
      return "#518516ff";
    case "PADEL":
      return "#3880c0ff";
    default:
      return "#6B7280";
  }
};

// const getCompetitionTypeBadgeVariant = (competitionType: string) => {
//   switch (competitionType) {
//     case "Men's Singles":
//       return "default";
//     case "Men's Doubles":
//       return "secondary";
//     case "Mixed Doubles":
//       return "outline";
//     default:
//       return "outline";
//   }
// };

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "UPCOMING":
      return "secondary";
    case "ACTIVE":
      return "default";
    case "FINISHED":
      return "outline";
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
};

const getLeaguesDisplay = (season: Season): React.ReactNode => {
  if (!season.leagues || season.leagues.length === 0) {
    return <span className="text-muted-foreground text-xs">No leagues</span>;
  }

  return (
    <HoverCard>
      <HoverCardTrigger>
        <Badge variant="secondary" className="cursor-pointer">
          {season.leagues.length} League{season.leagues.length !== 1 ? "s" : ""}
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Linked Leagues</h4>
          <div className="flex flex-wrap gap-1">
            {season.leagues.map((league) => (
              <Badge key={league.id} variant="outline" className="text-xs">
                {league.name}
              </Badge>
            ))}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const handleViewSeason = (
  seasonId: string,
  onViewSeason?: (id: string) => void
) => {
  if (onViewSeason) onViewSeason(seasonId);
};

const handleDeleteSeason = async (seasonId: string) => {
  if (!confirm("Are you sure you want to delete this season?")) {
    return;
  }

  try {
    await axiosInstance.delete(endpoints.season.delete(seasonId));
    // Refresh the data after successful deletion
    window.location.reload();
  } catch (error) {
    console.error("Failed to delete season:", error);
  }
};

const columns: ColumnDef<Season>[] = [
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
    header: "Season Name",
    cell: ({ row }) => {
      const season = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
            <IconTrophy className="size-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <div className="font-medium">{season.name}</div>
            {season.category && (
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge variant="outline" className="text-xs">
                  {season.category.name || "Unnamed Category"}
                </Badge>
              </div>
            )}
          </div>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "leagues",
    header: "Leagues",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {getLeaguesDisplay(row.original)}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={getStatusBadgeVariant(status)} className="capitalize">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "entryFee",
    header: "Entry Fee",
    cell: ({ row }) => {
      const entryFee = row.original.entryFee;
      if (!entryFee) {
        return <span className="text-muted-foreground">Free</span>;
      }

      // Try to parse as number for currency formatting
      const feeAmount = parseFloat(entryFee as unknown as string);
      if (!isNaN(feeAmount)) {
        return <span className="font-medium">{formatCurrency(feeAmount)}</span>;
      }

      // If not a number, display as-is
      return <span className="font-medium">{entryFee}</span>;
    },
  },
  {
    accessorKey: "divisions",
    header: "Divisions",
    cell: ({ row }) => {
      const divisionsCount = row.original.divisions?.length || 0;
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{divisionsCount}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "memberships",
    header: "Players",
    cell: ({ row }) => {
      const membershipsCount = row.original.memberships?.length || 0;
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{membershipsCount}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "regiDeadline",
    header: "Registration Deadline",
    cell: ({ row }) => {
      const regiDeadline = row.original.regiDeadline;
      if (!regiDeadline)
        return <span className="text-muted-foreground">No deadline</span>;

      return (
        <div className="flex items-center gap-2">
          <span>{formatDate(regiDeadline)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <IconCalendar className="size-4 text-muted-foreground" />
        <span>
          {row.original.startDate
            ? formatDate(row.original.startDate)
            : "No start date"}{" "}
          –{" "}
          {row.original.endDate
            ? formatDate(row.original.endDate)
            : "No end date"}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const season = row.original;
      const onViewSeason = (table.options.meta as any)?.onViewSeason;
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
              className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
              onClick={() => handleViewSeason(season.id, onViewSeason)}
            >
              <IconEye className="mr-2 size-4" />
              View Season
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer focus:bg-destructive focus:text-destructive-foreground"
              onClick={() => handleDeleteSeason(season.id)}
            >
              <IconTrash className="mr-2 size-4" />
              Delete Season
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function SeasonsDataTable({
  data,
  isLoading,
  onViewSeason,
}: SeasonsDataTableProps) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [expandedGroups, setExpandedGroups] = React.useState<
    Record<string, boolean>
  >({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    meta: { onViewSeason } as any,
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

  // Group the CURRENT row model (after filters/sorts/pagination) by season name
  const groupedRows = React.useMemo(() => {
    const groups = new Map<string, { name: string; rows: Row<Season>[] }>();
    table.getRowModel().rows.forEach((row: Row<Season>) => {
      const name: string = row.original?.name ?? "Untitled";
      const key = name.trim().toLowerCase();
      if (!groups.has(key)) groups.set(key, { name, rows: [] });
      groups.get(key)!.rows.push(row);
    });
    return Array.from(groups.values());
  }, [table.getRowModel().rows]);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Compute keys for groups that actually have multiple seasons
  const multiGroupKeys = React.useMemo(
    () =>
      groupedRows
        .filter((g) => g.rows.length > 1)
        .map((g) => g.name.trim().toLowerCase()),
    [groupedRows]
  );

  const allExpanded = React.useMemo(() => {
    if (!multiGroupKeys.length) return true;
    return multiGroupKeys.every((k) => (expandedGroups[k] ?? true) === true);
  }, [multiGroupKeys, expandedGroups]);

  const toggleAllGroups = (expand: boolean) => {
    const next: Record<string, boolean> = {};
    multiGroupKeys.forEach((k) => {
      next[k] = expand;
    });
    setExpandedGroups((prev) => ({ ...prev, ...next }));
  };

  return (
    <div className="space-y-4">
      {/* Search and Selection Info */}
      <div className="flex items-center justify-between px-1 lg:px-2">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search seasons by name, league type, entry fee..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="w-80"
          />

          {/* Expand/Collapse all seasons groups (icon) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleAllGroups(!allExpanded)}
            disabled={!multiGroupKeys.length}
            aria-label={
              allExpanded
                ? "Collapse all season groups"
                : "Expand all season groups"
            }
          >
            {allExpanded ? (
              <IconArrowsMinimize className="h-4 w-4" />
            ) : (
              <IconArrowsMaximize className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} season(s) selected
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-md border mx-1 lg:mx-2 bg-background">
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
                    Loading seasons...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              // Render grouped rows: for names with multiple entries, show a collapsible parent row
              groupedRows.map((group) => {
                const key = group.name.trim().toLowerCase();
                const isMulti = group.rows.length > 1;
                const isExpanded = expandedGroups[key] ?? true; // default expanded for multi

                if (!isMulti) {
                  const single = group.rows[0];
                  return (
                    <TableRow
                      key={single.id}
                      data-state={single.getIsSelected() && "selected"}
                      className="hover:bg-muted/50"
                    >
                      {single
                        .getVisibleCells()
                        .map((cell: Cell<Season, unknown>) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                    </TableRow>
                  );
                }

                return (
                  <React.Fragment key={key}>
                    {/* Group header row */}
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={columns.length}>
                        <button
                          type="button"
                          onClick={() => toggleGroup(key)}
                          className="flex items-center gap-2 font-semibold"
                        >
                          <IconChevronDown
                            className={`h-4 w-4 transition-transform ${
                              isExpanded ? "rotate-0" : "-rotate-90"
                            }`}
                          />
                          {group.name}
                          <span className="ml-2 text-xs text-muted-foreground">
                            {group.rows.length} seasons
                          </span>
                        </button>
                      </TableCell>
                    </TableRow>

                    {/* Child rows */}
                    {isExpanded &&
                      group.rows.map((row: Row<Season>) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                          className="hover:bg-muted/50"
                        >
                          {row
                            .getVisibleCells()
                            .map((cell: Cell<Season, unknown>) => (
                              <TableCell key={cell.id}>
                                {/* Indent first column content for hierarchy visual */}
                                {cell.column.id === "name" ? (
                                  <div className="pl-6">
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext()
                                    )}
                                  </div>
                                ) : (
                                  flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )
                                )}
                              </TableCell>
                            ))}
                        </TableRow>
                      ))}
                  </React.Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No seasons found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-1 lg:px-2">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} season(s)
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
