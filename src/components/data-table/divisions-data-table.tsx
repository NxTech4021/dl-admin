/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import {
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconTrash,
  IconCategory,
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
import { toast } from "sonner";
import { seasonSchema } from "@/ZodSchema/season-schema";
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

// ENUMS
export const divisionLevelEnum = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);
export const gameTypeEnum = z.enum(["singles", "doubles"]);
export const genderCategoryEnum = z.enum(["male", "female", "mixed"]);

// Division schema
export const divisionSchema = z.object({
  id: z.string(),
  seasonId: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  threshold: z.number().int().nullable().optional(),
  divisionLevel: divisionLevelEnum,
  gameType: gameTypeEnum,
  genderCategory: genderCategoryEnum,

  maxSingles: z.number().int().nullable().optional(),
  maxDoublesTeams: z.number().int().nullable().optional(),
  season: seasonSchema,
  isActive: z.boolean().default(true),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Division = z.infer<typeof divisionSchema>;

// Helper to format dates
const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Action handlers
const handleViewDivision = (divisionId: string) => {
  // TODO: Navigate to division details page
};

const handleEditDivision = (divisionId: string) => {
  // TODO: Open edit modal or navigate to edit page
};

const handleDeleteDivision = async (divisionId: string) => {
  if (!confirm("Are you sure you want to delete this Division?")) return;

  try {
    const res = await axiosInstance.delete(
      endpoints.division.delete(divisionId)
    );
    toast.success(res.data?.message ?? "Division deleted successfully");
    window.location.reload();
  } catch (err: any) {
    console.error("Failed to delete division:", err);
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      "Failed to delete division";
    toast.error(message);
  }
};

// Columns
const columns: ColumnDef<Division>[] = [
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
    header: "Division Name",
    cell: ({ row }) => {
      const division = row.original;

      // console.log("division data", division);
      return (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
            <IconCategory className="size-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <div className="font-medium">{division.name}</div>
            <div className="text-xs text-muted-foreground">
              Level: {division.divisionLevel}
            </div>
          </div>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "season.name",
    header: "Season",
    cell: ({ row }) => <span>{row.original.season.name ?? "—"}</span>,
  },
  {
    accessorKey: "gameType",
    header: "Game Type",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.gameType}</span>
    ),
  },
  {
    accessorKey: "genderCategory",
    header: "Gender",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.genderCategory}</span>
    ),
  },
  {
    accessorKey: "maxSingles",
    header: "Max Singles Players",
    cell: ({ row }) =>
      row.original.gameType === "singles"
        ? row.original.maxSingles ?? "—"
        : "—",
  },
  {
    accessorKey: "maxDoublesTeams",
    header: "Max Doubles Teams",
    cell: ({ row }) =>
      row.original.gameType === "doubles"
        ? row.original.maxDoublesTeams ?? "—"
        : "—",
  },
  {
    accessorKey: "threshold",
    header: "Threshold",
    cell: ({ row }) => row.original.threshold ?? "—",
  },
  {
    accessorKey: "isActive",
    header: "Active",
    cell: ({ row }) => (
      <Badge
        variant={row.original.isActive ? "outline" : "default"}
        className="capitalize"
      >
        {row.original.isActive ? "Yes" : "No"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const division = row.original;

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
              onClick={() => handleViewDivision(division.id)}
            >
              <IconEye className="mr-2 size-4" />
              View Division
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
              onClick={() => handleEditDivision(division.id)}
            >
              <IconEdit className="mr-2 size-4" />
              Edit Division
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer focus:bg-destructive focus:text-destructive-foreground"
              onClick={() => handleDeleteDivision(division.id)}
            >
              <IconTrash className="mr-2 size-4" />
              Delete Division
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function DivisionsDataTable() {
  const [data, setData] = React.useState<Division[]>([]);
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
      response = await axiosInstance.get(endpoints.division.getAll);

      if (!response.data || !Array.isArray(response.data)) {
        setData([]);
        return;
      }

      const parsedData = z.array(divisionSchema).parse(response.data);
      setData(parsedData);
    } catch (error) {
      console.error("Failed to fetch divisions:", error);
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
            placeholder="Search divisions by name, game type..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="w-80"
          />
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} division(s) selected
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
                    Loading divisions...
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
                  No divisions found.
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
          {table.getFilteredRowModel().rows.length} division(s)
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
