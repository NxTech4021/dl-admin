"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  IconAlertTriangle,
  IconRefresh,
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
} from "@tabler/icons-react";
import { useState } from "react";
import { DisputeStatsCards } from "@/components/dispute/dispute-stats-cards";
import { DisputeFilters } from "@/components/dispute/dispute-filters";
import { DisputeRowActions } from "@/components/dispute/dispute-row-actions";
import { DisputeStatusBadge } from "@/components/dispute/dispute-status-badge";
import { DisputePriorityBadge } from "@/components/dispute/dispute-priority-badge";
import { DisputeCategoryBadge } from "@/components/dispute/dispute-category-badge";
import { DisputeDetailDrawer } from "@/components/dispute/dispute-detail-drawer";
import { DisputeResolveModal } from "@/components/dispute/dispute-resolve-modal";
import { DisputeAddNoteModal } from "@/components/dispute/dispute-add-note-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function DisputesPage() {
  const [selectedStatus, setSelectedStatus] = useState<DisputeStatus>();
  const [selectedPriority, setSelectedPriority] = useState<DisputePriority>();
  const [selectedCategory, setSelectedCategory] = useState<DisputeCategory>();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal/Drawer states
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);

  const pageSize = 20;
  const { data, isLoading, error, refetch } = useDisputes({
    status: selectedStatus,
    priority: selectedPriority,
    page: currentPage,
    limit: pageSize,
  });

  const startReviewMutation = useStartDisputeReview();

  // Action handlers
  const handleView = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setDetailDrawerOpen(true);

    // Auto-start review when opening an OPEN dispute
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
    setResolveModalOpen(true);
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

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6">
              {/* Page Header */}
              <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-4 lg:px-6 py-6">
                  <div className="flex flex-col gap-6">
                    {/* Title and Actions */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <IconAlertTriangle className="size-8 text-destructive" />
                          <h1 className="text-3xl font-bold tracking-tight">
                            Dispute Resolution
                          </h1>
                        </div>
                        <p className="text-muted-foreground">
                          Review and resolve match disputes raised by players
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => refetch()}>
                          <IconRefresh className="mr-2 size-4" />
                          Refresh
                        </Button>
                        <Button variant="outline" size="sm">
                          <IconDownload className="mr-2 size-4" />
                          Export
                        </Button>
                      </div>
                    </div>

                    {/* Statistics */}
                    <DisputeStatsCards />

                    {/* Filters */}
                    <DisputeFilters
                      selectedStatus={selectedStatus}
                      selectedPriority={selectedPriority}
                      selectedCategory={selectedCategory}
                      searchQuery={searchQuery}
                      onStatusChange={(val) => {
                        setSelectedStatus(val);
                        setCurrentPage(1);
                      }}
                      onPriorityChange={(val) => {
                        setSelectedPriority(val);
                        setCurrentPage(1);
                      }}
                      onCategoryChange={(val) => {
                        setSelectedCategory(val);
                        setCurrentPage(1);
                      }}
                      onSearchChange={(val) => {
                        setSearchQuery(val);
                        setCurrentPage(1);
                      }}
                      onClearFilters={handleClearFilters}
                    />
                  </div>
                </div>
              </div>

              {/* Disputes Table */}
              <div className="flex-1 px-4 lg:px-6 pb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Disputes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : error ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <IconAlertTriangle className="size-12 text-destructive mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          Failed to Load Disputes
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 max-w-md">
                          There was an error loading the disputes data. Please try again.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => refetch()}
                          className="gap-2"
                        >
                          <IconRefresh className="size-4" />
                          Retry
                        </Button>
                      </div>
                    ) : data && data.disputes && data.disputes.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Raised By</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Match</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="w-[50px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.disputes.map((dispute: Dispute) => (
                            <TableRow
                              key={dispute.id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => handleView(dispute)}
                            >
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
                                <div className="flex flex-col">
                                  <span className="font-mono text-xs">
                                    {dispute.matchId.slice(0, 8)}...
                                  </span>
                                  {dispute.match?.division && (
                                    <span className="text-xs text-muted-foreground">
                                      {dispute.match.division.name}
                                    </span>
                                  )}
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
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-12">
                        <IconAlertTriangle className="size-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Disputes Found</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedStatus || selectedPriority || selectedCategory || searchQuery
                            ? "Try adjusting your filters to see more results."
                            : "There are no disputes to review at this time."}
                        </p>
                      </div>
                    )}

                    {/* Pagination */}
                    {data && data.totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t mt-4">
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
                            {Array.from(
                              { length: Math.min(5, data.totalPages) },
                              (_, i) => {
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
                              }
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage((p) => Math.min(data.totalPages, p + 1))
                            }
                            disabled={currentPage === data.totalPages}
                          >
                            Next
                            <IconChevronRight className="size-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Modals and Drawers */}
      <DisputeDetailDrawer
        dispute={selectedDispute}
        open={detailDrawerOpen}
        onOpenChange={setDetailDrawerOpen}
        onResolve={() => {
          setDetailDrawerOpen(false);
          setResolveModalOpen(true);
        }}
        onAddNote={() => {
          setDetailDrawerOpen(false);
          setAddNoteModalOpen(true);
        }}
      />

      <DisputeResolveModal
        dispute={selectedDispute}
        open={resolveModalOpen}
        onOpenChange={setResolveModalOpen}
        onSuccess={handleActionSuccess}
      />

      <DisputeAddNoteModal
        dispute={selectedDispute}
        open={addNoteModalOpen}
        onOpenChange={setAddNoteModalOpen}
        onSuccess={handleActionSuccess}
      />
    </SidebarProvider>
  );
}
