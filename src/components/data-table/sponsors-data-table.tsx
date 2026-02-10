

import * as React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
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
  getFacetedRowModel,
  getFacetedUniqueValues,
} from "@tanstack/react-table";
import { tableContainerVariants, tableRowVariants, fastTransition } from "@/lib/animation-variants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconTrash,
  IconFilter,
  IconX,
  IconChevronDown,
  IconChevronUp,
  IconCalendar,
  IconTrophy,
} from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { toast } from "sonner";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { sponsorSchema, Sponsor } from "@/constants/zod/sponsor-schema";
import { logger } from "@/lib/logger";

const SponsorEditModal = React.lazy(() => import("@/components/modal/sponsor-edit-modal").then((mod) => ({ default: mod.SponsorEditModal })));

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return "N/A";
  const dateObject = date instanceof Date ? date : new Date(date);
  return dateObject.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (amount: number | null) => {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(amount);
};

const getPackageTierBadgeVariant = (tier: string) => {
  switch (tier?.toUpperCase()) {
    case 'PLATINUM':
      return 'default';
    case 'GOLD':
      return 'secondary';
    case 'SILVER':
      return 'outline';
    case 'BRONZE':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getLeagueDisplay = (sponsor: Sponsor): React.ReactNode => {
  if (!sponsor.league) {
    return <span className="text-muted-foreground text-xs">No league</span>;
  }

  return (
    <HoverCard>
      <HoverCardTrigger>
        <Badge variant="secondary" className="cursor-pointer">
          {sponsor.league.name}
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Linked League</h4>
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              {sponsor.league.name}
            </Badge>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const createColumns = (
  handleEditSponsor: (sponsorId: string) => void
): ColumnDef<Sponsor>[] => [
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
    accessorKey: "sponsoredName",
    header: "Sponsor Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.sponsoredName || "Unnamed Sponsor"}</div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "packageTier",
    header: "Package Tier",
    cell: ({ row }) => {
      const tier = row.original.packageTier;
      return (
        <Badge variant={getPackageTierBadgeVariant(tier)} className="capitalize">
          {tier.toLowerCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "contractAmount",
    header: "Contract Amount",
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {formatCurrency(row.original.contractAmount)}
      </span>
    ),
  },
  {
    accessorKey: "sponsorRevenue",
    header: "Sponsor Revenue",
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {formatCurrency(row.original.sponsorRevenue)}
      </span>
    ),
  },
  {
    accessorKey: "league",
    header: "League",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {getLeagueDisplay(row.original)}
      </div>
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
      const sponsor = row.original;

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
                // TODO: Implement view sponsor functionality
                logger.debug("View sponsor:", sponsor.id);
              }}
            >
              <IconEye className="mr-2 size-4" />
              View Details
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
              onClick={() => handleEditSponsor(sponsor.id)}
            >
              <IconEdit className="mr-2 size-4" />
              Edit Sponsor
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer focus:bg-destructive focus:text-destructive-foreground"
              onClick={() => {
                // TODO: Implement delete sponsor functionality
                logger.debug("Delete sponsor:", sponsor.id);
              }}
            >
              <IconTrash className="mr-2 size-4" />
              Delete Sponsor
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface SponsorsDataTableProps {
  refreshTrigger?: number;
  searchQuery?: string;
}

export function SponsorsDataTable({ refreshTrigger, searchQuery = "" }: SponsorsDataTableProps) {
  const [data, setData] = React.useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedSponsorId, setSelectedSponsorId] = React.useState<string>("");

  // Filter states
  const [packageTierFilter, setPackageTierFilter] = React.useState<string>("all");
  const [showFilters, setShowFilters] = React.useState<boolean>(false);

  // Get unique values for filter options
  const uniquePackageTiers = React.useMemo(() => {
    const tiersSet = new Set<string>();
    data.forEach((sponsor) => {
      tiersSet.add(sponsor.packageTier);
    });
    return Array.from(tiersSet).sort();
  }, [data]);

  // Filter data based on selected filters
  const filteredData = React.useMemo(() => {
    let filtered = data;

    // Apply package tier filter
    if (packageTierFilter !== "all") {
      filtered = filtered.filter(
        (sponsor) => sponsor.packageTier === packageTierFilter
      );
    }

    return filtered;
  }, [data, packageTierFilter]);

  // Clear all filters
  const clearFilters = () => {
    setPackageTierFilter("all");
  };

  // Check if any filters are active
  const hasActiveFilters =
    packageTierFilter !== "all" ||
    searchQuery !== "";

  React.useEffect(() => {
    const fetchSponsors = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(endpoints.sponsors.getAll);
        if (response.status !== 200) {
          throw new Error("Network response was not ok");
        }
        const result = await response.data;
        logger.debug("Sponsors API response:", result);
        logger.debug("Sponsors data:", result.data);
        
        // Handle potential Decimal conversion
        const processedData = result.data.map((sponsor: Record<string, unknown>) => ({
          ...sponsor,
          contractAmount: sponsor.contractAmount ? parseFloat(String(sponsor.contractAmount)) : null,
          sponsorRevenue: sponsor.sponsorRevenue ? parseFloat(String(sponsor.sponsorRevenue)) : null,
        }));
        
        const parsedData = sponsorSchema.array().parse(processedData);
        setData(parsedData);
      } catch (error) {
        logger.error("Failed to fetch sponsors:", error);
        logger.error("Error details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSponsors();
  }, [refreshTrigger]);

  const handleEditSponsor = (sponsorId: string) => {
    setSelectedSponsorId(sponsorId);
    setEditModalOpen(true);
  };

  const handleSponsorUpdated = async () => {
    // Refresh the data
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(endpoints.sponsors.getAll);
      if (response.status === 200) {
        const result = await response.data;
        logger.debug("Sponsors refresh response:", result);
        
        // Handle potential Decimal conversion
        const processedData = result.data.map((sponsor: Record<string, unknown>) => ({
          ...sponsor,
          contractAmount: sponsor.contractAmount ? parseFloat(String(sponsor.contractAmount)) : null,
          sponsorRevenue: sponsor.sponsorRevenue ? parseFloat(String(sponsor.sponsorRevenue)) : null,
        }));
        
        const parsedData = sponsorSchema.array().parse(processedData);
        setData(parsedData);
      }
    } catch (error) {
      logger.error("Failed to refresh sponsors:", error);
      logger.error("Error details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = createColumns(handleEditSponsor);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter: searchQuery,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
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
      {/* Table Container */}
      <div className="rounded-md border bg-background">
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

          <motion.tbody
              key={`${searchQuery}-${packageTierFilter}-${table.getState().pagination.pageIndex}`}
              initial="hidden"
              animate="visible"
              variants={tableContainerVariants}
            >
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Loading sponsors...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <motion.tr
                  key={row.id}
                  variants={tableRowVariants}
                  transition={fastTransition}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 border-b transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No sponsors found.
                </TableCell>
              </TableRow>
            )}
          </motion.tbody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} sponsor(s)
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

      {/* Edit Sponsor Modal */}
      {selectedSponsorId && (
        <React.Suspense fallback={null}>
          <SponsorEditModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            sponsorId={selectedSponsorId}
            onSponsorUpdated={handleSponsorUpdated}
          />
        </React.Suspense>
      )}
    </div>
  );
}
