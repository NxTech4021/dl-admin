"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { tableRowVariants, fastTransition } from "@/lib/animation-variants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconClock,
  IconAlertTriangle,
  IconReceipt,
} from "@tabler/icons-react";
import { PaymentRowActions } from "./payment-row-actions";
import type { PaymentRecord, PaginatedPayments } from "@/constants/zod/payment-schema";
import { getPaymentStatusBadge, getMembershipStatusBadge, getInitials, getAvatarColor } from "./payment-utils";
import { formatCurrency } from "@/lib/utils/format";

interface PaymentsDataTableProps {
  data: PaymentRecord[];
  pagination?: PaginatedPayments["pagination"];
  isLoading: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onPageChange: (page: number) => void;
  onViewDetail: (payment: PaymentRecord) => void;
  onUpdateStatus: (payment: PaymentRecord) => void;
}

// Mobile card view
function MobilePaymentCard({
  payment,
  isSelected,
  onSelect,
  onViewDetail,
  onUpdateStatus,
}: {
  payment: PaymentRecord;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onViewDetail: () => void;
  onUpdateStatus: () => void;
}) {
  return (
    <div
      className={`rounded-lg border bg-card p-4 space-y-3 ${
        isSelected ? "ring-2 ring-primary/50 bg-primary/5" : ""
      }`}
    >
      {/* Header with checkbox and player info */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            aria-label="Select payment"
          />
          <Avatar className="size-10 ring-2 ring-background">
            <AvatarImage src={payment.user?.image || undefined} />
            <AvatarFallback
              className={`text-white font-semibold text-xs ${getAvatarColor(
                payment.user?.name || "Unknown"
              )}`}
            >
              {getInitials(payment.user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">
              {payment.user?.name || "Unknown"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              @{payment.user?.username || "unknown"}
            </p>
          </div>
        </div>
        {getPaymentStatusBadge(payment.paymentStatus)}
      </div>

      {/* Season Info */}
      <div className="pt-2 border-t">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/seasons/$seasonId"
              params={{ seasonId: payment.seasonId }}
              className="text-sm font-medium text-primary underline decoration-dotted underline-offset-4 decoration-primary/50 hover:decoration-primary transition-colors"
            >
              {payment.season?.name || "Unknown Season"}
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Go to {payment.season?.name || "season"}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Details Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-0.5">{getMembershipStatusBadge(payment.status, "sm")}</div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="text-sm font-medium tabular-nums mt-0.5">
              {payment.season?.entryFee != null ? formatCurrency(payment.season.entryFee) : "N/A"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Joined</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {payment.joinedAt
              ? new Date(payment.joinedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "-"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t">
        <Button variant="ghost" size="sm" onClick={onViewDetail}>
          View Details
        </Button>
        <Button variant="outline" size="sm" onClick={onUpdateStatus}>
          Update Status
        </Button>
      </div>
    </div>
  );
}

export function PaymentsDataTable({
  data,
  pagination,
  isLoading,
  selectedIds,
  onSelectionChange,
  onPageChange,
  onViewDetail,
  onUpdateStatus,
}: PaymentsDataTableProps) {
  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  const handleSelectAll = React.useCallback(
    (checked: boolean) => {
      if (checked) {
        onSelectionChange(data.map((p) => p.id));
      } else {
        onSelectionChange([]);
      }
    },
    [data, onSelectionChange]
  );

  const handleSelectOne = React.useCallback(
    (id: string, checked: boolean) => {
      if (checked) {
        onSelectionChange([...selectedIds, id]);
      } else {
        onSelectionChange(selectedIds.filter((i) => i !== id));
      }
    },
    [selectedIds, onSelectionChange]
  );

  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.page ?? 1;

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Desktop skeleton */}
        <div className="hidden md:block">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead className="w-[60px]">#</TableHead>
                  <TableHead className="w-[250px]">Player</TableHead>
                  <TableHead className="w-[180px]">Season</TableHead>
                  <TableHead className="w-[100px]">Entry Fee</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[100px]">Membership</TableHead>
                  <TableHead className="w-[100px]">Joined</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-9 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-14" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile skeleton */}
        <div className="md:hidden space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-32" />
              <div className="flex justify-between">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/20 py-16">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <IconReceipt className="size-8 opacity-50" />
          </div>
          <div className="space-y-2 text-center">
            <p className="text-lg font-medium">No payments found</p>
            <p className="text-sm">
              Try adjusting your filters or check back later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[40px] pl-4">
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el) {
                      (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate =
                        someSelected;
                    }
                  }}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-[60px]">#</TableHead>
              <TableHead className="w-[250px]">Player</TableHead>
              <TableHead className="w-[180px]">Season</TableHead>
              <TableHead className="w-[100px]">Entry Fee</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[100px]">Membership</TableHead>
              <TableHead className="w-[100px]">Joined</TableHead>
              <TableHead className="w-[60px] pr-4"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
            {data.map((payment, index) => {
              const isSelected = selectedIds.includes(payment.id);
              const rowNumber = ((currentPage - 1) * (pagination?.limit ?? 20)) + index + 1;

              return (
                <motion.tr
                  key={payment.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={fastTransition}
                  layout
                  className={`border-b transition-colors ${isSelected ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/30"}`}
                >
                  <TableCell className="pl-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        handleSelectOne(payment.id, checked as boolean)
                      }
                      aria-label={`Select ${payment.user?.name}`}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {rowNumber}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 ring-2 ring-background">
                        <AvatarImage src={payment.user?.image || undefined} />
                        <AvatarFallback
                          className={`text-white font-semibold text-xs ${getAvatarColor(
                            payment.user?.name || "Unknown"
                          )}`}
                        >
                          {getInitials(payment.user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <Link
                          to="/players/$playerId"
                          params={{ playerId: payment.userId }}
                          className="font-medium text-sm hover:text-primary transition-colors truncate block"
                        >
                          {payment.user?.name || "Unknown"}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate">
                          @{payment.user?.username || "unknown"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to="/seasons/$seasonId"
                          params={{ seasonId: payment.seasonId }}
                          className="text-sm font-medium underline decoration-dotted underline-offset-4 decoration-muted-foreground/50 hover:text-primary hover:decoration-primary transition-colors"
                        >
                          {payment.season?.name || "Unknown"}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Go to {payment.season?.name || "season"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="font-medium tabular-nums">
                    {payment.season?.entryFee != null ? formatCurrency(payment.season.entryFee) : "N/A"}
                  </TableCell>
                  <TableCell>{getPaymentStatusBadge(payment.paymentStatus)}</TableCell>
                  <TableCell>{getMembershipStatusBadge(payment.status, "sm")}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {payment.joinedAt
                      ? new Date(payment.joinedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "-"}
                  </TableCell>
                  <TableCell className="pr-4">
                    <PaymentRowActions
                      payment={payment}
                      onViewDetail={() => onViewDetail(payment)}
                      onUpdateStatus={() => onUpdateStatus(payment)}
                    />
                  </TableCell>
                </motion.tr>
              );
            })}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {data.map((payment) => (
          <MobilePaymentCard
            key={payment.id}
            payment={payment}
            isSelected={selectedIds.includes(payment.id)}
            onSelect={(checked) => handleSelectOne(payment.id, checked)}
            onViewDetail={() => onViewDetail(payment)}
            onUpdateStatus={() => onUpdateStatus(payment)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * (pagination?.limit ?? 20)) + 1} to{" "}
            {Math.min(currentPage * (pagination?.limit ?? 20), pagination?.total ?? 0)} of{" "}
            {pagination?.total ?? 0} payments
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
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
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <IconChevronRight className="size-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
