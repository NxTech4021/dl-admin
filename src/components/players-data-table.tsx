"use client"

import * as React from "react"
import {
  IconDotsVertical,
  IconMail,
  IconMapPin,
  IconCalendar,
  IconTrophy,
  IconEye,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react"
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

// Player schema based on the database structure and onboarding data
export const playerSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayUsername: z.string().nullable(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  area: z.string(), // Location from onboarding
  gender: z.enum(["male", "female"]).nullable(),
  dateOfBirth: z.date().nullable(),
  registeredDate: z.date(),
  lastLoginDate: z.date().nullable(),
  sports: z.array(z.enum(["pickleball", "tennis", "padel"])),
  skillRatings: z.record(z.string(), z.object({
    rating: z.number(),
    confidence: z.string(),
    rd: z.number(),
  })).nullable(),
  status: z.enum(["active", "inactive", "suspended"]),
  completedOnboarding: z.boolean(),
})

export type Player = z.infer<typeof playerSchema>

// Mock data for demonstration
const mockPlayers: Player[] = [
  {
    id: "player_1",
    name: "Ahmad Rahman",
    displayUsername: "ahmadrahman219",
    email: "ahmad.rahman@email.com",
    emailVerified: true,
    image: null,
    area: "Kuala Lumpur",
    gender: "male",
    dateOfBirth: new Date("1990-05-15"),
    registeredDate: new Date("2024-01-15"),
    lastLoginDate: new Date("2024-01-20"),
    sports: ["tennis", "pickleball"],
    skillRatings: {
      tennis: { rating: 4.2, confidence: "High", rd: 150 },
      pickleball: { rating: 3.8, confidence: "Medium", rd: 200 }
    },
    status: "active",
    completedOnboarding: true,
  },
  {
    id: "player_2",
    name: "Sarah Lim",
    displayUsername: "limSarah00",
    email: "sarah.lim@email.com",
    emailVerified: true,
    image: null,
    area: "Subang Jaya",
    gender: "female",
    dateOfBirth: new Date("1985-08-22"),
    registeredDate: new Date("2024-01-10"),
    lastLoginDate: new Date("2024-01-21"),
    sports: ["padel", "tennis"],
    skillRatings: {
      padel: { rating: 3.5, confidence: "High", rd: 120 },
      tennis: { rating: 4.0, confidence: "Medium", rd: 180 }
    },
    status: "active",
    completedOnboarding: true,
  },
  {
    id: "player_3",
    name: "Raj Patel",
    displayUsername: "rajpickleball",
    email: "raj.patel@email.com",
    emailVerified: false,
    image: null,
    area: "Petaling Jaya",
    gender: "male",
    dateOfBirth: new Date("1992-03-10"),
    registeredDate: new Date("2024-01-18"),
    lastLoginDate: null,
    sports: ["pickleball"],
    skillRatings: {
      pickleball: { rating: 2.8, confidence: "Low", rd: 300 }
    },
    status: "inactive",
    completedOnboarding: false,
  },
  {
    id: "player_4",
    name: "Michelle Tan",
    displayUsername: "michelleTan",
    email: "michelle.tan@email.com",
    emailVerified: true,
    image: null,
    area: "Mont Kiara",
    gender: "female",
    dateOfBirth: new Date("1988-11-30"),
    registeredDate: new Date("2024-01-12"),
    lastLoginDate: new Date("2024-01-19"),
    sports: ["tennis", "padel", "pickleball"],
    skillRatings: {
      tennis: { rating: 4.5, confidence: "High", rd: 100 },
      padel: { rating: 3.9, confidence: "High", rd: 130 },
      pickleball: { rating: 3.2, confidence: "Medium", rd: 220 }
    },
    status: "active",
    completedOnboarding: true,
  },
  {
    id: "player_5",
    name: "David Wong",
    displayUsername: "davidwong",
    email: "david.wong@email.com",
    emailVerified: true,
    image: null,
    area: "Bangsar",
    gender: "male",
    dateOfBirth: new Date("1995-07-08"),
    registeredDate: new Date("2024-01-22"),
    lastLoginDate: new Date("2024-01-22"),
    sports: ["tennis"],
    skillRatings: {
      tennis: { rating: 3.1, confidence: "Medium", rd: 250 }
    },
    status: "active",
    completedOnboarding: true,
  },
  {
    id: "player_6",
    name: "Priya Sharma",
    displayUsername: "priyaS",
    email: "priya.sharma@email.com",
    emailVerified: true,
    image: null,
    area: "Ampang",
    gender: "female",
    dateOfBirth: new Date("1991-12-05"),
    registeredDate: new Date("2024-01-08"),
    lastLoginDate: new Date("2024-01-20"),
    sports: ["pickleball", "padel"],
    skillRatings: {
      pickleball: { rating: 4.1, confidence: "High", rd: 140 },
      padel: { rating: 3.7, confidence: "Medium", rd: 190 }
    },
    status: "active",
    completedOnboarding: true,
  },
]

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const getStatusBadgeVariant = (status: Player["status"]) => {
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

const getSportsDisplay = (sports: Player["sports"]) => {
  return sports.map((sport) => (
    <Badge key={sport} variant="outline" className="text-xs capitalize">
      {sport}
    </Badge>
  ))
}

const getHighestRating = (skillRatings: Player["skillRatings"]) => {
  if (!skillRatings) return null
  
  const ratings = Object.values(skillRatings)
  if (ratings.length === 0) return null
  
  const highest = ratings.reduce((max, current) => 
    current.rating > max.rating ? current : max
  )
  
  return highest.rating.toFixed(1)
}

const columns: ColumnDef<Player>[] = [
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
    header: "Player",
    cell: ({ row }) => {
      const player = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarImage src={player.image || undefined} alt={player.name} />
            <AvatarFallback className="text-xs">
              {getInitials(player.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="font-medium">{player.name}</div>
            {player.displayUsername && (
              <div className="text-sm text-muted-foreground">
                @{player.displayUsername}
              </div>
            )}
          </div>
        </div>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const player = row.original
      return (
        <div className="flex items-center gap-2">
          <IconMail className="size-4 text-muted-foreground" />
          <span>{player.email}</span>
          {!player.emailVerified && (
            <Badge variant="destructive" className="text-xs">
              Unverified
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "area",
    header: "Area",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <IconMapPin className="size-4 text-muted-foreground" />
        <span>{row.original.area}</span>
      </div>
    ),
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => {
      const gender = row.original.gender
      return gender ? (
        <Badge variant="outline" className="capitalize">
          {gender}
        </Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    accessorKey: "sports",
    header: "Sports",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {getSportsDisplay(row.original.sports)}
      </div>
    ),
  },
  {
    accessorKey: "skillRating",
    header: "Top Rating",
    cell: ({ row }) => {
      const rating = getHighestRating(row.original.skillRatings)
      return rating ? (
        <div className="flex items-center gap-2">
          <IconTrophy className="size-4 text-muted-foreground" />
          <span className="font-medium">{rating}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    accessorKey: "registeredDate",
    header: "Registered",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <IconCalendar className="size-4 text-muted-foreground" />
        <span>{formatDate(row.original.registeredDate)}</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={getStatusBadgeVariant(row.original.status)} className="capitalize">
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const player = row.original
      
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
              Edit Player
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <IconTrash className="mr-2 size-4" />
              Delete Player
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function PlayersDataTable() {
  const [data, setData] = React.useState(() => mockPlayers)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

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
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search players by name, email, or area..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="w-80"
          />
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} player(s) selected
          </div>
        </div>
      </div>

      <div className="rounded-md border mx-4 lg:mx-6">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
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
                  No players found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} player(s)
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
