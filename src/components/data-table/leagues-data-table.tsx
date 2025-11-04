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
import { ConfirmationModal } from "../modal/confirmation-modal";
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
  IconChevronDown,
  IconSearch,
  IconFilter,
  IconTrophy,
  IconMapPin,
  IconUsers,
  IconCalendar,
  IconTrash,
  IconAdjustments,
  IconArrowsMaximize,
  IconArrowsMinimize,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { League } from "@/ZodSchema/league-schema";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { useConfirmationModal } from "@/hooks/use-confirmation-modal";

import {
  formatTableDate,
  formatLocation,
  getStatusBadgeVariant,
  getSportColor,
  getSportLabel,
  getGameTypeLabel,
  getGameTypeOptionsForSport,
  LOADING_STATES,
  TABLE_ANIMATIONS,
  RESPONSIVE_CLASSES,
  ACTION_MESSAGES,
  FILTER_OPTIONS,
  formatCount,
} from './constants';

// League Name Cell Component
const LeagueNameCell = ({ league }: { league: League }) => {
  const router = useRouter();
  
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary/10 rounded-lg">
        <IconTrophy className="size-4 text-primary" />
      </div>
      <div>
        <div 
          className="font-semibold cursor-pointer hover:text-primary hover:underline group-hover:underline transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/league/view/${league.id}`);
          }}
        >
          {league.name}
        </div>
        {/* <div className="text-sm text-muted-foreground">
          ID: {league.id}
        </div> */}
      </div>
    </div>
  );
};

// Dynamic columns based on selection state
const getColumns = (enableRowSelection: boolean): ColumnDef<League>[] => {
  const baseColumns: ColumnDef<League>[] = [];
  
  // Add selection column only when enabled
  if (enableRowSelection) {
    baseColumns.push({
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
      size: 50,
    });
  }

  baseColumns.push(
    {
      accessorKey: "name",
      header: "League Name",
      cell: ({ row }) => {
        const league = row.original;
        return <LeagueNameCell league={league} />;
      },
      enableHiding: false,
    },
    {
      accessorKey: "sportType",
      header: "Sport",
      cell: ({ row }) => {
        const sport = row.original.sportType;
        const sportColor = getSportColor(sport);
        const sportLabel = getSportLabel(sport);
        
        return (
          <div
            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border"
            style={{ 
              color: sportColor,
              borderColor: sportColor + '40',
              backgroundColor: sportColor + '08'
            }}
          >
            <div 
              className="w-2.5 h-2.5 rounded-full mr-2" 
              style={{ backgroundColor: sportColor }}
            />
            {sportLabel}
          </div>
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
            <span>{formatLocation(location)}</span>
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
          <Badge variant={getStatusBadgeVariant('LEAGUE', status)} className="capitalize">
            {status.toLowerCase()}
          </Badge>
        );
      },
    },
    // {
    //   accessorKey: "gameType",
    //   header: "Game Type",
    //   cell: ({ row }) => {
    //     const sport = row.original.sportType;
    //     const gameType = row.original.gameType;
    //     const gameTypeOptions = getGameTypeOptionsForSport(sport);
    //     const label = gameTypeOptions.find(o => o.value === gameType)?.label || getGameTypeLabel(gameType);
        
    //     return (
    //       <div className="flex items-center gap-2">
    //         <IconUsers className="size-4 text-muted-foreground" />
    //         <span>{label}</span>
    //       </div>
    //     );
    //   },
    // },
    {
      accessorKey: "memberCount",
      header: "Players",
      cell: ({ row }) => {
        const memberCount = row.original.memberCount;
        return (
          <div className="flex items-center gap-2">
            <IconUsers className="size-4 text-muted-foreground" />
            <span>{formatCount(memberCount)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "seasonCount",
      header: "Seasons",
      cell: ({ row }) => {
        const seasonCount = row.original.seasonCount;
        return (
          <div className="flex items-center gap-2">
            <IconCalendar className="size-4 text-muted-foreground" />
            <span>{formatCount(seasonCount)}</span>
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
            <span>{formatTableDate(createdAt)}</span>
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
  onDataChange?: () => void; // Callback to refresh data after operations
}

export function LeaguesDataTable({ 
  data, 
  isLoading = false, 
  createLeagueButton,
  onDataChange
}: LeaguesDataTableProps) {
  const router = useRouter();
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});
  const [showTools, setShowTools] = React.useState(false);

  // Use the confirmation modal hook
  const confirmation = useConfirmationModal();

  const columns = getColumns(true);
  
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

  // Delete leagues function
  const deleteLeagues = async (leagueIds: string[]) => {
    confirmation.setLoading(true);
    
    try {
      // Delete leagues one by one
      const deletePromises = leagueIds.map(id => 
        axiosInstance.delete(endpoints.league.delete(id))
      );
      
      await Promise.all(deletePromises);
      
      toast.success(ACTION_MESSAGES.SUCCESS.DELETE);
      
      // Clear selection
      setRowSelection({});
      
      // Refresh data
      onDataChange?.();
      
      // Close modal
      confirmation.hideConfirmation();
      
    } catch (error: any) {
      console.error("Failed to delete leagues:", error);
      toast.error(error.response?.data?.message || ACTION_MESSAGES.ERROR.DELETE_FAILED);
    } finally {
      confirmation.setLoading(false);
    }
  };

  const handleBulkAction = (action: string) => {
    const selectedIds = selectedRows.map(row => row.original.id);
    const selectedNames = selectedRows.map(row => row.original.name);
    
    switch (action) {
      case "delete":
        confirmation.showConfirmation({
          title: `Delete ${selectedIds.length} League${selectedIds.length > 1 ? 's' : ''}`,
          description: selectedIds.length === 1 
            ? `Are you sure you want to delete "${selectedNames[0]}"? This action cannot be undone and will remove all associated data including seasons, divisions, and matches.`
            : `Are you sure you want to delete ${selectedIds.length} leagues? This action cannot be undone and will remove all associated data including seasons, divisions, and matches.`,
          onConfirm: () => deleteLeagues(selectedIds),
          variant: "destructive",
          confirmText: "Delete",
          cancelText: "Cancel",
        });
        break;
      default:
        break;
    }
  };

  return (
    <div className={`w-full space-y-4 py-4`}>
      {/* Confirmation Modal */}
      <ConfirmationModal
        open={confirmation.open}
        onOpenChange={confirmation.hideConfirmation}
        title={confirmation.title}
        description={confirmation.description}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        onConfirm={confirmation.onConfirm}
        isLoading={confirmation.isLoading}
        variant={confirmation.variant}
        icon={<IconTrash className="h-5 w-5 text-destructive" />}
      />

      {/* Toolbar */}
      <div className={`flex items-center justify-between`}>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={LOADING_STATES.SEARCH_PLACEHOLDER.LEAGUES}
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
              {/* Expand/Collapse all league groups */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAllGroups(!allExpanded)}
                disabled={!multiGroupKeys.length}
                aria-label={allExpanded ? "Collapse all league groups" : "Expand all league groups"}
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
                  {FILTER_OPTIONS.LEAGUE_STATUS.map((status) => (
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
          
          {selectedRows.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {selectedRows.length} selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkAction("delete")}
                disabled={confirmation.isLoading}
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className={`rounded-md border bg-background w-full`}>
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
                groupedRows.map((group) => {
                const key = group.name.trim().toLowerCase();
                const isMulti = group.rows.length > 1;
                const isExpanded = expandedGroups[key] ?? true;

                if (!isMulti) {
                  const single = group.rows[0];
                  const league = single.original;
                  return (
                    <TableRow
                      key={single.id}
                      data-state={single.getIsSelected() && "selected"}
                      className={`group ${TABLE_ANIMATIONS.ROW_HOVER} cursor-pointer`}
                      onClick={(e) => {
                        // Don't navigate if clicking on checkbox or interactive elements
                        const target = e.target as HTMLElement;
                        if (target.closest('button') || target.closest('input[type="checkbox"]') || target.closest('[role="button"]')) {
                          return;
                        }
                        router.push(`/league/view/${league.id}`);
                      }}
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
                          <span className="ml-2 text-xs text-muted-foreground">
                            {group.rows.length} league{group.rows.length !== 1 ? 's' : ''}
                          </span>
                        </button>
                      </TableCell>
                    </TableRow>

                    {/* Child rows */}
                    {isExpanded &&
                      group.rows.map((row: Row<League>) => {
                        const league = row.original;
                        return (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                            className={`group ${TABLE_ANIMATIONS.ROW_HOVER} cursor-pointer`}
                            onClick={(e) => {
                              // Don't navigate if clicking on checkbox or interactive elements
                              const target = e.target as HTMLElement;
                              if (target.closest('button') || target.closest('input[type="checkbox"]') || target.closest('[role="button"]')) {
                                return;
                              }
                              router.push(`/league/view/${league.id}`);
                            }}
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
                        );
                      })}
                  </React.Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <IconTrophy className="size-12 text-muted-foreground" />
                    <span>{LOADING_STATES.NO_DATA_TEXT}</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className={`flex items-center justify-between space-x-2 py-4`}>
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} league(s) selected.
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
