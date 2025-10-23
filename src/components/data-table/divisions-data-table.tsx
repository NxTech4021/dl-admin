"use client";

import * as React from "react";
import {
  IconCategory,
  IconDotsVertical,
  IconEdit,
  IconEye,
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
import { z } from "zod";
import { toast } from "sonner";

import DivisionCreateModal from "@/components/modal/division-create-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { seasonSchema } from "@/ZodSchema/season-schema";
import axiosInstance, { endpoints } from "@/lib/endpoints";

export const divisionLevelEnum = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);
export const gameTypeEnum = z.enum(["singles", "doubles"]);
export const genderCategoryEnum = z.enum(["male", "female", "mixed"]);

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
  currentSinglesCount: z.number().int().nullable().optional(),
  currentDoublesCount: z.number().int().nullable().optional(),
  autoAssignmentEnabled: z.boolean().optional().default(false),
  isActive: z.boolean().default(true),
  prizePoolTotal: z.number().nullable().optional(),
  sponsoredDivisionName: z.string().nullable().optional(),
  season: seasonSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Division = z.infer<typeof divisionSchema>;

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatMaybeDate = (date?: Date | null) => (date ? formatDate(date) : "-");

const formatCurrency = (value?: number | null) =>
  value != null
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value)
    : "-";

const renderValue = (value: unknown) =>
  value === null || value === undefined || value === "" ? "-" : value;

const formatCount = (value?: number | null) =>
  value === null || value === undefined ? "-" : value;

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start justify-between gap-4 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-right break-words max-w-[60%]">
      {value}
    </span>
  </div>
);

export function DivisionsDataTable() {
  const [data, setData] = React.useState<Division[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [viewDivision, setViewDivision] = React.useState<Division | null>(null);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [editDivision, setEditDivision] = React.useState<Division | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [deleteDivision, setDeleteDivision] =
    React.useState<Division | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchDivisions = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(endpoints.division.getAll);
      if (!response.data || !Array.isArray(response.data)) {
        setData([]);
        return;
      }
      const parsed = z.array(divisionSchema).parse(response.data);
      setData(parsed);
    } catch (error) {
      console.error("Failed to fetch divisions:", error);
      setData([]);
      toast.error("Unable to load divisions.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDivisions();
  }, [fetchDivisions]);

  const handleViewDivision = React.useCallback((division: Division) => {
    setViewDivision(division);
    setIsViewOpen(true);
  }, []);

  const handleEditDivision = React.useCallback((division: Division) => {
    setEditDivision(division);
    setIsEditOpen(true);
  }, []);

  const handleDeleteRequest = React.useCallback((division: Division) => {
    setDeleteDivision(division);
    setIsDeleteOpen(true);
  }, []);

  const handleDeleteDivision = React.useCallback(async () => {
    if (!deleteDivision) return;
    try {
      setIsDeleting(true);
      const response = await axiosInstance.delete(
        endpoints.division.delete(deleteDivision.id)
      );
      toast.success(
        response.data?.message ?? "Division deleted successfully."
      );
      await fetchDivisions();
      setDeleteDivision(null);
      setIsDeleteOpen(false);
    } catch (error) {
      console.error("Failed to delete division:", error);
      toast.error("Failed to delete division.");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteDivision, fetchDivisions]);

  const handleEditSuccess = React.useCallback(async () => {
    await fetchDivisions();
    setEditDivision(null);
    setIsEditOpen(false);
  }, [fetchDivisions]);

  const mappedEditDivision = React.useMemo(() => {
    if (!editDivision) {
      return null;
    }
    return {
      id: editDivision.id,
      seasonId: editDivision.seasonId,
      name: editDivision.name,
      description: editDivision.description ?? null,
      threshold: editDivision.threshold ?? null,
      divisionLevel: editDivision.divisionLevel,
      gameType: editDivision.gameType,
      genderCategory: editDivision.genderCategory,
      maxSingles: editDivision.maxSingles ?? null,
      maxDoublesTeams: editDivision.maxDoublesTeams ?? null,
      autoAssignmentEnabled: editDivision.autoAssignmentEnabled ?? false,
      isActive: editDivision.isActive,
      prizePoolTotal: editDivision.prizePoolTotal ?? null,
      sponsoredDivisionName: editDivision.sponsoredDivisionName ?? null,
    };
  }, [editDivision]);

  const columns = React.useMemo<ColumnDef<Division>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
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
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <IconCategory className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">{division.name}</span>
                <span className="text-xs text-muted-foreground">
                  Level: {division.divisionLevel}
                </span>
              </div>
            </div>
          );
        },
        enableHiding: false,
      },
      {
        accessorKey: "season.name",
        header: "Season",
        cell: ({ row }) => <span>{row.original.season.name ?? "-"}</span>,
      },
      {
        id: "composition",
        header: "Division Details",
        cell: ({ row }) => {
          const division = row.original;
          return (
            <div className="flex flex-col gap-1 text-sm">
              <span className="font-medium capitalize">
                {division.divisionLevel}
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="capitalize">{division.gameType}</span>
                <span>•</span>
                <span className="capitalize">
                  {division.genderCategory ?? "Any gender"}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "threshold",
        header: "Rating Threshold",
        cell: ({ row }) => row.original.threshold ?? "-",
      },
      {
        id: "capacity",
        header: "Capacity",
        cell: ({ row }) => {
          const division = row.original;
          const singlesInfo =
            division.gameType !== "doubles" ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Singles</span>
                <span className="text-sm font-medium">
                  {formatCount(division.currentSinglesCount)} /{" "}
                  {renderValue(division.maxSingles)}
                </span>
              </div>
            ) : null;
          const doublesInfo =
            division.gameType !== "singles" ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Doubles</span>
                <span className="text-sm font-medium">
                  {formatCount(division.currentDoublesCount)} /{" "}
                  {renderValue(division.maxDoublesTeams)}
                </span>
              </div>
            ) : null;

          return (
            <div className="flex flex-col gap-1">
              {singlesInfo}
              {doublesInfo}
            </div>
          );
        },
      },
      {
        id: "sponsor",
        header: "Sponsor & Prize",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1 text-sm">
            <span>{renderValue(row.original.sponsoredDivisionName)}</span>
            <span className="text-xs text-muted-foreground">
              {formatCurrency(row.original.prizePoolTotal)}
            </span>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={row.original.isActive ? "outline" : "default"}
              className="capitalize"
            >
              {row.original.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge
              variant={row.original.autoAssignmentEnabled ? "secondary" : "outline"}
            >
              {row.original.autoAssignmentEnabled ? "Auto assign" : "Manual"}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Last Updated",
        cell: ({ row }) => formatDate(row.original.updatedAt),
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
                  size="icon"
                  className="flex h-8 w-8 items-center justify-center"
                >
                  <IconDotsVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem
                  className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
                  onClick={() => handleViewDivision(division)}
                >
                  <IconEye className="mr-2 h-4 w-4" />
                  View Division
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
                  onClick={() => handleEditDivision(division)}
                >
                  <IconEdit className="mr-2 h-4 w-4" />
                  Edit Division
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onClick={() => handleDeleteRequest(division)}
                >
                  <IconTrash className="mr-2 h-4 w-4" />
                  Delete Division
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [handleDeleteRequest, handleEditDivision, handleViewDivision]
  );

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
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search divisions by name, game type..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="w-80"
            />
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} division(s) selected
          </div>
        </div>

        <div className="mx-4 rounded-md border bg-background lg:mx-6">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
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
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary" />
                      Loading divisions...
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
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

      <Dialog
        open={isViewOpen}
        onOpenChange={(open) => {
          if (!open) {
            setViewDivision(null);
          }
          setIsViewOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewDivision?.name ?? "Division details"}</DialogTitle>
            <DialogDescription>
              Overview of this division configuration.
            </DialogDescription>
          </DialogHeader>
          {viewDivision ? (
            <div className="space-y-5">
              <div className="grid gap-3 rounded-lg border bg-muted/30 p-4">
                <DetailRow
                  label="Season"
                  value={viewDivision.season?.name ?? "-"}
                />
                <DetailRow
                  label="Season dates"
                  value={`${formatMaybeDate(viewDivision.season?.startDate)} - ${formatMaybeDate(
                    viewDivision.season?.endDate
                  )}`}
                />
                <DetailRow
                  label="Level"
                  value={viewDivision.divisionLevel}
                />
                <DetailRow
                  label="Game type"
                  value={viewDivision.gameType}
                />
                <DetailRow
                  label="Gender"
                  value={viewDivision.genderCategory}
                />
                <DetailRow
                  label="Points threshold"
                  value={renderValue(viewDivision.threshold)}
                />
                <DetailRow
                  label="Capacity"
                  value={
                    viewDivision.gameType === "singles"
                      ? `${renderValue(viewDivision.maxSingles)} players`
                      : `${renderValue(viewDivision.maxDoublesTeams)} teams`
                  }
                />
                <DetailRow
                  label="Current singles"
                  value={
                    viewDivision.gameType === "singles"
                      ? formatCount(viewDivision.currentSinglesCount)
                      : "-"
                  }
                />
                <DetailRow
                  label="Current doubles"
                  value={
                    viewDivision.gameType === "doubles"
                      ? formatCount(viewDivision.currentDoublesCount)
                      : "-"
                  }
                />
                <DetailRow
                  label="Prize pool"
                  value={formatCurrency(viewDivision.prizePoolTotal)}
                />
                <DetailRow
                  label="Sponsor"
                  value={renderValue(viewDivision.sponsoredDivisionName)}
                />
                <DetailRow
                  label="Auto assignment"
                  value={viewDivision.autoAssignmentEnabled ? "Enabled" : "Disabled"}
                />
                <DetailRow
                  label="Status"
                  value={
                    <Badge
                      variant={viewDivision.isActive ? "outline" : "default"}
                      className="capitalize"
                    >
                      {viewDivision.isActive ? "Active" : "Inactive"}
                    </Badge>
                  }
                />
                <DetailRow
                  label="Created"
                  value={formatDate(viewDivision.createdAt)}
                />
                <DetailRow
                  label="Last updated"
                  value={formatDate(viewDivision.updatedAt)}
                />
              </div>
              {viewDivision.description && (
                <div className="rounded-lg border bg-background p-4">
                  <h4 className="mb-2 text-sm font-semibold">Description</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {viewDivision.description}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Division details are unavailable.
            </p>
          )}
        </DialogContent>
      </Dialog>

      <DivisionCreateModal
        open={isEditOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditDivision(null);
          }
          setIsEditOpen(open);
        }}
        onDivisionCreated={handleEditSuccess}
        mode="edit"
        division={mappedEditDivision}
      />

      <AlertDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDivision(null);
          }
          setIsDeleteOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete division</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {deleteDivision?.name ?? "this division"}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDivision}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
