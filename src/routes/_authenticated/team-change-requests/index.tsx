import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Button } from "@/components/ui/button";
import {
  IconUserMinus,
  IconRefresh,
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconUsers,
  IconHistory,
} from "@tabler/icons-react";
import { useState, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import {
  useWithdrawalRequestsAdmin,
  useWithdrawalRequestStats,
  useDissolvedPartnerships,
  useProcessWithdrawalRequest,
  useSeasons,
} from "@/hooks/queries";
import type {
  WithdrawalRequestAdmin,
  DissolvedPartnership,
  WithdrawalRequestStatus,
} from "@/constants/zod/partnership-admin-schema";
import { ExportButton } from "@/components/shared/export-button";
import { FilterSelect } from "@/components/ui/filter-select";
import { SearchInput } from "@/components/ui/search-input";
import {
  AnimatedStatsGrid,
  AnimatedStatsCard,
  AnimatedFilterBar,
} from "@/components/ui/animated-container";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Sub-components
import { WithdrawalsTable } from "@/components/team-change/withdrawals-table";
import { PartnershipHistoryTable } from "@/components/team-change/partnership-history-table";
import { ProcessDialog } from "@/components/team-change/process-dialog";
import { DetailsDialog } from "@/components/team-change/details-dialog";
import { withdrawalExportColumns, dissolvedExportColumns } from "@/components/team-change/export-columns";
import { STATUS_OPTIONS, HISTORY_STATUS_OPTIONS, PAGE_SIZE } from "@/components/team-change/utils";

export const Route = createFileRoute("/_authenticated/team-change-requests/")({
  component: PartnershipChangesPage,
});

function PartnershipChangesPage() {
  const [activeTab, setActiveTab] = useState<"withdrawals" | "history">("withdrawals");
  const [selectedStatus, setSelectedStatus] = useState<WithdrawalRequestStatus | undefined>();
  const [selectedHistoryStatus, setSelectedHistoryStatus] = useState<"DISSOLVED" | "EXPIRED" | undefined>();
  const [selectedSeason, setSelectedSeason] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [processAction, setProcessAction] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [adminNotes, setAdminNotes] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequestAdmin | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedPartnership, setSelectedPartnership] = useState<DissolvedPartnership | null>(null);

  // Queries
  const { data: stats, isLoading: statsLoading } = useWithdrawalRequestStats();
  const { data: withdrawalRequests, isLoading: withdrawalsLoading, refetch: refetchWithdrawals } = useWithdrawalRequestsAdmin({
    status: selectedStatus,
    seasonId: selectedSeason,
    search: searchQuery || undefined,
  });
  const { data: dissolvedPartnerships, isLoading: dissolvedLoading, refetch: refetchDissolved } = useDissolvedPartnerships({
    seasonId: selectedSeason,
    search: searchQuery || undefined,
    status: selectedHistoryStatus,
  });
  const { data: seasons } = useSeasons();
  const processRequest = useProcessWithdrawalRequest();

  // Season options for filter
  const seasonOptions = useMemo(() => {
    return (seasons || []).map((s) => ({
      value: s.id,
      label: s.name,
    }));
  }, [seasons]);

  // Pagination for withdrawals
  const filteredWithdrawals = withdrawalRequests || [];
  const totalWithdrawalPages = Math.ceil(filteredWithdrawals.length / PAGE_SIZE);
  const paginatedWithdrawals = filteredWithdrawals.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Pagination for dissolved partnerships
  const filteredDissolved = dissolvedPartnerships || [];
  const totalDissolvedPages = Math.ceil(filteredDissolved.length / PAGE_SIZE);
  const paginatedDissolved = filteredDissolved.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleProcess = useCallback((request: WithdrawalRequestAdmin, action: "APPROVED" | "REJECTED") => {
    setSelectedRequest(request);
    setProcessAction(action);
    setAdminNotes("");
    setProcessDialogOpen(true);
  }, []);

  const confirmProcess = async () => {
    if (!selectedRequest) return;

    try {
      await processRequest.mutateAsync({
        requestId: selectedRequest.id,
        status: processAction,
        adminNotes: adminNotes || undefined,
      });

      toast.success(
        processAction === "APPROVED"
          ? "Withdrawal request approved - Partnership dissolved"
          : "Withdrawal request rejected"
      );
      setProcessDialogOpen(false);
      refetchWithdrawals();
    } catch {
      toast.error("Failed to process request");
    }
  };

  const handleViewWithdrawal = useCallback((request: WithdrawalRequestAdmin) => {
    setSelectedRequest(request);
    setSelectedPartnership(null);
    setDetailsDialogOpen(true);
  }, []);

  const handleViewPartnership = useCallback((partnership: DissolvedPartnership) => {
    setSelectedPartnership(partnership);
    setSelectedRequest(null);
    setDetailsDialogOpen(true);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedStatus(undefined);
    setSelectedHistoryStatus(undefined);
    setSelectedSeason(undefined);
    setSearchQuery("");
    setCurrentPage(1);
  }, []);

  const refetchAll = useCallback(() => {
    refetchWithdrawals();
    refetchDissolved();
  }, [refetchWithdrawals, refetchDissolved]);

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <PageHeader
            icon={IconUserMinus}
            title="Partnership Changes"
            description="Manage withdrawal requests and view partnership dissolution history"
            actions={
              stats && stats.pending > 0 ? (
                <Badge variant="destructive" className="font-medium">
                  {stats.pending} pending
                </Badge>
              ) : undefined
            }
          >
            <AnimatedStatsGrid className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <AnimatedStatsCard>
                <StatsCard
                  title="Pending Requests"
                  value={stats?.pending || 0}
                  description="Awaiting review"
                  icon={IconClock}
                  iconColor="text-amber-500"
                  loading={statsLoading}
                />
              </AnimatedStatsCard>
              <AnimatedStatsCard>
                <StatsCard
                  title="Approved"
                  value={stats?.approved || 0}
                  description="Partnerships dissolved"
                  icon={IconCircleCheck}
                  iconColor="text-emerald-500"
                  loading={statsLoading}
                />
              </AnimatedStatsCard>
              <AnimatedStatsCard>
                <StatsCard
                  title="Rejected"
                  value={stats?.rejected || 0}
                  description="Requests denied"
                  icon={IconCircleX}
                  iconColor="text-red-500"
                  loading={statsLoading}
                />
              </AnimatedStatsCard>
              <AnimatedStatsCard>
                <StatsCard
                  title="Total Dissolved"
                  value={stats?.totalDissolved || 0}
                  description="All dissolved partnerships"
                  icon={IconUsers}
                  iconColor="text-slate-500"
                  loading={statsLoading}
                />
              </AnimatedStatsCard>
            </AnimatedStatsGrid>

            <AnimatedFilterBar>
              <div className="flex items-center gap-2 w-full">
                <SearchInput
                  value={searchQuery}
                  onChange={(val) => {
                    setSearchQuery(val);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by player name..."
                  className="w-[220px]"
                />
                {activeTab === "withdrawals" && (
                  <FilterSelect
                    value={selectedStatus}
                    onChange={(value) => {
                      setSelectedStatus(value as WithdrawalRequestStatus | undefined);
                      setCurrentPage(1);
                    }}
                    options={STATUS_OPTIONS}
                    allLabel="All Statuses"
                    triggerClassName="w-[150px]"
                  />
                )}
                {activeTab === "history" && (
                  <FilterSelect
                    value={selectedHistoryStatus}
                    onChange={(value) => {
                      setSelectedHistoryStatus(value as "DISSOLVED" | "EXPIRED" | undefined);
                      setCurrentPage(1);
                    }}
                    options={HISTORY_STATUS_OPTIONS}
                    allLabel="All Statuses"
                    triggerClassName="w-[150px]"
                  />
                )}
                <FilterSelect
                  value={selectedSeason}
                  onChange={(value) => {
                    setSelectedSeason(value);
                    setCurrentPage(1);
                  }}
                  options={seasonOptions}
                  allLabel="All Seasons"
                  triggerClassName="w-[180px]"
                />
                {(selectedStatus || selectedHistoryStatus || selectedSeason || searchQuery) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Clear all
                  </Button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  {activeTab === "withdrawals" ? (
                    <ExportButton
                      data={filteredWithdrawals}
                      columns={withdrawalExportColumns}
                      filename="withdrawal-requests"
                      formats={["csv", "excel"]}
                      variant="outline"
                      size="sm"
                    />
                  ) : (
                    <ExportButton
                      data={filteredDissolved}
                      columns={dissolvedExportColumns}
                      filename="partnership-history"
                      formats={["csv", "excel"]}
                      variant="outline"
                      size="sm"
                    />
                  )}
                  <Button variant="outline" size="sm" onClick={refetchAll} className="cursor-pointer">
                    <IconRefresh className="mr-2 size-4" />
                    Refresh
                  </Button>
                </div>
              </div>
            </AnimatedFilterBar>
          </PageHeader>

          <div className="flex-1 px-4 lg:px-6 pb-6">
            <div className="space-y-4">
              {/* Tab Switcher - Notification Style */}
              <div className="inline-flex items-center rounded-md bg-muted/60 p-0.5 border border-border/50">
                <button
                  onClick={() => {
                    setActiveTab("withdrawals");
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "inline-flex items-center justify-center rounded px-3 py-1.5 text-xs font-medium transition-all cursor-pointer gap-1.5",
                    activeTab === "withdrawals"
                      ? "bg-background text-foreground shadow-sm border border-border/50"
                      : "text-foreground/70 hover:text-foreground"
                  )}
                >
                  <IconUserMinus className="size-3.5" />
                  Withdrawal Requests
                  <span className={cn(
                    "text-[10px] font-medium tabular-nums",
                    activeTab === "withdrawals" ? "text-foreground/70" : "text-foreground/50"
                  )}>
                    {filteredWithdrawals.length}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("history");
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "inline-flex items-center justify-center rounded px-3 py-1.5 text-xs font-medium transition-all cursor-pointer gap-1.5",
                    activeTab === "history"
                      ? "bg-background text-foreground shadow-sm border border-border/50"
                      : "text-foreground/70 hover:text-foreground"
                  )}
                >
                  <IconHistory className="size-3.5" />
                  Partnership History
                  <span className={cn(
                    "text-[10px] font-medium tabular-nums",
                    activeTab === "history" ? "text-foreground/70" : "text-foreground/50"
                  )}>
                    {filteredDissolved.length}
                  </span>
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "withdrawals" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-lg border bg-card"
                  >
                    <WithdrawalsTable
                      isLoading={withdrawalsLoading}
                      paginatedWithdrawals={paginatedWithdrawals}
                      currentPage={currentPage}
                      pageSize={PAGE_SIZE}
                      totalPages={totalWithdrawalPages}
                      totalItems={filteredWithdrawals.length}
                      searchQuery={searchQuery}
                      selectedStatus={selectedStatus}
                      onPageChange={setCurrentPage}
                      onProcess={handleProcess}
                      onViewDetails={handleViewWithdrawal}
                    />
                  </motion.div>
                )}

                {activeTab === "history" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-lg border bg-card"
                  >
                    <PartnershipHistoryTable
                      isLoading={dissolvedLoading}
                      paginatedDissolved={paginatedDissolved}
                      currentPage={currentPage}
                      pageSize={PAGE_SIZE}
                      totalPages={totalDissolvedPages}
                      totalItems={filteredDissolved.length}
                      searchQuery={searchQuery}
                      onPageChange={setCurrentPage}
                      onViewDetails={handleViewPartnership}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Process Dialog */}
      <ProcessDialog
        open={processDialogOpen}
        onOpenChange={setProcessDialogOpen}
        selectedRequest={selectedRequest}
        processAction={processAction}
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        onConfirm={confirmProcess}
        isPending={processRequest.isPending}
      />

      {/* Details Dialog */}
      <DetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        selectedRequest={selectedRequest}
        selectedPartnership={selectedPartnership}
      />
    </>
  );
}
