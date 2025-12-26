"use client";

import * as React from "react";
import { Link } from "@tanstack/react-router";
import {
  IconDotsVertical,
  IconMail,
  IconEye,
  IconEdit,
  IconUserCheck,
  IconUserX,
  IconChevronLeft,
  IconChevronRight,
  IconShield,
  IconExternalLink,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchInput } from "@/components/ui/search-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { toast } from "sonner";
import { Admin } from "@/constants/zod/admin-schema";
import { cn } from "@/lib/utils";

const AdminDetailModal = React.lazy(() => import("@/components/modal/admin-detail-modal"));

type AdminsDataTableProps = {
  data: Admin[];
  isLoading?: boolean;
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

/** Get status badge styling with dark mode support */
const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case "ACTIVE":
      return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
    case "PENDING":
      return "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
    case "SUSPENDED":
      return "text-red-700 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800";
    case "INACTIVE":
      return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700";
    default:
      return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700";
  }
};

const formatStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

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

export function AdminsDataTable({ data, isLoading = false }: AdminsDataTableProps) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedAdmin, setSelectedAdmin] = React.useState<Admin | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 20;

  const handleRowClick = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsModalOpen(true);
  };

  // Filter data by search
  const filteredData = React.useMemo(() => {
    if (!globalFilter) return data;
    const search = globalFilter.toLowerCase();
    return data.filter(
      (admin) =>
        admin.name.toLowerCase().includes(search) ||
        admin.email.toLowerCase().includes(search)
    );
  }, [data, globalFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-4 px-4 lg:px-6">
      {/* Search and count */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <SearchInput
          value={globalFilter}
          onChange={(value) => {
            setGlobalFilter(value);
            setCurrentPage(1);
          }}
          placeholder="Search admins..."
          className="w-full sm:w-80"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{filteredData.length}</span>
          <span className="text-sm text-muted-foreground">
            {filteredData.length === 1 ? "admin" : "admins"}
          </span>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-md" />
          ))}
        </div>
      ) : paginatedData.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-14 py-2.5 pl-4 font-medium text-xs">#</TableHead>
                <TableHead className="min-w-[250px] py-2.5 font-medium text-xs">Admin</TableHead>
                <TableHead className="min-w-[250px] py-2.5 font-medium text-xs">Email</TableHead>
                <TableHead className="w-[120px] py-2.5 font-medium text-xs">Status</TableHead>
                <TableHead className="w-16 py-2.5 pr-4 font-medium text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((admin, index) => (
                <TableRow
                  key={admin.id}
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={() => handleRowClick(admin)}
                >
                  {/* Row Number */}
                  <TableCell className="py-3 pl-4 text-sm text-muted-foreground font-mono">
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>

                  {/* Admin Name & Avatar */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8 border border-border">
                        <AvatarImage src={admin.image || undefined} alt={admin.name} />
                        <AvatarFallback className="text-xs bg-muted">
                          {getInitials(admin.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{admin.name}</span>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IconMail className="size-4" />
                      <span className="text-sm">{admin.email}</span>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3">
                    <Badge
                      variant="outline"
                      className={cn("text-xs font-medium border", getStatusBadgeClass(admin.status))}
                    >
                      {formatStatus(admin.status)}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-3 pr-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IconDotsVertical className="size-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        {admin.status === "PENDING" ? (
                          <DropdownMenuItem onClick={() => handleResendInvite(admin.id)}>
                            <IconMail className="mr-2 size-4" />
                            Resend Invite
                          </DropdownMenuItem>
                        ) : (
                          <>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(admin);
                              }}
                            >
                              <IconEye className="mr-2 size-4" />
                              Quick View
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                              <Link
                                to="/admin/$adminId"
                                params={{ adminId: admin.id }}
                                className="flex items-center w-full"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <IconExternalLink className="mr-2 size-4" />
                                View Full Profile
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => {
                                toast.info("Edit admin functionality coming soon");
                              }}
                            >
                              <IconEdit className="mr-2 size-4" />
                              Edit Admin
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => {
                                const action =
                                  admin.status === "ACTIVE" ? "suspend" : "activate";
                                toast.info(`${action} admin functionality coming soon`);
                              }}
                              className={
                                admin.status === "ACTIVE"
                                  ? "text-orange-600 focus:text-orange-600"
                                  : "text-emerald-600 focus:text-emerald-600"
                              }
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-16 rounded-md border bg-muted/10">
          <IconShield className="size-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Admins Found</h3>
          <p className="text-sm text-muted-foreground">
            {globalFilter
              ? "Try adjusting your search."
              : "No admins have been added yet."}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <IconChevronLeft className="size-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <IconChevronRight className="size-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Admin Detail Modal */}
      <React.Suspense fallback={null}>
        <AdminDetailModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          admin={selectedAdmin}
        />
      </React.Suspense>
    </div>
  );
}
