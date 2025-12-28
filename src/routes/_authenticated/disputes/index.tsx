import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  IconAlertTriangle,
  IconRefresh,
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconPoint,
} from "@tabler/icons-react";
import { useState } from "react";
import { DisputeStatsCards } from "@/components/dispute/dispute-stats-cards";
import { DisputeFilters } from "@/components/dispute/dispute-filters";
import { DisputeRowActions } from "@/components/dispute/dispute-row-actions";
import { DisputeStatusBadge } from "@/components/dispute/dispute-status-badge";
import { DisputePriorityBadge } from "@/components/dispute/dispute-priority-badge";
import { DisputeCategoryBadge } from "@/components/dispute/dispute-category-badge";
import { DisputeDetailModal } from "@/components/dispute/dispute-detail-modal";
import { DisputeAddNoteModal } from "@/components/dispute/dispute-add-note-modal";
import { useDisputes, useStartDisputeReview } from "@/hooks/use-queries";
import { formatTableDate } from "@/components/data-table/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dispute,
  DisputeStatus,
  DisputePriority,
  DisputeCategory,
} from "@/constants/zod/dispute-schema";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedFilterBar, AnimatedEmptyState } from "@/components/ui/animated-container";
import {
  tableContainerVariants,
  tableRowVariants,
  fastTransition,
} from "@/lib/animation-variants";

export const Route = createFileRoute("/_authenticated/disputes/")({
  component: DisputesPage,
});

function DisputesPage() {
  const [selectedStatus, setSelectedStatus] = useState<DisputeStatus>();
  const [selectedPriority, setSelectedPriority] = useState<DisputePriority>();
  const [selectedCategory, setSelectedCategory] = useState<DisputeCategory>();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [initialResolveMode, setInitialResolveMode] = useState(false);
  const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);

  const pageSize = 20;
  const { data, isLoading, error, refetch } = useDisputes({
    status: selectedStatus,
    priority: selectedPriority,
    page: currentPage,
    limit: pageSize,
  });

  const startReviewMutation = useStartDisputeReview();

  const handleView = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setInitialResolveMode(false);
    setDetailModalOpen(true);

    if (dispute.status === "OPEN") {
      startReviewMutation.mutate(dispute.id, {
        onSuccess: () => {
          refetch();
        },
      });
    }
  };

  const handleResolve = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setInitialResolveMode(true);
    setDetailModalOpen(true);

    if (dispute.status === "OPEN") {
      startReviewMutation.mutate(dispute.id, {
        onSuccess: () => {
          refetch();
        },
      });
    }
  };

  const handleAddNote = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setAddNoteModalOpen(true);
  };

  const handleClearFilters = () => {
    setSelectedStatus(undefined);
    setSelectedPriority(undefined);
    setSelectedCategory(undefined);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleActionSuccess = () => {
    refetch();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <PageHeader
            icon={IconAlertTriangle}
            title="Dispute Resolution"
            description="Review and resolve match disputes raised by players"
            actions={
              <>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <IconRefresh className="mr-2 size-4" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm">
                  <IconDownload className="mr-2 size-4" />
                  Export
                </Button>
              </>
            }
          >
            <DisputeStatsCards />

            <AnimatedFilterBar>
              <DisputeFilters
                selectedStatus={selectedStatus}
                selectedPriority={selectedPriority}
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
                onStatusChange={(val) => { setSelectedStatus(val); setCurrentPage(1); }}
                onPriorityChange={(val) => { setSelectedPriority(val); setCurrentPage(1); }}
                onCategoryChange={(val) => { setSelectedCategory(val); setCurrentPage(1); }}
                onSearchChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
                onClearFilters={handleClearFilters}
              />
            </AnimatedFilterBar>
          </PageHeader>

          <div className="flex-1 px-4 lg:px-6 pb-6">
            <div className="rounded-lg border bg-card">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <IconAlertTriangle className="size-12 text-destructive mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Failed to Load Disputes</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md">
                    There was an error loading the disputes data. Please try again.
                  </p>
                  <Button variant="outline" onClick={() => refetch()} className="gap-2">
                    <IconRefresh className="size-4" />
                    Retry
                  </Button>
                </div>
              ) : data && data.disputes && data.disputes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="w-[60px] text-center">#</TableHead>
                      <TableHead className="w-[200px]">Raised By</TableHead>
                      <TableHead className="w-[130px]">Category</TableHead>
                      <TableHead className="w-[240px]">Match</TableHead>
                      <TableHead className="w-[100px]">Priority</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[140px]">Created</TableHead>
                      <TableHead className="w-[70px] text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <motion.tbody
                    initial="hidden"
                    animate="visible"
                    variants={tableContainerVariants}
                  >
                    {data.disputes.map((dispute: Dispute, index: number) => (
                      <motion.tr
                        key={dispute.id}
                        variants={tableRowVariants}
                        transition={fastTransition}
                        className="border-b cursor-pointer transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        onClick={() => handleView(dispute)}
                      >
                        <TableCell className="text-center text-muted-foreground font-mono text-sm">
                          {(currentPage - 1) * pageSize + index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarImage src={dispute.raisedByUser?.image || undefined} />
                              <AvatarFallback className="text-xs">
                                {getInitials(dispute.raisedByUser?.name || "?")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {dispute.raisedByUser?.name || "Unknown"}
                              </span>
                              {dispute.raisedByUser?.username && (
                                <span className="text-xs text-muted-foreground">
                                  @{dispute.raisedByUser.username}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DisputeCategoryBadge category={dispute.disputeCategory} />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            {dispute.match?.division ? (
                              <div className="flex items-center gap-1.5 text-xs">
                                {dispute.match.division.season?.name && (
                                  <>
                                    <span className="font-medium text-foreground truncate max-w-[90px]">
                                      {dispute.match.division.season.name}
                                    </span>
                                    <IconPoint className="size-2 text-muted-foreground/40 shrink-0" />
                                  </>
                                )}
                                <span className="text-muted-foreground truncate max-w-[90px]">
                                  {dispute.match.division.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                            <span className="font-mono text-[10px] text-muted-foreground/60">
                              ID: {dispute.matchId.slice(0, 8)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DisputePriorityBadge priority={dispute.priority} />
                        </TableCell>
                        <TableCell>
                          <DisputeStatusBadge status={dispute.status} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatTableDate(dispute.createdAt)}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DisputeRowActions
                            dispute={dispute}
                            onView={handleView}
                            onResolve={handleResolve}
                            onAddNote={handleAddNote}
                          />
                        </TableCell>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </Table>
              ) : (
                <AnimatedEmptyState>
                  <div className="text-center py-12">
                    <IconAlertTriangle className="size-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Disputes Found</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedStatus || selectedPriority || selectedCategory || searchQuery
                        ? "Try adjusting your filters to see more results."
                        : "There are no disputes to review at this time."}
                    </p>
                  </div>
                </AnimatedEmptyState>
              )}

              {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, data.total)} of {data.total} disputes
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
                      {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (data.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= data.totalPages - 2) {
                          pageNum = data.totalPages - 4 + i;
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
                      onClick={() => setCurrentPage((p) => Math.min(data.totalPages, p + 1))}
                      disabled={currentPage === data.totalPages}
                    >
                      Next
                      <IconChevronRight className="size-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DisputeDetailModal
        dispute={selectedDispute}
        open={detailModalOpen}
        onOpenChange={(open) => {
          setDetailModalOpen(open);
          if (!open) setInitialResolveMode(false);
        }}
        onAddNote={() => {
          setDetailModalOpen(false);
          setAddNoteModalOpen(true);
        }}
        onSuccess={handleActionSuccess}
        initialResolveMode={initialResolveMode}
      />

      <DisputeAddNoteModal
        dispute={selectedDispute}
        open={addNoteModalOpen}
        onOpenChange={setAddNoteModalOpen}
        onSuccess={handleActionSuccess}
      />
    </>
  );
}
