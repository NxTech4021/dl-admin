"use client";

import * as React from "react";

import {
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconTrash,
  IconFilter,
  IconX,
  IconChevronDown,
  IconChevronUp,
  IconUsers,
  IconCalendar,
  IconTrashX,
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

import axiosInstance from "@/lib/endpoints";
import { categorySchema, Category } from "@/constants/zod/category-schema";
import { endpoints } from "@/lib/endpoints";
import dynamic from "next/dynamic";
import { ConfirmationModal } from "@/components/modal/confirmation-modal";
import { toast } from "sonner";

const CategoryEditModal = dynamic(
  () =>
    import("@/components/modal/category-edit-modal").then((mod) => ({
      default: mod.default,
    })),
  {
    loading: () => <div className="h-96 animate-pulse bg-muted rounded-lg" />,
  }
);

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getGenderRestrictionBadgeVariant = (restriction: string) => {
  switch (restriction) {
    case "MALE":
      return "default";
    case "FEMALE":
      return "secondary";
    case "MIXED":
      return "outline";
    case "OPEN":
      return "destructive";
    default:
      return "outline";
  }
};

const getGameTypeBadgeVariant = (gameType: string | null) => {
  switch (gameType) {
    case "SINGLES":
      return "default";
    case "DOUBLES":
      return "secondary";
    default:
      return "outline";
  }
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
        <div className="font-medium">{category.name || "Unnamed Category"}</div>
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
        <Badge variant={getGenderRestrictionBadgeVariant(restriction)} className="capitalize">
          {restriction.toLowerCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "game_type",
    header: "Game Type",
    cell: ({ row }) => {
      const gameType = row.original.game_type;
      return gameType ? (
        <Badge variant={getGameTypeBadgeVariant(gameType)} className="capitalize">
          {gameType.toLowerCase()}
        </Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "matchFormat",
    header: "Match Format",
    cell: ({ row }) => {
      const format = row.original.matchFormat;
      return format ? (
        <span className="text-sm">{format}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
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
      <Badge variant={row.original.isActive ? "default" : "secondary"} className="capitalize">
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <IconCalendar className="size-4 text-muted-foreground" />
        <span className="text-sm">{formatDate(row.original.createdAt)}</span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original;

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
              onClick={() => {
                // TODO: Implement view category functionality
                console.log("View category:", category.id);
              }}
            >
              <IconEye className="mr-2 size-4" />
              View Details
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
              onClick={() => handleEditCategory(category.id)}
            >
              <IconEdit className="mr-2 size-4" />
              Edit Category
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer focus:bg-destructive focus:text-destructive-foreground"
              onClick={() => handleDeleteCategory(category.id)} // Remove the window.confirm here
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
      if (category.game_type) {
        gameTypesSet.add(category.game_type);
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
        (category) => category.game_type === gameTypeFilter
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

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="px-4 lg:px-6 space-y-4">
        {/* Search Bar and Filter Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search categories by name or match format..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="w-80"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`${hasActiveFilters ? "border-primary bg-primary/10" : ""}`}
            >
              <IconFilter className="size-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {(gameTypeFilter !== "all" ? 1 : 0) +
                    (genderRestrictionFilter !== "all" ? 1 : 0) +
                    (statusFilter !== "all" ? 1 : 0)}
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
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete} // Remove the window.confirm here
                className="mr-2"
              >
                <IconTrashX className="mr-2 size-4" />
                Delete Selected ({table.getFilteredSelectedRowModel().rows.length})
              </Button>
            )}
            <div className="text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} category(ies) selected
            </div>
          </div>
        </div>

        {/* Filter Controls - Collapsible */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/30 rounded-lg border animate-in slide-in-from-top-2 duration-200">
            {/* Game Type Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Game Type:</span>
              <Select value={gameTypeFilter} onValueChange={setGameTypeFilter}>
                <SelectTrigger
                  className={`w-[140px] ${gameTypeFilter !== "all" ? "border-primary" : ""}`}
                >
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueGameTypes.map((gameType) => (
                    <SelectItem key={gameType} value={gameType} className="capitalize">
                      {gameType.toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {gameTypeFilter !== "all" && (
                <Badge variant="secondary" className="text-xs capitalize">
                  {gameTypeFilter.toLowerCase()}
                </Badge>
              )}
            </div>

            {/* Gender Restriction Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Gender:</span>
              <Select value={genderRestrictionFilter} onValueChange={setGenderRestrictionFilter}>
                <SelectTrigger
                  className={`w-[140px] ${genderRestrictionFilter !== "all" ? "border-primary" : ""}`}
                >
                  <SelectValue placeholder="All Genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  {uniqueGenderRestrictions.map((restriction) => (
                    <SelectItem key={restriction} value={restriction} className="capitalize">
                      {restriction.toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {genderRestrictionFilter !== "all" && (
                <Badge variant="secondary" className="text-xs capitalize">
                  {genderRestrictionFilter.toLowerCase()}
                </Badge>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger
                  className={`w-[140px] ${statusFilter !== "all" ? "border-primary" : ""}`}
                >
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="text-xs capitalize">
                  {statusFilter}
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
                Showing {filteredData.length} of {data.length} categories
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
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                    Loading categories...
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                  No categories found.
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
          {table.getFilteredRowModel().rows.length} category(ies)
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

      {/* Edit Category Modal */}
      {selectedCategoryId && (
        <CategoryEditModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          categoryId={selectedCategoryId}
          onCategoryUpdated={handleCategoryUpdated}
        />
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
