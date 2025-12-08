"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconDotsVertical,
  IconMail,
  IconEye,
  IconEdit,
  IconUserCheck,
  IconUserX,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { toast } from "sonner";
import { Admin } from "@/constants/zod/admin-schema";
import { StatusBadge } from "../ui/status-badge";

type AdminsDataTableProps = {
  data: Admin[];
};


const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const handleResendInvite = async (adminId: string) => {
  try {
    const res = await axiosInstance.post(endpoints.admin.sendInvite, {
      adminId,
    });
    toast.success(res.data.message || "Invite resent successfully!");
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Failed to resend invite");
  }
};

const columns: ColumnDef<Admin>[] = [
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
    header: "Admin",
    cell: ({ row }) => {
      const admin = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarImage src={admin.image || undefined} alt={admin.name} />
            <AvatarFallback className="text-xs">
              {getInitials(admin.name)}
            </AvatarFallback>
          </Avatar>
          <div className="font-medium">{admin.name}</div>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const admin = row.original;
      return (
        <div className="flex items-center gap-2">
          <IconMail className="size-4 text-muted-foreground" />
          <span>{admin.email}</span>
          {/* {!admin.emailVerified && (
            <Badge variant="destructive" className="text-xs">
              Unverified
            </Badge>
          )} */}
        </div>
      );
    },
  },
  {
  accessorKey: "status",
  header: "Status",
  cell: ({ row }) => {
    const status = row.original.status;
    return <StatusBadge entity="ADMIN" status={status} />;
  },
},
  {
    id: "actions",
    cell: ({ row }) => {
      const admin = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted hover:bg-muted text-muted-foreground hover:text-foreground flex size-8 transition-colors"
              size="icon"
            >
              <IconDotsVertical className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            {admin.status === "PENDING" ? (
              <DropdownMenuItem
                onClick={() => handleResendInvite(admin.id)}
                className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
              >
                <IconMail className="mr-2 size-4" />
                Resend Invite
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/admin/view/profile/${admin.id}`}
                    className="flex items-center w-full cursor-pointer focus:bg-accent focus:text-accent-foreground"
                  >
                    <IconEye className="mr-2 size-4" />
                    View Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    // TODO: Implement edit admin functionality
                    toast.info("Edit admin functionality coming soon");
                  }}
                  className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
                >
                  <IconEdit className="mr-2 size-4" />
                  Edit Admin
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => {
                    // TODO: Implement suspend/activate functionality
                    const action =
                      admin.status === "ACTIVE" ? "suspend" : "activate";
                    toast.info(`${action} admin functionality coming soon`);
                  }}
                  className={`cursor-pointer focus:bg-accent focus:text-accent-foreground ${
                    admin.status === "ACTIVE"
                      ? "text-orange-600 hover:text-orange-700"
                      : "text-green-600 hover:text-green-700"
                  }`}
                >
                  {admin.status === "ACTIVE" ? (
                    <IconUserX className="mr-2 size-4" />
                  ) : (
                    <IconUserCheck className="mr-2 size-4" />
                  )}
                  {admin.status === "ACTIVE"
                    ? "Suspend Admin"
                    : "Activate Admin"}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function AdminsDataTable({ data }: AdminsDataTableProps) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

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
  });

  // if (loading) {
  //   return <div className="p-4 text-center text-muted-foreground">Loading data...</div>
  // }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Input
          placeholder="Search admins by name or email..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="w-80"
        />
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} admin(s) selected
        </div>
      </div>

      <div className="rounded-md border mx-4 lg:mx-6">
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
                  No admins found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} admin(s)
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
