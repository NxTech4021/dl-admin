"use client";

import * as React from "react";

import {
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconTrash,
  IconCalendar,
  IconTrashX,
  IconChevronLeft,
  IconChevronRight,
  IconTags,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterBar } from "@/components/ui/filter-bar";
import { FilterSelect, type FilterOption } from "@/components/ui/filter-select";
import { SearchInput } from "@/components/ui/search-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

import axiosInstance from "@/lib/endpoints";
import { categorySchema, Category } from "@/constants/zod/category-schema";
import { endpoints } from "@/lib/endpoints";
import { ConfirmationModal } from "@/components/modal/confirmation-modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CategoryEditModal = React.lazy(() => import("@/components/modal/category-edit-modal"));

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/** Get gender restriction badge styling with dark mode support */
const getGenderBadgeClass = (restriction: string): string => {
  switch (restriction) {
    case "MALE":
      return "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800";
    case "FEMALE":
      return "text-pink-700 bg-pink-50 border-pink-200 dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-800";
    case "MIXED":
      return "text-violet-700 bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800";
    case "OPEN":
      return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
    default:
      return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700";
  }
};

/** Get game type badge styling with dark mode support */
const getGameTypeBadgeClass = (gameType: string | null): string => {
  switch (gameType) {
    case "SINGLES":
      return "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
    case "DOUBLES":
      return "text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800";
    default:
      return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700";
  }
};

/** Get status badge styling with dark mode support */
const getStatusBadgeClass = (isActive: boolean): string => {
  if (isActive) {
    return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
  }
  return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700";
};


// const getSeasonsDisplay = (category: Category): React.ReactNode => {
//   if (!category.season) {
//     return <span className="text-muted-foreground text-xs">No season Found</span>;
//   }

//   return (
//     <HoverCard>
//       <HoverCardTrigger>
//         <Badge variant="secondary" className="cursor-pointer">
//           {category.seasons.length} Season{category.seasons.length !== 1 ? 's' : ''}
//         </Badge>
//       </HoverCardTrigger>
//       <HoverCardContent>
//         <div className="space-y-2">
//           <h4 className="text-sm font-medium">Linked Seasons</h4>
//           <div className="flex flex-wrap gap-1">
//             {category.seasons.map((season) => (
//               <Badge key={season.id} variant="outline" className="text-xs">
//                 {season.name}
//               </Badge>
//             ))}
//           </div>
//         </div>
//       </HoverCardContent>
//     </HoverCard>
//   );
// };

const getSeasonsDisplay = (category: Category): React.ReactNode => {
  if (!category.seasons || category.seasons.length === 0) {
    return <span className="text-muted-foreground text-xs">No season assigned</span>;
  }

  if (category.seasons.length === 1) {
    return (
      <Badge variant="secondary" className="cursor-pointer">
        {category.seasons[0].name}
      </Badge>
    );
  }

 
  //   <Badge variant="secondary" className="cursor-pointer">
  //     {category.season.name}
  //   </Badge>
  
  return (
    <Badge variant="secondary" className="cursor-pointer">
      {category.seasons.length} Season{category.seasons.length !== 1 ? 's' : ''}
    </Badge>
  );
};

const createColumns = (
  handleEditCategory: (categoryId: string) => void,
  handleDeleteCategory: (categoryId: string) => void
): ColumnDef<Category>[] => [
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
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Category Name",
    cell: ({ row }) => {
      const category = row.original;
      return (
        <div className="font-medium text-foreground">{category.name || "Unnamed Category"}</div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "genderRestriction",
    header: "Gender",
    cell: ({ row }) => {
      const restriction = row.original.genderRestriction;
      return (
        <Badge
          variant="outline"
          className={cn("text-xs font-medium border capitalize", getGenderBadgeClass(restriction))}
        >
          {restriction.toLowerCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "gameType",
    header: "Game Type",
    cell: ({ row }) => {
      const gameType = row.original.gameType;
      return gameType ? (
        <Badge
          variant="outline"
          className={cn("text-xs font-medium border capitalize", getGameTypeBadgeClass(gameType))}
        >
          {gameType.toLowerCase()}
        </Badge>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      );
    },
  },
  {
    accessorKey: "matchFormat",
    header: "Match Format",
    cell: ({ row }) => {
      const format = row.original.matchFormat;
      return format ? (
        <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{format}</code>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      );
    },
  },
  {
    accessorKey: "season",
    header: "Season",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {getSeasonsDisplay(row.original)}
      </div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={cn("text-xs font-medium border", getStatusBadgeClass(row.original.isActive))}
      >
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <IconCalendar className="size-3.5" />
        <span className="text-sm">{formatDate(row.original.createdAt)}</span>
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const category = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="size-8"
              size="icon"
              onClick={(e) => e.stopPropagation()}
            >
              <IconDotsVertical className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEditCategory(category.id)}>
              <IconEye className="mr-2 size-4" />
              View Details
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              onClick={() => handleDeleteCategory(category.id)}
            >
              <IconTrash className="mr-2 size-4" />
              Delete Category
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface CategoriesDataTableProps {
  refreshTrigger?: number;
}

export function CategoriesDataTable({ refreshTrigger }: CategoriesDataTableProps) {
  const [data, setData] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>("");
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = React.useState(false);
  const [categoryToDelete, setCategoryToDelete] = React.useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Filter states
  const [gameTypeFilter, setGameTypeFilter] = React.useState<string>("all");
  const [genderRestrictionFilter, setGenderRestrictionFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [showFilters, setShowFilters] = React.useState<boolean>(false);

  // Get unique values for filter options
  const uniqueGameTypes = React.useMemo(() => {
    const gameTypesSet = new Set<string>();
    data.forEach((category) => {
      if (category.gameType) {
        gameTypesSet.add(category.gameType);
      }
    });
    return Array.from(gameTypesSet).sort();
  }, [data]);

  const uniqueGenderRestrictions = React.useMemo(() => {
    const restrictionsSet = new Set<string>();
    data.forEach((category) => {
      restrictionsSet.add(category.genderRestriction);
    });
    return Array.from(restrictionsSet).sort();
  }, [data]);

  // Filter data based on selected filters
  const filteredData = React.useMemo(() => {
    let filtered = data;

    // Apply game type filter
    if (gameTypeFilter !== "all") {
      filtered = filtered.filter(
        (category) => category.gameType === gameTypeFilter
      );
    }

    // Apply gender restriction filter
    if (genderRestrictionFilter !== "all") {
      filtered = filtered.filter(
        (category) => category.genderRestriction === genderRestrictionFilter
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter((category) => category.isActive === isActive);
    }

    return filtered;
  }, [data, gameTypeFilter, genderRestrictionFilter, statusFilter]);

  // Clear all filters
  const clearFilters = () => {
    setGameTypeFilter("all");
    setGenderRestrictionFilter("all");
    setStatusFilter("all");
    setGlobalFilter("");
  };

  // Check if any filters are active
  const hasActiveFilters =
    gameTypeFilter !== "all" ||
    genderRestrictionFilter !== "all" ||
    statusFilter !== "all" ||
    globalFilter !== "";

  React.useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(endpoints.categories.getAll);
        if (response.status !== 200) {
          throw new Error("Network response was not ok");
        }
        const result = await response.data;
        const parsedData = categorySchema.array().parse(result.data);
        setData(parsedData);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [refreshTrigger]);

  const handleEditCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setEditModalOpen(true);
  };

  const handleCategoryUpdated = async () => {
    // Refresh the data
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(endpoints.categories.getAll);
      if (response.status === 200) {
        const result = await response.data;
        const parsedData = categorySchema.array().parse(result.data);
        setData(parsedData);
      }
    } catch (error) {
      console.error("Failed to refresh categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = data.find(cat => cat.id === categoryId);
    if (category) {
      setCategoryToDelete(category);
      setDeleteModalOpen(true);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      const response = await axiosInstance.delete(endpoints.categories.delete(categoryToDelete.id));
      if (response.status === 200) {
        setData(prevData => prevData.filter(category => category.id !== categoryToDelete.id));
        setRowSelection(prev => {
          const newSelection = { ...prev };
          delete (newSelection as any)[categoryToDelete.id];
          return newSelection;
        });
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
        toast.success(`Category "${categoryToDelete.name}" deleted successfully`);
      }
    } catch (error: any) {
      console.error("Failed to delete category:", error);
      toast.error(
        error.response?.data?.message || 
        `Failed to delete category "${categoryToDelete.name}"`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) return;
    setBulkDeleteModalOpen(true);
  };

  const confirmBulkDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map(row => row.original.id);
    const selectedNames = selectedRows.map(row => row.original.name || "Unnamed Category");
    
    if (selectedIds.length === 0) return;

    setIsDeleting(true);
    let successCount = 0;
    const failedCategories: string[] = [];

    try {
      for (let i = 0; i < selectedIds.length; i++) {
        try {
          await axiosInstance.delete(endpoints.categories.delete(selectedIds[i]));
          successCount++;
        } catch (error: any) {
          console.error(`Failed to delete category ${selectedNames[i]}:`, error);
          failedCategories.push(selectedNames[i]);
        }
      }
      const failedIds = selectedRows
        .filter((_, index) => failedCategories.includes(selectedNames[index]))
        .map(row => row.original.id);
      
      const successfullyDeletedIds = selectedIds.filter(id => !failedIds.includes(id));
      
      setData(prevData => prevData.filter(category => !successfullyDeletedIds.includes(category.id)));
      
      // Clear all selections
      setRowSelection({});
      setBulkDeleteModalOpen(false);

      // Show appropriate toasts based on results
      if (successCount === selectedIds.length) {
        toast.success(
          `Successfully deleted ${successCount} categor${successCount === 1 ? 'y' : 'ies'}`
        );
      } else {
        toast.error(
          `Failed to delete all ${selectedIds.length} categories`,
          {
            description: failedCategories.length <= 3
              ? `Categories: ${failedCategories.join(', ')}`
              : `Including: ${failedCategories.slice(0, 3).join(', ')} and others`,
          }
        );
      }
    } catch (error: any) {
      console.error("Failed to delete categories:", error);
      toast.error("An unexpected error occurred during bulk deletion");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = createColumns(handleEditCategory, handleDeleteCategory);

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

  // Filter options for FilterSelect
  const gameTypeOptions: FilterOption[] = React.useMemo(() =>
    uniqueGameTypes.map(type => ({ value: type, label: type.charAt(0) + type.slice(1).toLowerCase() })),
    [uniqueGameTypes]
  );

  const genderOptions: FilterOption[] = React.useMemo(() =>
    uniqueGenderRestrictions.map(gender => ({ value: gender, label: gender.charAt(0) + gender.slice(1).toLowerCase() })),
    [uniqueGenderRestrictions]
  );

  const statusOptions: FilterOption[] = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  // Pagination state
  const currentPage = table.getState().pagination.pageIndex;
  const totalPages = table.getPageCount();

  return (
    <div className="space-y-4 px-4 lg:px-6">
      {/* Filter Bar */}
      <FilterBar
        onClearAll={clearFilters}
        showClearButton={hasActiveFilters}
      >
        <SearchInput
          value={globalFilter ?? ""}
          onChange={setGlobalFilter}
          placeholder="Search categories..."
          className="flex-1 min-w-[200px] max-w-sm"
        />
        <FilterSelect
          value={gameTypeFilter === "all" ? undefined : gameTypeFilter}
          onChange={(value) => setGameTypeFilter(value || "all")}
          options={gameTypeOptions}
          allLabel="All Game Types"
          triggerClassName="w-[150px]"
        />
        <FilterSelect
          value={genderRestrictionFilter === "all" ? undefined : genderRestrictionFilter}
          onChange={(value) => setGenderRestrictionFilter(value || "all")}
          options={genderOptions}
          allLabel="All Genders"
          triggerClassName="w-[140px]"
        />
        <FilterSelect
          value={statusFilter === "all" ? undefined : statusFilter}
          onChange={(value) => setStatusFilter(value || "all")}
          options={statusOptions}
          allLabel="All Status"
          triggerClassName="w-[130px]"
        />
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
          >
            <IconTrashX className="mr-2 size-4" />
            Delete ({table.getFilteredSelectedRowModel().rows.length})
          </Button>
        )}
      </FilterBar>

      {/* Header with count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{filteredData.length.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">
            {filteredData.length === 1 ? "category" : "categories"}
            {hasActiveFilters && ` (filtered from ${data.length})`}
          </span>
        </div>
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} selected
          </span>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-md" />
          ))}
        </div>
      ) : filteredData.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className="py-2.5 font-medium text-xs"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => handleEditCategory(row.original.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-16 rounded-md border bg-muted/10">
          <IconTags className="size-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Categories Found</h3>
          <p className="text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Try adjusting your filters."
              : "No categories have been created yet."}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <IconChevronLeft className="size-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <IconChevronRight className="size-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {selectedCategoryId && (
        <React.Suspense fallback={null}>
          <CategoryEditModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            categoryId={selectedCategoryId}
            onCategoryUpdated={handleCategoryUpdated}
          />
        </React.Suspense>
      )}

      {/* Single Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Category"
        description={
          categoryToDelete
            ? `Are you sure you want to delete "${categoryToDelete.name}"? This action cannot be undone and will permanently remove the category and all associated data.`
            : ""
        }
        confirmText="Delete Category"
        cancelText="Cancel"
        onConfirm={confirmDeleteCategory}
        isLoading={isDeleting}
        variant="destructive"
        icon={<IconTrash className="h-5 w-5 text-destructive" />}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmationModal
        open={bulkDeleteModalOpen}
        onOpenChange={setBulkDeleteModalOpen}
        title="Delete Multiple Categories"
        description={`Are you sure you want to delete ${table.getFilteredSelectedRowModel().rows.length} category(ies)? This action cannot be undone and will permanently remove all selected categories and their associated data.`}
        confirmText={`Delete ${table.getFilteredSelectedRowModel().rows.length} Categories`}
        cancelText="Cancel"
        onConfirm={confirmBulkDelete}
        isLoading={isDeleting}
        variant="destructive"
        icon={<IconTrashX className="h-5 w-5 text-destructive" />}
      />
    </div>
  );
}
