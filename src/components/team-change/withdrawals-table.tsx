import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconCheck,
  IconX,
  IconEye,
  IconUserMinus,
} from "@tabler/icons-react";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  AnimatedEmptyState,
} from "@/components/ui/animated-container";
import {
  tableContainerVariants,
  tableRowVariants,
  fastTransition,
} from "@/lib/animation-variants";
import type { WithdrawalRequestAdmin } from "@/constants/zod/partnership-admin-schema";
import {
  getWithdrawalStatusLabel,
  getWithdrawalStatusColor,
} from "@/constants/zod/partnership-admin-schema";
import { PartnershipAvatars } from "./partnership-avatars";
import { Pagination } from "./pagination";
import { formatDateTime, getInitials, getAvatarColor } from "./utils";

export interface WithdrawalsTableProps {
  isLoading: boolean;
  paginatedWithdrawals: WithdrawalRequestAdmin[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  searchQuery: string;
  selectedStatus: string | undefined;
  onPageChange: (page: number) => void;
  onProcess: (request: WithdrawalRequestAdmin, action: "APPROVED" | "REJECTED") => void;
  onViewDetails: (request: WithdrawalRequestAdmin) => void;
}

export function WithdrawalsTable({
  isLoading,
  paginatedWithdrawals,
  currentPage,
  pageSize,
  totalPages,
  totalItems,
  searchQuery,
  selectedStatus,
  onPageChange,
  onProcess,
  onViewDetails,
}: WithdrawalsTableProps) {
  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (paginatedWithdrawals.length === 0) {
    return (
      <AnimatedEmptyState>
        <div className="text-center py-16">
          <IconUserMinus className="size-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Withdrawal Requests</h3>
          <p className="text-sm text-muted-foreground">
            There are no withdrawal requests matching your filters.
          </p>
        </div>
      </AnimatedEmptyState>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[40px] py-2.5 pl-4 font-medium text-xs">#</TableHead>
            <TableHead className="w-[180px] py-2.5 font-medium text-xs">Partnership</TableHead>
            <TableHead className="w-[140px] py-2.5 font-medium text-xs">Who Left</TableHead>
            <TableHead className="w-[200px] py-2.5 font-medium text-xs">Reason</TableHead>
            <TableHead className="w-[140px] py-2.5 font-medium text-xs">Season</TableHead>
            <TableHead className="w-[100px] py-2.5 font-medium text-xs">Status</TableHead>
            <TableHead className="w-[100px] py-2.5 font-medium text-xs">Requested</TableHead>
            <TableHead className="w-[100px] py-2.5 pr-4 font-medium text-xs text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <motion.tbody
          key={`withdrawals-${searchQuery}-${selectedStatus || ""}-${currentPage}`}
          initial="hidden"
          animate="visible"
          variants={tableContainerVariants}
        >
          {paginatedWithdrawals.map((request, index) => (
            <motion.tr
              key={request.id}
              variants={tableRowVariants}
              transition={fastTransition}
              className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
              onClick={() => onViewDetails(request)}
            >
              <TableCell className="pl-4 text-muted-foreground font-mono text-xs">
                {(currentPage - 1) * pageSize + index + 1}
              </TableCell>
              <TableCell>
                {request.partnership ? (
                  <div className="flex items-center gap-2">
                    <PartnershipAvatars
                      captain={request.partnership.captain || null}
                      partner={request.partnership.partner || null}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-sm truncate">
                        {request.partnership.captain?.name || "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        & {request.partnership.partner?.name || "Unknown"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Avatar className="size-7 ring-1 ring-background flex-shrink-0">
                      {request.user?.image && (
                        <AvatarImage src={request.user.image} alt={request.user?.name || ""} />
                      )}
                      <AvatarFallback className={cn("text-white text-[9px] font-semibold", getAvatarColor(request.user?.name))}>
                        {getInitials(request.user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-sm truncate">
                        {request.user?.name || "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        Singles
                      </span>
                    </div>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="size-6 ring-1 ring-background flex-shrink-0">
                    {request.user?.image && (
                      <AvatarImage src={request.user.image} alt={request.user?.name || ""} />
                    )}
                    <AvatarFallback className={cn("text-white text-[9px] font-semibold", getAvatarColor(request.user?.name))}>
                      {getInitials(request.user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {request.user?.name || "Unknown"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span
                  className="text-sm text-muted-foreground"
                  title={request.reason}
                >
                  {request.reason}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {request.season?.name || "\u2014"}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn("text-xs font-medium", getWithdrawalStatusColor(request.status))}
                >
                  {getWithdrawalStatusLabel(request.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDateTime(request.requestDate)}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center gap-1">
                  {request.status === "PENDING" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                        onClick={() => onProcess(request, "APPROVED")}
                        title="Approve"
                      >
                        <IconCheck className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-red-600 hover:text-red-700 hover:bg-red-100 cursor-pointer"
                        onClick={() => onProcess(request, "REJECTED")}
                        title="Reject"
                      >
                        <IconX className="size-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 cursor-pointer"
                    onClick={() => onViewDetails(request)}
                    title="View Details"
                  >
                    <IconEye className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </motion.tr>
          ))}
        </motion.tbody>
      </Table>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}
