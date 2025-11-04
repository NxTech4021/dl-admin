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
import Image from "next/image";

// Import constants
import {
  formatTableDate,
  formatCurrency,
  getStatusBadgeVariant,
  getSportColor,
  getSportLabel,
  LOADING_STATES,
  TABLE_ANIMATIONS,
  RESPONSIVE_CLASSES,
  ACTION_MESSAGES,
  COLUMN_WIDTHS,
} from './constants';

// Sport Icon Components
const PickleballIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      <g fill="#F8F3FF">
        <path d="M6.519 33.26a1.5 1.5 0 0 1-1.461-1.166C.346 11.497 12.714 4.013 13.243 3.704a1.5 1.5 0 0 1 1.516 2.59c-.477.284-10.97 6.8-6.778 25.131A1.5 1.5 0 0 1 6.52 33.26zM17 15.5a1.5 1.5 0 0 1-1.5-1.5c-.001-6.771 5.493-10.146 5.728-10.286a1.5 1.5 0 0 1 1.548 2.57C22.6 6.391 18.5 8.96 18.5 14a1.5 1.5 0 0 1-1.5 1.5z" fill="#F8F3FF" opacity="1"/>
        <path d="M13.17 26.61a1.5 1.5 0 0 1-1.326-.799c-2.444-4.62-.942-9.194-.876-9.387a1.499 1.499 0 1 1 2.842.962c-.01.029-1.14 3.572.686 7.023a1.5 1.5 0 0 1-1.325 2.201zM28.52 19.21c-.263 0-.529-.07-.771-.214-4.985-2.988-4.674-7.66-2.893-10.754a1.5 1.5 0 0 1 2.6 1.497c-.719 1.248-1.978 4.398 1.836 6.684a1.5 1.5 0 0 1-.772 2.786zM22.768 43.452a1.5 1.5 0 0 1-.197-2.987l3.584-.478a1.5 1.5 0 1 1 .396 2.974l-3.583.478a1.543 1.543 0 0 1-.2.013zM27.482 36.565c-.272 0-.546-.074-.794-.228l-2.996-1.873a1.499 1.499 0 1 1 1.59-2.544l2.996 1.873a1.499 1.499 0 0 1-.796 2.772zM32.259 32.245a1.5 1.5 0 0 1-1.38-.91l-1.15-2.688a1.5 1.5 0 1 1 2.758-1.18l1.15 2.688a1.5 1.5 0 0 1-1.378 2.09z" fill="#F8F3FF" opacity="1"/>
        <path d="M22.549 54.498c-1.171 0-2.35-.302-3.414-.922-6.609-3.826-10.872-8.09-14.713-14.714-1.536-2.66-1.11-6.016 1.037-8.163l13.29-13.29a6.837 6.837 0 0 1 6.047-1.895l10.48 1.89a1.5 1.5 0 0 1-.533 2.952l-10.48-1.89a3.843 3.843 0 0 0-3.393 1.065L7.58 32.82c-1.187 1.187-1.419 3.054-.561 4.539 3.601 6.212 7.42 10.032 13.622 13.621 1.48.862 3.35.63 4.551-.565l7.456-7.466a1.5 1.5 0 1 1 2.123 2.12l-7.46 7.47a6.75 6.75 0 0 1-4.762 1.958zM40.202 30.5a1.5 1.5 0 0 1-1.474-1.234l-1.084-6.01a1.501 1.501 0 0 1 2.953-.532l1.084 6.01a1.501 1.501 0 0 1-1.479 1.766z" fill="#F8F3FF" opacity="1"/>
        <path d="M39.116 24.493c-.384 0-.767-.146-1.06-.44l-4.109-4.108a1.5 1.5 0 0 1 0-2.12l11.069-11.07.643-1.715a2.37 2.37 0 0 1 3.897-.844l4.249 4.248c.572.573.812 1.387.641 2.179a2.364 2.364 0 0 1-1.484 1.718l-1.716.644-11.07 11.069c-.292.293-.676.44-1.06.44zm-1.987-5.608 1.987 1.987 10.238-10.238c.152-.152.333-.269.535-.344l1.105-.415-2.868-2.869-.415 1.106a1.5 1.5 0 0 1-.344.534zm9.178-11.3h.01zm2.16-1.492z" fill="#F8F3FF" opacity="1"/>
        <path d="M43.626 19.984c-.384 0-.768-.146-1.06-.44l-4.11-4.11a1.5 1.5 0 1 1 2.12-2.12l4.11 4.11a1.5 1.5 0 0 1-1.06 2.56zM48.026 15.585c-.383 0-.767-.147-1.06-.44l-4.11-4.11a1.5 1.5 0 1 1 2.12-2.121l4.11 4.11a1.5 1.5 0 0 1-1.06 2.561z" fill="#F8F3FF" opacity="1"/>
      </g>
      <path fill="#C89AFF" d="M46.255 32.01c-7.855 0-14.244 6.39-14.244 14.245S38.4 60.5 46.255 60.5 60.5 54.11 60.5 46.255s-6.39-14.244-14.245-14.244zm-5.409 17.054a2 2 0 1 1-3.912-.831 2 2 0 0 1 3.912.831zm1.066-7.085a2 2 0 1 1-.418-3.978 2 2 0 0 1 .418 3.978zm6.075 13.02a2 2 0 1 1-3.464-2 2 2 0 0 1 3.464 2zm0-7.744a2 2 0 1 1-3.464-2 2 2 0 0 1 3.464 2zm.993-6.452a2 2 0 1 1 3.654-1.627 2 2 0 0 1-3.654 1.627zm5.979 9.332a2 2 0 1 1-2.677-2.973 2 2 0 0 1 2.677 2.973z" opacity="1"/>
    </g>
  </svg>
);

const TennisIcon = ({ size = 18 }: { size?: number }) => (
  <Image
    src="/tennis-icon.svg"
    alt="Tennis"
    width={size}
    height={size}
    className="inline-block"
  />
);

const PadelIcon = ({ size = 18 }: { size?: number }) => (
  <Image
    src="/padel-icon.svg"
    alt="Padel"
    width={size}
    height={size}
    className="inline-block"
  />
);

const getSportIcon = (sportType: string | null | undefined, size = 18) => {
  const sport = sportType?.toUpperCase();
  switch (sport) {
    case 'PICKLEBALL':
      return <PickleballIcon size={size} />;
    case 'TENNIS':
      return <TennisIcon size={size} />;
    case 'PADEL':
      return <PadelIcon size={size} />;
    default:
      return null;
  }
};

export type SeasonsDataTableProps = {
  data: Season[];
  isLoading: boolean;
  onViewSeason?: (seasonId: string) => void;
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
            {season.leagues.map((league) => {
              const sportColor = getSportColor(league.sportType?.toUpperCase() || 'DEFAULT');
              const sportLabel = getSportLabel(league.sportType?.toUpperCase() || league.sportType || 'Unknown');
              
              return (
                <div
                  key={league.id}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border"
                  style={{ 
                    color: sportColor,
                    borderColor: sportColor + '40',
                    backgroundColor: sportColor + '08'
                  }}
                >
                  {league.name} • {sportLabel}
                </div>
              );
            })}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const getCategoriesDisplay = (season: Season): React.ReactNode => {
  const categories = season.categories || (season.category ? [season.category] : []);
  
  if (!categories || categories.length === 0) {
    return <span className="text-muted-foreground text-xs">No categories</span>;
  }

  if (categories.length === 1) {
    const categoryName = categories[0]?.name || "Unnamed Category";
    return (
      <Badge variant="secondary" className="text-xs">
        {categoryName}
      </Badge>
    );
  }

  const firstCategoryName = categories[0]?.name || "Unnamed Category";
  
  return (
    <HoverCard>
      <HoverCardTrigger>
        <Badge variant="secondary" className="cursor-pointer text-xs">
          {firstCategoryName}
          {categories.length > 1 && ` +${categories.length - 1}`}
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Linked Categories</h4>
          <div className="flex flex-wrap gap-1">
            {categories.map((category: any) => {
              const categoryName = category?.name || "Unnamed Category";
              
              return (
                <div
                  key={category?.id || categoryName}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border bg-muted"
                >
                  {categoryName}
                </div>
              );
            })}
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
  if (!confirm(ACTION_MESSAGES.DELETE_CONFIRM)) {
    return;
  }

  try {
    await axiosInstance.delete(endpoints.season.delete(seasonId));
    // Refresh the data after successful deletion
    window.location.reload();
  } catch (error) {
    console.error(ACTION_MESSAGES.ERROR.DELETE_FAILED, error);
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
    size: 50,
  },
  {
    accessorKey: "name",
    header: "Season Name",
    cell: ({ row }) => {
      const season = row.original;
      const sportIcon = season.leagues && season.leagues.length > 0 
        ? getSportIcon(season.leagues[0]?.sportType, 18)
        : <IconTrophy className="size-4 text-primary" />;
      
      return (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black">
            {sportIcon}
          </div>
          <div className="font-medium">{season.name}</div>
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
    accessorKey: "categories",
    header: "Categories",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {getCategoriesDisplay(row.original)}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const isActive = status === 'ACTIVE';
      const statusLabel = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      return (
        <Badge 
          variant={getStatusBadgeVariant('SEASON', status)} 
          className={`capitalize ${isActive ? 'bg-green-500 text-white border-transparent' : ''}`}
        >
          {statusLabel}
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
      const feeAmount = typeof entryFee === 'string' ? parseFloat(entryFee) : entryFee;
      if (!isNaN(feeAmount)) {
        return <span className="font-medium">{formatCurrency(feeAmount ,'MYR') }</span>;
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
          <span>{formatTableDate(regiDeadline)}</span>
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
            ? formatTableDate(row.original.startDate)
            : "No start date"}{" "}
          –{" "}
          {row.original.endDate
            ? formatTableDate(row.original.endDate)
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
              className={`${TABLE_ANIMATIONS.ROW_HOVER} ${TABLE_ANIMATIONS.TRANSITION} flex size-8`}
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
      <div className={`flex items-center justify-between ${RESPONSIVE_CLASSES.PADDING}`}>
        <div className="flex items-center space-x-2">
          <Input
            placeholder={LOADING_STATES.SEARCH_PLACEHOLDER.SEASONS}
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
      <div className={`rounded-md border ${RESPONSIVE_CLASSES.CONTAINER} bg-background`}>
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
                    <div className={TABLE_ANIMATIONS.LOADING_SPINNER}></div>
                    {LOADING_STATES.LOADING_TEXT}
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
                      className={TABLE_ANIMATIONS.ROW_HOVER}
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
                          className={TABLE_ANIMATIONS.ROW_HOVER}
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
                  {LOADING_STATES.NO_DATA_TEXT}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className={`flex items-center justify-between ${RESPONSIVE_CLASSES.PADDING}`}>
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
