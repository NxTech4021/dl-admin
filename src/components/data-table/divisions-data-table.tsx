/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import {
  IconDotsVertical,
  IconCalendar,
  IconEye,
  IconEdit,
  IconTrash,
  IconTrophy,
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
import axios from "axios";
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

// Season schema
export const seasonSchema = z.object({
  id: z.string(),
  name: z.string(),
  sportType: z.string().nullable().optional(),
  seasonType: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  regiDeadline: z.coerce.date().nullable().optional(),
  status: z
    .enum(["UPCOMING", "ACTIVE", "FINISHED", "CANCELLED"])
    .default("UPCOMING"),
  current: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Season = z.infer<typeof seasonSchema>;

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
    case "Pickleball":
      return "#A04DFE";
    case "Tennis":
      return "#ABFE4D";
    case "Padel":
      return "#4DABFE";
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

// const getLeagueBadgeVariant = (league: string) => {
//   switch (league) {
//     case "PJ League":
//       return "default";
//     case "Subang League":
//       return "secondary";
//     case "KL League":
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

// Define handlers outside of component to avoid scope issues
const handleViewSeason = (seasonId: string) => {
  // TODO: Navigate to season details page
};

const handleEditSeason = (seasonId: string) => {
  // TODO: Open edit modal or navigate to edit page
};

const handleDeleteDivision = async (seasonId: string) => {
  if (!confirm("Are you sure you want to delete this season?")) {
    return;
  }

  try {
    const res = await axiosInstance.delete(endpoints.division.delete(seasonId));
    // await axios.delete(
    //   `${process.env.NEXT_PUBLIC_HOST_URL}/api/season/${seasonId}`
    // );
    // Refresh the data after successful deletion
    window.location.reload(); // Simple refresh for now
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
          </div>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "sportType",
    header: "Sports",
    cell: ({ row }) => {
      const sportType = row.original.sportType;
      if (!sportType)
        return <span className="text-muted-foreground">No sport</span>;

      return (
        <Badge
          variant={getLeagueTypeBadgeVariant(sportType)}
          className="capitalize"
          style={{
            backgroundColor: getSportColor(sportType),
            color: "white",
            borderColor: getSportColor(sportType),
          }}
        >
          {sportType}
        </Badge>
      );
    },
  },
  {
    accessorKey: "seasonType",
    header: "League Type",
    cell: ({ row }) => {
      const seasonType = row.original.seasonType;
      if (!seasonType)
        return <span className="text-muted-foreground">No type</span>;

      return (
        <Badge variant="outline" className="capitalize">
          {seasonType}
        </Badge>
      );
    },
  },
  {
    accessorKey: "Season", // TODO: change description to 'Leagues' later when module has been implemented
    header: "Season",
    cell: ({ row }) => {
      const description = row.original.description;
      return (
        <div className="max-w-[200px] truncate">
          {description || "No description"}
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
          {status}
        </Badge>
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
          {formatDate(row.original.startDate)} –{" "}
          {formatDate(row.original.endDate)}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const season = row.original;

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
              onClick={() => handleViewSeason(season.id)}
            >
              <IconEye className="mr-2 size-4" />
              View Season
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
              onClick={() => handleEditSeason(season.id)}
            >
              <IconEdit className="mr-2 size-4" />
              Edit Season
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer focus:bg-destructive focus:text-destructive-foreground"
              onClick={() => handleDeleteDivision(season.id)}
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

export function DivisionsDataTable() {
  const [data, setData] = React.useState<Season[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const fetchDivisions = React.useCallback(async () => {
    setIsLoading(true);
    let response;
    try {
      response = await axiosInstance.get(
        endpoints.division.getAll
      );

      // Handle empty response or non-array response
      if (!response.data || !Array.isArray(response.data)) {
        setData([]);
        return;
      }

      const parsedData = z.array(seasonSchema).parse(response.data);
      setData(parsedData);
    } catch (error) {
      console.error("Failed to fetch divsions:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDivisions();
  }, [fetchDivisions]);

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
      {/* Search and Selection Info */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search seasons by name, league type..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="w-80"
          />
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} season(s) selected
          </div>
        </div>
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
                    Loading seasons...
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
                  No seasons found.
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
