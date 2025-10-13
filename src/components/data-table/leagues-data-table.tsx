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
  IconEye,
  IconEdit,
  IconTrash,
  IconCopy,
  IconUsers,
  IconMapPin,
  IconCalendar,
  IconTrophy,
  IconSettings,
  IconChevronDown,
  IconSearch,
  IconFilter,
  IconDownload,
  IconPlus,
  IconArchive,
  IconTarget,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { League } from "@/ZodSchema/league-schema";
import axiosInstance, { endpoints } from "@/lib/endpoints";



const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return "N/A";
  const dateObject = date instanceof Date ? date : new Date(date);
  return dateObject.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "ACTIVE":
    case "ONGOING":
      return "default";
    case "UPCOMING":
      return "secondary";
    case "FINISHED":
      return "outline";
    case "INACTIVE":
      return "outline";
    case "CANCELLED":
    case "SUSPENDED":
      return "destructive";
    default:
      return "outline";
  }
};

const getSportLabel = (sport: string) => {
  const sportLabels: Record<string, string> = {
    TENNIS: "Tennis",
    PICKLEBALL: "Pickleball",
    PADDLE: "Padel",
  };
  return sportLabels[sport] || sport;
};

const getRegistrationTypeLabel = (type: string) => {
  const typeLabels: Record<string, string> = {
    OPEN: "Open",
    INVITE_ONLY: "Invite Only",
    MANUAL: "Manual",
  };
  return typeLabels[type] || type;
};

const getGameTypeLabel = (type: string) => {
  const typeLabels: Record<string, string> = {
    SINGLES: "Singles",
    DOUBLES: "Doubles",
  };
  return typeLabels[type] || type;
};

const columns: ColumnDef<League>[] = [
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
    header: "League Name",
    cell: ({ row }) => {
      const league = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <IconTrophy className="size-4 text-primary" />
          </div>
          <div>
            <div className="font-semibold">{league.name}</div>
            <div className="text-sm text-muted-foreground">
              ID: {league.id}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "sportType",
    header: "Sport",
    cell: ({ row }) => {
      const sport = row.original.sportType;
      return (
        <Badge variant="outline" className="capitalize">
          {getSportLabel(sport)}
        </Badge>
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
          <span>{location || "Not specified"}</span>
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
          {status.toLowerCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "registrationType",
    header: "Registration",
    cell: ({ row }) => {
      const type = row.original.joinType ?? "OPEN";
      return (
        <Badge variant="outline" className="capitalize">
          {getRegistrationTypeLabel(type)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "gameType",
    header: "Game Type",
    cell: ({ row }) => {
      const type = row.original.gameType;
      return (
        <div className="flex items-center gap-2">
          <IconPlayerPlay className="size-4 text-muted-foreground" />
          <span>{getGameTypeLabel(type)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "memberCount",
    header: "Members",
    cell: ({ row }) => {
      const memberCount = row.original.memberCount || 0;
      return (
        <div className="flex items-center gap-2">
          <IconUsers className="size-4 text-muted-foreground" />
          <span>{memberCount}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "seasonCount",
    header: "Seasons",
    cell: ({ row }) => {
      const seasonCount = row.original.seasonCount || 0;
      return (
        <div className="flex items-center gap-2">
          <IconCalendar className="size-4 text-muted-foreground" />
          <span>{seasonCount}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "categoryCount",
    header: "Categories",
    cell: ({ row }) => {
      const categoryCount = row.original.categoryCount || 0;
      return (
        <div className="flex items-center gap-2">
          <IconTarget className="size-4 text-muted-foreground" />
          <span>{categoryCount}</span>
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
          <span>{formatDate(createdAt)}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const league = row.original;
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
            <DropdownMenuItem
              onClick={() => router.push(`/league/view/${league.id}`)}
            >
              <IconEye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/league/edit/${league.id}`)}
            >
              <IconEdit className="mr-2 h-4 w-4" />
              Edit League
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/league/settings?leagueId=${league.id}`)}
            >
              <IconSettings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push(`/seasons?leagueId=${league.id}`)}
            >
              <IconCalendar className="mr-2 h-4 w-4" />
              Manage Seasons
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/league/members/${league.id}`)}
            >
              <IconUsers className="mr-2 h-4 w-4" />
              Manage Members
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(league.id);
                toast.success("League ID copied to clipboard");
              }}
            >
              <IconCopy className="mr-2 h-4 w-4" />
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                // TODO: Implement archive functionality
                toast.info("Archive functionality coming soon");
              }}
            >
              <IconArchive className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                // TODO: Implement delete functionality
                toast.error("Delete functionality requires confirmation");
              }}
              className="text-red-600"
            >
              <IconTrash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface LeaguesDataTableProps {
  data: League[];
  isLoading?: boolean;
}

export function LeaguesDataTable({ data, isLoading = false }: LeaguesDataTableProps) {
  const router = useRouter();
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");


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

  const handleBulkAction = (action: string) => {
    const selectedIds = selectedRows.map(row => row.original.id);
    switch (action) {
      case "archive":
        toast.info(`Archiving ${selectedIds.length} leagues...`);
        break;
      case "delete":
        toast.error(`Delete ${selectedIds.length} leagues requires confirmation`);
        break;
      case "export":
        toast.success(`Exporting ${selectedIds.length} leagues...`);
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
              placeholder="Search leagues..."
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
              {["ACTIVE", "UPCOMING", "ONGOING", "FINISHED", "INACTIVE", "CANCELLED", "SUSPENDED"].map((status) => (
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
                onClick={() => handleBulkAction("export")}
              >
                <IconDownload className="mr-2 h-4 w-4" />
                Export
              </Button>
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
                      <span className="ml-2">Loading leagues...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <IconTrophy className="size-12 text-muted-foreground" />
                      <span>No leagues found</span>
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
    </div>
  );
}
