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
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

// League type definition
interface League {
  id: string;
  name: string;
  sport: string;
  location: string;
  status: "draft" | "registration" | "active" | "completed" | "cancelled" | "archived";
  playerCount: number;
  maxPlayers: number;
  registrationDeadline: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  createdBy: string;
  divisions: number;
  pendingRequests: number;
}

// Mock data
const mockLeagues: League[] = [
  {
    id: "1",
    name: "KL Tennis Championship",
    sport: "tennis",
    location: "Kuala Lumpur",
    status: "active",
    playerCount: 24,
    maxPlayers: 32,
    registrationDeadline: "2024-01-15",
    startDate: "2024-01-20",
    endDate: "2024-03-20",
    createdAt: "2024-01-01",
    createdBy: "Admin User",
    divisions: 3,
    pendingRequests: 5,
  },
  {
    id: "2",
    name: "PJ Pickleball League",
    sport: "pickleball",
    location: "Petaling Jaya",
    status: "registration",
    playerCount: 16,
    maxPlayers: 24,
    registrationDeadline: "2024-02-01",
    startDate: "2024-02-05",
    endDate: "2024-04-05",
    createdAt: "2024-01-10",
    createdBy: "Admin User",
    divisions: 2,
    pendingRequests: 12,
  },
  {
    id: "3",
    name: "Shah Alam Padel Tournament",
    sport: "padel",
    location: "Shah Alam",
    status: "draft",
    playerCount: 0,
    maxPlayers: 16,
    registrationDeadline: "2024-02-15",
    startDate: "2024-02-20",
    endDate: "2024-04-20",
    createdAt: "2024-01-15",
    createdBy: "Admin User",
    divisions: 1,
    pendingRequests: 0,
  },
  {
    id: "4",
    name: "Cyberjaya Tennis Open",
    sport: "tennis",
    location: "Cyberjaya",
    status: "completed",
    playerCount: 28,
    maxPlayers: 32,
    registrationDeadline: "2023-11-15",
    startDate: "2023-12-01",
    endDate: "2024-01-01",
    createdAt: "2023-11-01",
    createdBy: "Admin User",
    divisions: 4,
    pendingRequests: 0,
  },
];

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "active":
      return "default";
    case "registration":
      return "secondary";
    case "completed":
      return "outline";
    case "draft":
      return "outline";
    case "cancelled":
      return "destructive";
    case "archived":
      return "secondary";
    default:
      return "outline";
  }
};

const getSportLabel = (sport: string) => {
  const sportLabels: Record<string, string> = {
    tennis: "Tennis",
    pickleball: "Pickleball",
    padel: "Padel",
  };
  return sportLabels[sport] || sport;
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
    accessorKey: "sport",
    header: "Sport",
    cell: ({ row }) => {
      const sport = row.original.sport;
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
          <span>{location}</span>
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
    accessorKey: "playerCount",
    header: "Players",
    cell: ({ row }) => {
      const league = row.original;
      const percentage = (league.playerCount / league.maxPlayers) * 100;
      return (
        <div className="flex items-center gap-2">
          <IconUsers className="size-4 text-muted-foreground" />
          <span>
            {league.playerCount}/{league.maxPlayers}
          </span>
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "pendingRequests",
    header: "Pending Requests",
    cell: ({ row }) => {
      const pendingRequests = row.original.pendingRequests;
      return (
        <div className="flex items-center gap-2">
          {pendingRequests > 0 ? (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {pendingRequests} pending
            </Badge>
          ) : (
            <span className="text-muted-foreground">None</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "registrationDeadline",
    header: "Registration Deadline",
    cell: ({ row }) => {
      const deadline = row.original.registrationDeadline;
      const isOverdue = new Date(deadline) < new Date();
      return (
        <div className="flex items-center gap-2">
          <IconCalendar className="size-4 text-muted-foreground" />
          <span className={isOverdue ? "text-red-500" : ""}>
            {formatDate(deadline)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => {
      const league = row.original;
      return (
        <div className="text-sm">
          <div>{formatDate(league.startDate)}</div>
          <div className="text-muted-foreground">to {formatDate(league.endDate)}</div>
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
              onClick={() => router.push(`/league/requests/${league.id}`)}
            >
              <IconUsers className="mr-2 h-4 w-4" />
              Join Requests
              {league.pendingRequests > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {league.pendingRequests}
                </Badge>
              )}
            </DropdownMenuItem>
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

export function LeaguesDataTable() {
  const router = useRouter();
  const [data, setData] = React.useState<League[]>(mockLeagues);
  const [isLoading, setIsLoading] = React.useState(false);
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
              {["draft", "registration", "active", "completed", "cancelled"].map((status) => (
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
                  {status}
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
          <Button onClick={() => router.push("/league")}>
            <IconPlus className="mr-2 h-4 w-4" />
            Create League
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
