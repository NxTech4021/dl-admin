import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconEye,
  IconHistory,
  IconUserPlus,
} from "@tabler/icons-react";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  AnimatedEmptyState,
} from "@/components/ui/animated-container";
import {
  tableContainerVariants,
  tableRowVariants,
  fastTransition,
} from "@/lib/animation-variants";
import type { DissolvedPartnership, PartnershipStatus } from "@/constants/zod/partnership-admin-schema";
import {
  getPartnershipStatusLabel,
  getPartnershipStatusColor,
} from "@/constants/zod/partnership-admin-schema";
import { PartnershipAvatars } from "./partnership-avatars";
import { Pagination } from "./pagination";
import { formatDateTime } from "./utils";

export interface PartnershipHistoryTableProps {
  isLoading: boolean;
  paginatedDissolved: DissolvedPartnership[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  searchQuery: string;
  onPageChange: (page: number) => void;
  onViewDetails: (partnership: DissolvedPartnership) => void;
}

export function PartnershipHistoryTable({
  isLoading,
  paginatedDissolved,
  currentPage,
  pageSize,
  totalPages,
  totalItems,
  searchQuery,
  onPageChange,
  onViewDetails,
}: PartnershipHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (paginatedDissolved.length === 0) {
    return (
      <AnimatedEmptyState>
        <div className="text-center py-16">
          <IconHistory className="size-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Dissolved Partnerships</h3>
          <p className="text-sm text-muted-foreground">
            There are no dissolved partnerships matching your filters.
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
            <TableHead className="w-[180px] py-2.5 font-medium text-xs">Original Partnership</TableHead>
            <TableHead className="w-[100px] py-2.5 font-medium text-xs">Division</TableHead>
            <TableHead className="w-[100px] py-2.5 font-medium text-xs">Dissolved</TableHead>
            <TableHead className="w-[200px] py-2.5 font-medium text-xs">Reason</TableHead>
            <TableHead className="w-[100px] py-2.5 font-medium text-xs">Status</TableHead>
            <TableHead className="w-[180px] py-2.5 font-medium text-xs">New Partnership</TableHead>
            <TableHead className="w-[60px] py-2.5 pr-4 font-medium text-xs text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <motion.tbody
          key={`dissolved-${searchQuery}-${currentPage}`}
          initial="hidden"
          animate="visible"
          variants={tableContainerVariants}
        >
          {paginatedDissolved.map((partnership, index) => (
            <motion.tr
              key={partnership.id}
              variants={tableRowVariants}
              transition={fastTransition}
              className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
              onClick={() => onViewDetails(partnership)}
            >
              <TableCell className="pl-4 text-muted-foreground font-mono text-xs">
                {(currentPage - 1) * pageSize + index + 1}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <PartnershipAvatars
                    captain={partnership.captain}
                    partner={partnership.partner}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-sm truncate">
                      {partnership.captain?.name || "Unknown"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      & {partnership.partner?.name || "Unknown"}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{partnership.division?.name || "\u2014"}</span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDateTime(partnership.dissolvedAt)}
              </TableCell>
              <TableCell>
                {partnership.withdrawalRequest ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">
                      {partnership.withdrawalRequest.user?.name} left
                    </span>
                    <span className="text-sm" title={partnership.withdrawalRequest.reason}>
                      {partnership.withdrawalRequest.reason}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">{"\u2014"}</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn("text-xs font-medium", getPartnershipStatusColor(partnership.status as PartnershipStatus))}
                >
                  {getPartnershipStatusLabel(partnership.status as PartnershipStatus)}
                </Badge>
              </TableCell>
              <TableCell>
                {partnership.successors && partnership.successors.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <PartnershipAvatars
                      captain={partnership.successors[0].captain}
                      partner={partnership.successors[0].partner}
                      size="sm"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium truncate">
                        {partnership.successors[0].captain?.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] w-fit",
                          partnership.successors[0].status === "ACTIVE"
                            ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                            : "text-amber-700 bg-amber-50 border-amber-200"
                        )}
                      >
                        {getPartnershipStatusLabel(partnership.successors[0].status as PartnershipStatus)}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <Badge variant="outline" className="text-xs text-slate-600 bg-slate-50 border-slate-200">
                    <IconUserPlus className="size-3 mr-1" />
                    Finding partner
                  </Badge>
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 cursor-pointer"
                    onClick={() => onViewDetails(partnership)}
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
