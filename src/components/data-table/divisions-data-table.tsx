"use client";

import * as React from "react";
import {
  IconCategory,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconTrash,
  IconCalendar,
  IconUsers,
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
import { divisionSchema, Division } from "@/constants/zod/division-schema";
import { toast } from "sonner";
import { z } from "zod";

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
import axiosInstance, { endpoints } from "@/lib/endpoints";

import {
  formatTableDate,
  formatCurrency,
  getStatusBadgeVariant,
  getDivisionLevelLabel,
  getGameTypeLabel,
  getGenderCategoryLabel,
  renderValue,
  formatCount,
  LOADING_STATES,
  TABLE_ANIMATIONS,
  RESPONSIVE_CLASSES,
  ACTION_MESSAGES,
  COLUMN_WIDTHS,
} from "./constants";

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
  const [error, setError] = React.useState<string | null>(null);

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [viewDivision, setViewDivision] = React.useState<Division | null>(null);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [editDivision, setEditDivision] = React.useState<Division | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [deleteDivision, setDeleteDivision] = React.useState<Division | null>(
    null
  );
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchDivisions = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching divisions from:", endpoints.division.getAll);
      const response = await axiosInstance.get(endpoints.division.getAll);

      console.log("Raw response:", response.data);

      if (!response.data) {
        console.error("No data received from API");
        setData([]);
        setError("No data received from server");
        toast.error("No data received from server");
        return;
      }

      // Handle different response formats
      let divisionsArray = response.data;

      // Check if response has a 'data' property (nested structure)
      if (response.data.data && Array.isArray(response.data.data)) {
        divisionsArray = response.data.data;
      }
      // Check if response has a 'divisions' property
      else if (
        response.data.divisions &&
        Array.isArray(response.data.divisions)
      ) {
        divisionsArray = response.data.divisions;
      }
      // Check if response.data is directly an array
      else if (Array.isArray(response.data)) {
        divisionsArray = response.data;
      }
      // Invalid format
      else {
        console.error(
          "Response data is not in expected format:",
          response.data
        );
        setData([]);
        setError("Invalid data format from server");
        toast.error("Invalid data format from server");
        return;
      }

      console.log("Divisions array before parsing:", divisionsArray);

      // Parse and validate with Zod
      try {
        const parsed = z.array(divisionSchema).parse(divisionsArray);
        console.log("Successfully parsed divisions:", parsed);
        setData(parsed);
      } catch (parseError: any) {
        console.error("Zod validation error:", parseError);
        console.error(
          "Zod error details:",
          JSON.stringify(parseError.errors, null, 2)
        );

        // Show more detailed error
        const errorMessage =
          parseError.errors?.[0]?.message || "Data validation failed";
        const errorPath = parseError.errors?.[0]?.path?.join(".") || "";
        setError(`Data validation error at ${errorPath}: ${errorMessage}`);
        toast.error(`Data validation error: ${errorMessage}`);

        // Try to set data anyway for debugging
        setData(divisionsArray);
      }
    } catch (error: any) {
      console.error("Failed to load divisions:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        ACTION_MESSAGES.ERROR.LOAD_FAILED;

      setData([]);
      setError(errorMessage);
      toast.error(errorMessage);
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
      toast.success(response.data?.message ?? ACTION_MESSAGES.SUCCESS.DELETE);
      await fetchDivisions();
      setDeleteDivision(null);
      setIsDeleteOpen(false);
    } catch (error: any) {
      console.error("Delete error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        ACTION_MESSAGES.ERROR.DELETE_FAILED;
      toast.error(errorMessage);
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
      genderCategory: editDivision.genderCategory ?? null,
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
        size: 50,
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
                  Level: {getDivisionLevelLabel(division.divisionLevel)}
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
        cell: ({ row }) => {
          const seasonName = (row.original as any).season?.name;
          return (
            <div className="flex items-center gap-2">
              <IconTrophy className="size-4 text-muted-foreground" />
              <span>{seasonName || renderValue(null)}</span>
            </div>
          );
        },
      },
      {
        id: "composition",
        header: "Division Details",
        cell: ({ row }) => {
          const division = row.original;
          return (
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize text-xs">
                  {getDivisionLevelLabel(division.divisionLevel)}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="capitalize">
                  {getGameTypeLabel(division.gameType)}
                </span>
                <span>•</span>
                <span className="capitalize">
                  {getGenderCategoryLabel(division.genderCategory)}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "threshold",
        header: "Rating Threshold",
        cell: ({ row }) => {
          const threshold = row.original.threshold;
          return threshold ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {threshold} pts
              </Badge>
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
      {
        id: "capacity",
        header: "Capacity",
        cell: ({ row }) => {
          const division = row.original;
          const gameType = division.gameType;

          if (gameType === "singles") {
            return (
              <div className="flex items-center gap-2">
                <IconUsers className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {formatCount(division.currentSinglesCount)} /{" "}
                  {renderValue(division.maxSingles) as any}
                </span>
              </div>
            );
          } else if (gameType === "doubles") {
            return (
              <div className="flex items-center gap-2">
                <IconUsers className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {formatCount(division.currentDoublesCount)} /{" "}
                  {renderValue(division.maxDoublesTeams) as any}
                </span>
              </div>
            );
          } else {
            return (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Singles</span>
                  <span className="text-sm font-medium">
                    {formatCount(division.currentSinglesCount)} /{" "}
                    {renderValue(division.maxSingles)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Doubles</span>
                  <span className="text-sm font-medium">
                    {formatCount(division.currentDoublesCount)} /{" "}
                    {renderValue(division.maxDoublesTeams)}
                  </span>
                </div>
              </div>
            );
          }
        },
      },
      {
        id: "sponsor",
        header: "Sponsor & Prize",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1 text-sm">
            <span className="font-medium">
              {renderValue(row.original.sponsoredDivisionName)}
            </span>
            <span className="text-xs text-green-600 font-medium">
              {formatCurrency(row.original.prizePoolTotal, "MYR")}
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
              variant={getStatusBadgeVariant(
                "DIVISION",
                row.original.isActive ? "ACTIVE" : "INACTIVE"
              )}
              className="capitalize"
            >
              {row.original.isActive ? "Active" : "Inactive"}
            </Badge>
            {row.original.autoAssignmentEnabled && (
              <Badge variant="secondary" className="text-xs">
                Auto assign
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Last Updated",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <IconCalendar className="size-4 text-muted-foreground" />
            <span>{formatTableDate(row.original.updatedAt)}</span>
          </div>
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
                  size="icon"
                  className={`flex h-8 w-8 items-center justify-center ${TABLE_ANIMATIONS.ROW_HOVER} ${TABLE_ANIMATIONS.TRANSITION}`}
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
        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
            <div className="flex items-start gap-2">
              <IconTrash className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Error loading divisions</p>
                <p className="text-sm mt-1">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchDivisions}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Selection Info */}
        <div
          className={`flex items-center justify-between ${RESPONSIVE_CLASSES.PADDING_LARGE}`}
        >
          <div className="flex items-center space-x-2">
            <Input
              placeholder={LOADING_STATES.SEARCH_PLACEHOLDER.DIVISIONS}
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

        {/* Table Container */}
        <div
          className={`rounded-md border bg-background ${RESPONSIVE_CLASSES.MARGIN}`}
        >
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
                      <div className={TABLE_ANIMATIONS.LOADING_SPINNER} />
                      {LOADING_STATES.LOADING_TEXT}
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={TABLE_ANIMATIONS.ROW_HOVER}
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
                    {LOADING_STATES.NO_DATA_TEXT}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div
          className={`flex items-center justify-between ${RESPONSIVE_CLASSES.PADDING_LARGE}`}
        >
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

      {/* View Division Dialog */}
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
            <DialogTitle>
              {viewDivision?.name ?? "Division details"}
            </DialogTitle>
            <DialogDescription>
              Overview of this division configuration.
            </DialogDescription>
          </DialogHeader>
          {viewDivision ? (
            <div className="space-y-5">
              <div className="grid gap-3 rounded-lg border bg-muted/30 p-4">
                <DetailRow
                  label="Season"
                  value={
                    (viewDivision as any).season?.name ?? renderValue(null)
                  }
                />
                <DetailRow
                  label="Season dates"
                  value={`${formatTableDate(
                    (viewDivision as any).season?.startDate
                  )} - ${formatTableDate(
                    (viewDivision as any).season?.endDate
                  )}`}
                />
                <DetailRow
                  label="Level"
                  value={getDivisionLevelLabel(viewDivision.divisionLevel)}
                />
                <DetailRow
                  label="Game type"
                  value={getGameTypeLabel(viewDivision.gameType)}
                />
                <DetailRow
                  label="Gender"
                  value={getGenderCategoryLabel(viewDivision.genderCategory)}
                />
                <DetailRow
                  label="Points threshold"
                  value={renderValue(viewDivision.threshold) as any}
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
                  value={formatCount(viewDivision.currentSinglesCount)}
                />
                <DetailRow
                  label="Current doubles"
                  value={formatCount(viewDivision.currentDoublesCount)}
                />
                <DetailRow
                  label="Prize pool"
                  value={formatCurrency(viewDivision.prizePoolTotal, "MYR")}
                />
                <DetailRow
                  label="Sponsor"
                  value={renderValue(viewDivision.sponsoredDivisionName) as any}
                />
                <DetailRow
                  label="Auto assignment"
                  value={
                    viewDivision.autoAssignmentEnabled ? "Enabled" : "Disabled"
                  }
                />
                <DetailRow
                  label="Status"
                  value={
                    <Badge
                      variant={getStatusBadgeVariant(
                        "DIVISION",
                        viewDivision.isActive ? "ACTIVE" : "INACTIVE"
                      )}
                      className="capitalize"
                    >
                      {viewDivision.isActive ? "Active" : "Inactive"}
                    </Badge>
                  }
                />
                <DetailRow
                  label="Created"
                  value={formatTableDate(viewDivision.createdAt)}
                />
                <DetailRow
                  label="Last updated"
                  value={formatTableDate(viewDivision.updatedAt)}
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

      {/* Edit Division Modal */}
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

      {/* Delete Confirmation Dialog */}
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
              {ACTION_MESSAGES.DELETE_CONFIRM}
              <br />
              <span className="font-semibold">
                {deleteDivision?.name ?? "this division"}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
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
