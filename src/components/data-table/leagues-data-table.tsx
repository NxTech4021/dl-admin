"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Row,
  type Cell,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconInfoCircle,
  IconChevronDown,
  IconSearch,
  IconFilter,
  IconTrophy,
  IconMapPin,
  IconPlayerPlay,
  IconUsers,
  IconUser,
  IconCalendar,
  IconTrash,
  IconAdjustments,
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconCheck,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { League } from "@/ZodSchema/league-schema";

// View Details button component
const ViewDetailsButton = ({ league }: { league: League }) => {
  const router = useRouter();

  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={() => router.push(`/league/view/${league.id}`)}
      className="flex items-center justify-center"
    >
      <IconInfoCircle className="h-4 w-4" />
    </Button>
  );
};

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return "N/A";
  const dateObject = date instanceof Date ? date : new Date(date);
  return dateObject.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "ACTIVE":
    case "ONGOING":
      return "default";
    case "UPCOMING":
      return "secondary";
    case "FINISHED":
      return "outline";
    case "INACTIVE":
      return "outline";
    case "CANCELLED":
    case "SUSPENDED":
      return "destructive";
    default:
      return "outline";
  }
};

const getSportLabel = (sport: string) => {
  const map: Record<string, string> = { 
    TENNIS: "Tennis", 
    PICKLEBALL: "Pickleball", 
    PADEL: "Padel"
  };
  return map[sport] || sport;
};

const getGameTypeLabel = (gameType: string) => {
  const map: Record<string, string> = {
    SINGLES: "Singles",
    DOUBLES: "Doubles",
    MIXED: "Mixed Doubles",
    singles: "Singles",
    doubles: "Doubles",
    mixed: "Mixed Doubles",
  };
  return map[gameType] || gameType;
};

const getGameTypeOptionsForSport = (sport: string): { value: string; label: string }[] => {
  switch (sport) {
    case "TENNIS":
      return [
        { value: "SINGLES", label: "Singles" },
        { value: "DOUBLES", label: "Doubles" },
        { value: "MIXED", label: "Mixed Doubles" },
      ];
    case "PADEL":
      return [
        { value: "DOUBLES", label: "Doubles" },
        { value: "MIXED", label: "Mixed Doubles" },
        { value: "SINGLES", label: "Singles" },
      ];
    case "PICKLEBALL":
      return [
        { value: "SINGLES", label: "Singles" },
        { value: "DOUBLES", label: "Doubles" },
        { value: "MIXED", label: "Mixed Doubles" },
      ];
    default:
      return [
        { value: "SINGLES", label: "Singles" },
        { value: "DOUBLES", label: "Doubles" },
        { value: "MIXED", label: "Mixed Doubles" },
      ];
  }
};

const getJoinTypeLabel = (joinType: string) => {
  const map: Record<string, string> = {
    OPEN: "Open to All",
    INVITATION: "Invitation Only",
    REQUEST: "Request to Join",
    open: "Open to All",
    invitation: "Invitation Only",
    request: "Request to Join",
  };
  return map[joinType] || joinType;
};

// Dynamic columns based on selection state
const getColumns = (enableRowSelection: boolean): ColumnDef<League>[] => {
  const baseColumns: ColumnDef<League>[] = [];
  
  // Add selection column only when enabled
  if (enableRowSelection) {
    baseColumns.push({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
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
    });
  }
  
  // Add all other columns
  baseColumns.push(
  {
    accessorKey: "name",
    header: "League Name",
    cell: ({ row }) => {
      const league = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <IconTrophy className="size-4 text-primary" />
          </div>
          <div>
            <div className="font-semibold">{league.name}</div>
            <div className="text-sm text-muted-foreground">
              ID: {league.id}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "sportType",
    header: "Sport",
    cell: ({ row }) => {
      const sport = row.original.sportType;
      return (
        <Badge variant="outline" className="capitalize">
          {getSportLabel(sport)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      const location = row.original.location;
      return (
        <div className="flex items-center gap-2">
          <IconMapPin className="size-4 text-muted-foreground" />
          <span>{location || "Not specified"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={getStatusBadgeVariant(status)} className="capitalize">
          {status.toLowerCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "genderRestriction",
    header: "Gender",
    cell: ({ row }) => {
      const gender = row.original.genderRestriction;
      console.log('Gender data:', { genderRestriction: gender, fullRow: row.original });
      const genderLabel = gender === 'OPEN' ? 'Open' : 
                          gender === 'MALE' ? 'Male' : 
                          gender === 'FEMALE' ? 'Female' : 
                          gender === 'MIXED' ? 'Mixed' : 'Not set';
      return (
        <div className="flex items-center gap-2">
          <IconUser className="size-4 text-muted-foreground" />
          <span>{genderLabel}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "joinType",
    header: "Join Type",
    cell: ({ row }) => {
      const type = row.original.joinType;
      return (
        <div className="flex items-center gap-2">
          <IconInfoCircle className="size-4 text-muted-foreground" />
          <span>{type ? getJoinTypeLabel(type) : "Not set"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "gameType",
    header: "Game Type",
    cell: ({ row }) => {
      const sport = row.original.sportType;
      const gameType = row.original.gameType;
      const label = getGameTypeOptionsForSport(sport).find(o => o.value === gameType)?.label || getGameTypeLabel(gameType);
      return (
        <div className="flex items-center gap-2">
          <IconUsers className="size-4 text-muted-foreground" />
          <span>{label}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "memberCount",
    header: "Members",
    cell: ({ row }) => {
      const memberCount = row.original.memberCount || 0;
      return (
        <div className="flex items-center gap-2">
          <IconUsers className="size-4 text-muted-foreground" />
          <span>{memberCount}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "seasonCount",
    header: "Seasons",
    cell: ({ row }) => {
      const seasonCount = row.original.seasonCount || 0;
      return (
        <div className="flex items-center gap-2">
          <IconCalendar className="size-4 text-muted-foreground" />
          <span>{seasonCount}</span>
        </div>
      );
    },
  },
 {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      return (
        <div className="flex items-center gap-2">
          <IconCalendar className="size-4 text-muted-foreground" />
          <span>{formatDate(createdAt)}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">League Details</div>,
    cell: ({ row }) => {
      const league = row.original;
      return (
        <div className="flex items-center justify-center">
          <ViewDetailsButton league={league} />
        </div>
      );
    },
  },
  );
  
  return baseColumns;
};

interface LeaguesDataTableProps {
  data: League[];
  isLoading?: boolean;
  createLeagueButton?: React.ReactNode;
}

export function LeaguesDataTable({ data, isLoading = false, createLeagueButton }: LeaguesDataTableProps) {
  const router = useRouter();
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});
  const [enableRowSelection, setEnableRowSelection] = React.useState(false);
  const [showTools, setShowTools] = React.useState(false);

  const columns = getColumns(enableRowSelection);
  
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  // Group the CURRENT row model (after filters/sorts/pagination) by league name
  const groupedRows = React.useMemo(() => {
    const groups = new Map<string, { name: string; rows: Row<League>[] }>();
    table.getRowModel().rows.forEach((row: Row<League>) => {
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

  // Compute keys for groups that actually have multiple sports
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

  const handleBulkAction = (action: string) => {
    const selectedIds = selectedRows.map(row => row.original.id);
    switch (action) {
      case "delete":
        toast.error(`Delete ${selectedIds.length} leagues requires confirmation`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leagues..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-8 max-w-sm"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTools((s) => !s)}
          >
            <IconAdjustments className="mr-2 h-4 w-4" />
            Tools
          </Button>

          {showTools && (
            <>
              {/* Row Selection Toggle */}
              <Button
                variant={enableRowSelection ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setEnableRowSelection(!enableRowSelection);
                  if (enableRowSelection) {
                    setRowSelection({}); // Clear selections when disabling
                  }
                }}
              >
                <IconCheck className="mr-2 h-4 w-4" />
                {enableRowSelection ? "Disable Selection" : "Enable Selection"}
              </Button>

              {/* Expand/Collapse all sports groups (icon) */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAllGroups(!allExpanded)}
                disabled={!multiGroupKeys.length}
                aria-label={allExpanded ? "Collapse all sports groups" : "Expand all sports groups"}
              >
                {allExpanded ? (
                  <IconArrowsMinimize className="h-4 w-4" />
                ) : (
                  <IconArrowsMaximize className="h-4 w-4" />
                )}
              </Button>

              {/* Filter dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <IconFilter className="mr-2 h-4 w-4" />
                    Filter
                    <IconChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {["ACTIVE", "UPCOMING", "ONGOING", "FINISHED", "INACTIVE", "CANCELLED", "SUSPENDED"].map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      className="capitalize"
                      checked={
                        table.getColumn("status")?.getFilterValue() === status
                      }
                      onCheckedChange={(checked) =>
                        table.getColumn("status")?.setFilterValue(checked ? status : "")
                      }
                    >
                      {status.toLowerCase()}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Columns dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Columns <IconChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {/* Create League Button */}
          {!selectedRows.length && createLeagueButton && (
            <div>{createLeagueButton}</div>
          )}
          
          {enableRowSelection && selectedRows.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {selectedRows.length} selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkAction("delete")}
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
            {table.getRowModel().rows?.length ? (
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
                    >
                      {single.getVisibleCells().map((cell: Cell<League, unknown>) => (
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
                            className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                          />
                          {group.name}
                          <span className="ml-2 text-xs text-muted-foreground">{group.rows.length} sports</span>
                        </button>
                      </TableCell>
                    </TableRow>

                    {/* Child rows */}
                    {isExpanded &&
                      group.rows.map((row: Row<League>) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell: Cell<League, unknown>) => (
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
                  className="h-24 text-center"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="size-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="ml-2">Loading leagues...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <IconTrophy className="size-12 text-muted-foreground" />
                      <span>No leagues found</span>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {enableRowSelection ? (
            <>
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </>
          ) : (
            <>
              Showing {table.getFilteredRowModel().rows.length} row(s).
            </>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </p>
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
