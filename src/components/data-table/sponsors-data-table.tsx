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
} from "@tanstack/react-table";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconCopy,
  IconBuilding,
  IconChevronDown,
  IconSearch,
  IconFilter,
  IconArchive,
  IconExternalLink,
  IconPlus,
} from "@tabler/icons-react";
import { toast } from "sonner";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import SponsorshipCreateModal from "@/components/modal/sponsorship-create-modal";

// Sponsor interface
interface Sponsor {
  id: string;
  name: string;
  description?: string;
  packageTier?: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  contractAmount?: number | string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

// Actions component that can use hooks
const SponsorActions = ({ sponsor, onEdit }: { sponsor: Sponsor; onEdit: (s: Sponsor) => void }) => {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <IconDotsVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onEdit(sponsor)}>
          <IconEdit className="mr-2 h-4 w-4" />
          Edit Sponsorship
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            navigator.clipboard.writeText(sponsor.id);
            toast.success("Sponsor ID copied to clipboard");
          }}
        >
          <IconCopy className="mr-2 h-4 w-4" />
          Copy Sponsor ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            toast.error("Delete functionality not implemented yet");
          }}
          className="text-destructive"
        >
          <IconTrash className="mr-2 h-4 w-4" />
          Delete Sponsor
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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

const getPackageTierColor = (tier: string) => {
  switch (tier?.toUpperCase()) {
    case 'PLATINUM':
      return 'bg-gradient-to-br from-gray-100 to-gray-300 text-gray-800 border-gray-300';
    case 'GOLD':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'SILVER':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'BRONZE':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-300';
  }
};

const columns: ColumnDef<Sponsor>[] = [
  {
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
  },
  {
    accessorKey: "name",
    header: "Sponsor Name",
    cell: ({ row }) => {
      const sponsor = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <IconBuilding className="size-4 text-primary" />
          </div>
          <div>
            <div className="font-semibold">{sponsor.name}</div>
            <div className="text-sm text-muted-foreground">
              ID: {sponsor.id}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "packageTier",
    header: "Package Tier",
    cell: ({ row }) => {
      const tier = row.original.packageTier;
      return tier ? (
        <Badge 
          variant={getPackageTierBadgeVariant(tier)} 
          className={`capitalize ${getPackageTierColor(tier)}`}
        >
          {String(tier).toLowerCase()}
        </Badge>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      );
    },
  },
  {
    accessorKey: "contractAmount",
    header: "Contract Amount",
    cell: ({ row }) => {
      const amt = row.original.contractAmount;
      return (
        <span className="text-sm">{amt ? `RM ${Number(amt).toLocaleString()}` : '-'}</span>
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
          <IconBuilding className="size-4 text-muted-foreground" />
          <span>{formatDate(createdAt)}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const sponsor = row.original;
      return <SponsorActions sponsor={sponsor} onEdit={(s) => table.options.meta?.onEdit?.(s)} />;
    },
  },
];

interface SponsorsDataTableProps {
  data: Sponsor[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function SponsorsDataTable({ data, isLoading = false, onRefresh }: SponsorsDataTableProps) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Sponsor | null>(null);
  const [editForm, setEditForm] = React.useState<{ sponsoredName: string; packageTier: string; contractAmount: string }>({ sponsoredName: "", packageTier: "BRONZE", contractAmount: "" });
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    meta: {
      onEdit: (s: Sponsor) => {
        console.log("Edit sponsor data:", s);
        console.log("Sponsor name (s.name):", s.name);
        setEditing(s);
        setEditForm({
          sponsoredName: s.name || "",
          packageTier: s.packageTier || "BRONZE",
          contractAmount: s.contractAmount ? String(s.contractAmount) : "",
        });
        setIsEditOpen(true);
      },
    },
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

  const handleBulkAction = (action: string) => {
    const selectedIds = selectedRows.map(row => row.original.id);
    switch (action) {
      case "archive":
        toast.info(`Archiving ${selectedIds.length} sponsors...`);
        break;
      case "delete":
        toast.error(`Delete ${selectedIds.length} sponsors requires confirmation`);
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
              placeholder="Search sponsors..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-8 max-w-sm"
            />
          </div>
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
              {["ACTIVE", "INACTIVE"].map((status) => (
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
        </div>
        <div className="flex items-center space-x-2">
          {selectedRows.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {selectedRows.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("archive")}
              >
                <IconArchive className="mr-2 h-4 w-4" />
                Archive
              </Button>
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
          <Button
            size="sm"
            className="ml-2"
            onClick={() => setIsCreateOpen(true)}
          >
            <IconPlus className="mr-2 h-4 w-4" />
            Add Sponsorship
          </Button>
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
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
                  className="h-24 text-center"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="size-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="ml-2">Loading sponsors...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <IconBuilding className="size-12 text-muted-foreground" />
                      <span>No sponsors found</span>
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
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
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
      <SponsorshipCreateModal open={isCreateOpen} onOpenChange={setIsCreateOpen} onCreated={onRefresh} />

      {/* Edit Sponsorship Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Sponsorship</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sponsor Name</Label>
              <Input value={editForm.sponsoredName} onChange={(e) => setEditForm(prev => ({ ...prev, sponsoredName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Package tier</Label>
              <Select value={editForm.packageTier} onValueChange={(v) => setEditForm(prev => ({ ...prev, packageTier: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRONZE">Bronze</SelectItem>
                  <SelectItem value="SILVER">Silver</SelectItem>
                  <SelectItem value="GOLD">Gold</SelectItem>
                  <SelectItem value="PLATINUM">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Contract amount (optional)</Label>
              <Input type="number" min="0" step="0.01" value={editForm.contractAmount} onChange={(e) => setEditForm(prev => ({ ...prev, contractAmount: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!editing) return;
              try {
                const payload = {
                  sponsoredName: editForm.sponsoredName || undefined,
                  packageTier: editForm.packageTier,
                  contractAmount: editForm.contractAmount ? Number(editForm.contractAmount) : undefined,
                };
                console.log("Updating sponsorship with payload:", payload);
                console.log("Edit form data:", editForm);
                await axiosInstance.put(endpoints.sponsors.update(editing.id), payload);
                toast.success("Sponsorship updated");
                setIsEditOpen(false);
                setEditing(null);
                onRefresh?.();
              } catch (err: any) {
                toast.error(err.response?.data?.message || "Failed to update sponsorship");
              }
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
