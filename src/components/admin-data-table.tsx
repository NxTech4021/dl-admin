"use client"

import * as React from "react"
import axios from "axios"
import {
  IconDotsVertical,
  IconMail,
  IconEye,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react"
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
} from "@tanstack/react-table"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Admin schema
export const adminSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),     // only for registered
  role: z.string().optional(),     // only for registered
  status: z.string().optional(),   // only for pending
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  type: z.enum(["ACTIVE", "PENDING", "SUSPENDED"]), 
})


type AdminsDataTableProps = {
  data: Admin[];
};

export type Admin = z.infer<typeof adminSchema>

// Mock data
// const mockAdmins: Admin[] = [
//   {
//     id: "admin_1",
//     name: "Alice Johnson",
//     email: "alice.johnson@deuceleague.com",
//     emailVerified: true,
//     image: null,
//     status: "active",
//     roles: ["admin"],
//   },
//   {
//     id: "admin_2",
//     name: "Brian Lee",
//     email: "brian.lee@deuceleague.com",
//     emailVerified: false,
//     image: null,
//     status: "pending",
//     roles: ["admin"],
//   },
//   {
//     id: "admin_3",
//     name: "Carla Smith",
//     email: "carla.smith@deuceleague.com",
//     emailVerified: true,
//     image: null,
//     status: "pending",
//     roles: ["admin"],
//   },
//     {
//     id: "admin_4",
//     name: "Johnson",
//     email: "johnson@deuceleague.com",
//     emailVerified: true,
//     image: null,
//     status: "active",
//     roles: ["admin"],
//   },
//   {
//     id: "admin_5",
//     name: "Brian Adams",
//     email: "brian.adams@deuceleague.com",
//     emailVerified: false,
//     image: null,
//     status: "pending",
//     roles: ["admin"],
//   },
//   {
//     id: "admin_6",
//     name: "James Smith",
//     email: "james.smith@deuceleague.com",
//     emailVerified: true,
//     image: null,
//     status: "pending",
//     roles: ["admin"],
//   },
// ]

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

const getStatusBadgeVariant = (status: Admin["status"]) => {
  switch (status) {
    case "active":
      return "default"
    case "inactive":
      return "secondary"
    case "suspended":
      return "destructive"
    default:
      return "secondary"
  }
}

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
      const admin = row.original
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
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const admin = row.original
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
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={getStatusBadgeVariant(row.original.status)}
        className="capitalize"
      >
        {row.original.status}
      </Badge>
    ),
  },
{
  accessorKey: "role",
  header: "Role",
  cell: ({ row }) => {
    const role = row.original.role 
    return role ? (
      <Badge variant="outline" className="capitalize text-xs">
        {role.toLowerCase()} {/* or just {role} if you don’t want lowercase */}
      </Badge>
    ) : (
      <span className="text-muted-foreground text-xs italic">Pending</span>
    )
  },
},
  {
    id: "actions",
    cell: ({ row }) => {
      const admin = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem>
              <IconEye className="mr-2 size-4" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <IconEdit className="mr-2 size-4" />
              Edit Admin
            </DropdownMenuItem>
            {/* <DropdownMenuSeparator /> */}
            {/* <DropdownMenuItem variant="destructive">
              <IconTrash className="mr-2 size-4" />
              Delete Admin
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function AdminsDataTable({ data }: AdminsDataTableProps) {
  // const [data, setData] = React.useState(() => mockAdmins)
  const [adminData, setAdminData] = React.useState<Admin[]>(data);
  // const [loading, setLoading] = React.useState(true)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

  const table = useReactTable({
    data: adminData, 
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
  })

  
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
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
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
  )
}
