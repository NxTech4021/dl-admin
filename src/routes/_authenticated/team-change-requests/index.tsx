import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Button } from "@/components/ui/button";
import {
  IconUserMinus,
  IconRefresh,
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
  IconX,
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconUsers,
  IconEye,
  IconUserPlus,
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
} from "@/hooks/use-queries";
import {
  WithdrawalRequestAdmin,
  DissolvedPartnership,
  WithdrawalRequestStatus,
  getWithdrawalStatusLabel,
  getWithdrawalStatusColor,
  getPartnershipStatusLabel,
} from "@/constants/zod/partnership-admin-schema";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FilterSelect } from "@/components/ui/filter-select";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  AnimatedStatsGrid,
  AnimatedStatsCard,
  AnimatedFilterBar,
  AnimatedEmptyState,
} from "@/components/ui/animated-container";
import {
  tableContainerVariants,
  tableRowVariants,
  fastTransition,
} from "@/lib/animation-variants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export const Route = createFileRoute("/_authenticated/team-change-requests/")({
  component: PartnershipChangesPage,
});

// Helper functions
const getInitials = (name: string | null | undefined): string => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return "—";
  const dateObject = date instanceof Date ? date : new Date(date);
  return dateObject.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (date: Date | string | null | undefined): string => {
  if (!date) return "—";
  const dateObject = date instanceof Date ? date : new Date(date);
  return dateObject.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const truncateText = (text: string | null | undefined, maxLength: number = 40): string => {
  if (!text) return "—";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

const getAvatarColor = (name: string | null | undefined): string => {
  const colors = [
    "bg-slate-600",
    "bg-emerald-600",
    "bg-sky-600",
    "bg-violet-600",
    "bg-amber-600",
    "bg-rose-600",
    "bg-teal-600",
    "bg-indigo-600",
  ];
  if (!name) return colors[0];
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Partnership avatars component - shows captain + partner
function PartnershipAvatars({
  captain,
  partner,
  size = "sm",
}: {
  captain: { name: string | null; image: string | null | undefined } | null;
  partner: { name: string | null; image: string | null | undefined } | null;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "size-7" : "size-9";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <div className="flex items-center">
      <Avatar className={cn(sizeClass, "ring-2 ring-background z-10")}>
        {captain?.image && <AvatarImage src={captain.image} alt={captain?.name || "Captain"} />}
        <AvatarFallback className={cn("text-white font-semibold", textSize, getAvatarColor(captain?.name))}>
          {getInitials(captain?.name)}
        </AvatarFallback>
      </Avatar>
      <Avatar className={cn(sizeClass, "ring-2 ring-background -ml-2")}>
        {partner?.image && <AvatarImage src={partner.image} alt={partner?.name || "Partner"} />}
        <AvatarFallback className={cn("text-white font-semibold", textSize, partner ? getAvatarColor(partner?.name) : "bg-slate-300")}>
          {partner ? getInitials(partner?.name) : "?"}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}

function PartnershipChangesPage() {
  const [activeTab, setActiveTab] = useState<"withdrawals" | "history">("withdrawals");
  const [selectedStatus, setSelectedStatus] = useState<WithdrawalRequestStatus | undefined>();
  const [selectedSeason, setSelectedSeason] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [processAction, setProcessAction] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [adminNotes, setAdminNotes] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequestAdmin | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedPartnership, setSelectedPartnership] = useState<DissolvedPartnership | null>(null);

  const pageSize = 15;

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
  const totalWithdrawalPages = Math.ceil(filteredWithdrawals.length / pageSize);
  const paginatedWithdrawals = filteredWithdrawals.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Pagination for dissolved partnerships
  const filteredDissolved = dissolvedPartnerships || [];
  const totalDissolvedPages = Math.ceil(filteredDissolved.length / pageSize);
  const paginatedDissolved = filteredDissolved.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
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
    setSelectedSeason(undefined);
    setSearchQuery("");
    setCurrentPage(1);
  }, []);

  const refetchAll = useCallback(() => {
    refetchWithdrawals();
    refetchDissolved();
  }, [refetchWithdrawals, refetchDissolved]);

  const totalWithdrawalPagesForDisplay = activeTab === "withdrawals" ? totalWithdrawalPages : totalDissolvedPages;

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
                {(selectedStatus || selectedSeason || searchQuery) && (
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
                    {withdrawalsLoading ? (
                      <div className="p-6 space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-14 w-full" />
                        ))}
                      </div>
                    ) : paginatedWithdrawals.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="w-[50px] text-center">#</TableHead>
                            <TableHead className="min-w-[200px]">Partnership</TableHead>
                            <TableHead className="min-w-[150px]">Who Left</TableHead>
                            <TableHead className="min-w-[180px]">Reason</TableHead>
                            <TableHead>Season</TableHead>
                            <TableHead className="w-[100px]">Status</TableHead>
                            <TableHead className="w-[110px]">Requested</TableHead>
                            <TableHead className="w-[140px] text-right pr-6">Actions</TableHead>
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
                              className="border-b transition-colors hover:bg-muted/50"
                            >
                              <TableCell className="text-center text-muted-foreground font-mono text-sm">
                                {(currentPage - 1) * pageSize + index + 1}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <PartnershipAvatars
                                    captain={request.partnership?.captain || null}
                                    partner={request.partnership?.partner || null}
                                  />
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-medium text-sm truncate">
                                      {request.partnership?.captain?.name || "Unknown"}
                                    </span>
                                    <span className="text-xs text-muted-foreground truncate">
                                      & {request.partnership?.partner?.name || "Unknown"}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="size-6 ring-1 ring-background">
                                    {request.user?.image && (
                                      <AvatarImage src={request.user.image} alt={request.user?.name || ""} />
                                    )}
                                    <AvatarFallback className={cn("text-white text-[9px] font-semibold", getAvatarColor(request.user?.name))}>
                                      {getInitials(request.user?.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium truncate max-w-[100px]">
                                    {request.user?.name || "Unknown"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span
                                  className="text-sm text-muted-foreground truncate block max-w-[180px]"
                                  title={request.reason}
                                >
                                  {truncateText(request.reason, 35)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground">
                                  {request.season?.name || "—"}
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
                                {formatDate(request.requestDate)}
                              </TableCell>
                              <TableCell className="pr-6">
                                <div className="flex items-center justify-end gap-1">
                                  {request.status === "PENDING" && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                                        onClick={() => handleProcess(request, "APPROVED")}
                                        title="Approve"
                                      >
                                        <IconCheck className="size-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 text-red-600 hover:text-red-700 hover:bg-red-100 cursor-pointer"
                                        onClick={() => handleProcess(request, "REJECTED")}
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
                                    onClick={() => handleViewWithdrawal(request)}
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
                    ) : (
                      <AnimatedEmptyState>
                        <div className="text-center py-16">
                          <IconUserMinus className="size-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No Withdrawal Requests</h3>
                          <p className="text-sm text-muted-foreground">
                            There are no withdrawal requests matching your filters.
                          </p>
                        </div>
                      </AnimatedEmptyState>
                    )}

                    {totalWithdrawalPages > 1 && paginatedWithdrawals.length > 0 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalWithdrawalPages}
                        totalItems={filteredWithdrawals.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                      />
                    )}
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
                    {dissolvedLoading ? (
                      <div className="p-6 space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-14 w-full" />
                        ))}
                      </div>
                    ) : paginatedDissolved.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="w-[50px] text-center">#</TableHead>
                            <TableHead className="min-w-[200px]">Original Partnership</TableHead>
                            <TableHead>Division</TableHead>
                            <TableHead className="w-[110px]">Dissolved</TableHead>
                            <TableHead className="min-w-[180px]">Reason</TableHead>
                            <TableHead className="min-w-[180px]">Successor</TableHead>
                            <TableHead className="w-[80px] text-right pr-6">Actions</TableHead>
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
                              className="border-b transition-colors hover:bg-muted/50"
                            >
                              <TableCell className="text-center text-muted-foreground font-mono text-sm">
                                {(currentPage - 1) * pageSize + index + 1}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
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
                                <span className="text-sm">{partnership.division?.name || "—"}</span>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDate(partnership.dissolvedAt)}
                              </TableCell>
                              <TableCell>
                                {partnership.withdrawalRequest ? (
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-xs text-muted-foreground">
                                      {partnership.withdrawalRequest.user?.name} left
                                    </span>
                                    <span className="text-sm truncate max-w-[150px]" title={partnership.withdrawalRequest.reason}>
                                      {truncateText(partnership.withdrawalRequest.reason, 25)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">—</span>
                                )}
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
                                        {getPartnershipStatusLabel(partnership.successors[0].status as any)}
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
                              <TableCell className="pr-6">
                                <div className="flex justify-end">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 cursor-pointer"
                                    onClick={() => handleViewPartnership(partnership)}
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
                    ) : (
                      <AnimatedEmptyState>
                        <div className="text-center py-16">
                          <IconHistory className="size-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No Dissolved Partnerships</h3>
                          <p className="text-sm text-muted-foreground">
                            There are no dissolved partnerships matching your filters.
                          </p>
                        </div>
                      </AnimatedEmptyState>
                    )}

                    {totalDissolvedPages > 1 && paginatedDissolved.length > 0 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalDissolvedPages}
                        totalItems={filteredDissolved.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Process Dialog */}
      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {processAction === "APPROVED" ? (
                <IconCheck className="size-5 text-emerald-600" />
              ) : (
                <IconX className="size-5 text-red-600" />
              )}
              {processAction === "APPROVED" ? "Approve Withdrawal" : "Reject Withdrawal"}
            </DialogTitle>
            <DialogDescription>
              {processAction === "APPROVED" ? (
                <>
                  This will dissolve the partnership between{" "}
                  <strong>{selectedRequest?.partnership?.captain?.name}</strong> and{" "}
                  <strong>{selectedRequest?.partnership?.partner?.name}</strong>.
                  The remaining player will be able to find a new partner.
                </>
              ) : (
                <>
                  This will reject {selectedRequest?.user?.name}'s request to leave the partnership.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedRequest && (
              <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center gap-3">
                  <PartnershipAvatars
                    captain={selectedRequest.partnership?.captain || null}
                    partner={selectedRequest.partnership?.partner || null}
                    size="md"
                  />
                  <div>
                    <div className="font-medium">
                      {selectedRequest.partnership?.captain?.name} & {selectedRequest.partnership?.partner?.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedRequest.partnership?.division?.name} • {selectedRequest.season?.name}
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground mb-1">Reason for leaving:</div>
                  <div className="text-sm">{selectedRequest.reason}</div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="admin-notes">Admin Notes (optional)</Label>
              <Textarea
                id="admin-notes"
                placeholder="Add any notes about this decision..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={processAction === "APPROVED" ? "default" : "destructive"}
              onClick={confirmProcess}
              disabled={processRequest.isPending}
            >
              {processRequest.isPending
                ? "Processing..."
                : processAction === "APPROVED"
                ? "Approve & Dissolve"
                : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRequest ? (
                <>
                  <IconUserMinus className="size-5" />
                  Withdrawal Request Details
                </>
              ) : (
                <>
                  <IconHistory className="size-5" />
                  Partnership Lifecycle
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-5">
              {/* Partnership Card */}
              <div className="rounded-lg border bg-card overflow-hidden">
                <div className="px-4 py-2 bg-muted/40 border-b">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Partnership</span>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <PartnershipAvatars
                      captain={selectedRequest.partnership?.captain || null}
                      partner={selectedRequest.partnership?.partner || null}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">
                        {selectedRequest.partnership?.captain?.name} & {selectedRequest.partnership?.partner?.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedRequest.partnership?.division?.name || "No division"} • {selectedRequest.season?.name}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Request Timeline Card */}
              <div className="rounded-lg border bg-card overflow-hidden">
                <div className="px-4 py-2 bg-muted/40 border-b">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Request Timeline</span>
                </div>
                <div className="p-4">
                  <div className="space-y-0">
                    {/* Request Submitted */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="size-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <IconUserMinus className="size-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="w-px flex-1 bg-border my-1" />
                      </div>
                      <div className="pb-4 flex-1">
                        <div className="text-sm font-medium">Withdrawal Requested</div>
                        <div className="text-xs text-muted-foreground mb-2">{formatDate(selectedRequest.requestDate)}</div>
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="size-5">
                            {selectedRequest.user?.image && (
                              <AvatarImage src={selectedRequest.user.image} />
                            )}
                            <AvatarFallback className={cn("text-white text-[8px]", getAvatarColor(selectedRequest.user?.name))}>
                              {getInitials(selectedRequest.user?.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{selectedRequest.user?.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2 italic">
                          "{selectedRequest.reason}"
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "size-8 rounded-full flex items-center justify-center",
                          selectedRequest.status === "APPROVED"
                            ? "bg-emerald-100 dark:bg-emerald-900/30"
                            : selectedRequest.status === "REJECTED"
                            ? "bg-red-100 dark:bg-red-900/30"
                            : "bg-slate-100 dark:bg-slate-800"
                        )}>
                          {selectedRequest.status === "APPROVED" ? (
                            <IconCircleCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                          ) : selectedRequest.status === "REJECTED" ? (
                            <IconCircleX className="size-4 text-red-600 dark:text-red-400" />
                          ) : (
                            <IconClock className="size-4 text-slate-600 dark:text-slate-400" />
                          )}
                        </div>
                        {selectedRequest.partnership?.successors && selectedRequest.partnership.successors.length > 0 && (
                          <div className="w-px flex-1 bg-border my-1" />
                        )}
                      </div>
                      <div className={cn("flex-1", selectedRequest.partnership?.successors && selectedRequest.partnership.successors.length > 0 ? "pb-4" : "")}>
                        <div className="text-sm font-medium flex items-center gap-2">
                          {selectedRequest.status === "APPROVED" ? "Approved" : selectedRequest.status === "REJECTED" ? "Rejected" : "Pending Review"}
                          <Badge
                            variant="outline"
                            className={cn("text-[10px]", getWithdrawalStatusColor(selectedRequest.status))}
                          >
                            {getWithdrawalStatusLabel(selectedRequest.status)}
                          </Badge>
                        </div>
                        {selectedRequest.processedByAdmin ? (
                          <div className="text-xs text-muted-foreground">
                            {formatDate(selectedRequest.updatedAt)} by {selectedRequest.processedByAdmin.name}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">Awaiting admin review</div>
                        )}
                      </div>
                    </div>

                    {/* Successor Partnership */}
                    {selectedRequest.partnership?.successors && selectedRequest.partnership.successors.length > 0 && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "size-8 rounded-full flex items-center justify-center",
                            selectedRequest.partnership.successors[0].status === "ACTIVE"
                              ? "bg-emerald-100 dark:bg-emerald-900/30"
                              : "bg-amber-100 dark:bg-amber-900/30"
                          )}>
                            <IconUserPlus className={cn(
                              "size-4",
                              selectedRequest.partnership.successors[0].status === "ACTIVE"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-amber-600 dark:text-amber-400"
                            )} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">New Partnership Formed</div>
                          <div className="text-xs text-muted-foreground mb-2">{formatDate(selectedRequest.partnership.successors[0].createdAt)}</div>
                          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                            <PartnershipAvatars
                              captain={selectedRequest.partnership.successors[0].captain}
                              partner={selectedRequest.partnership.successors[0].partner}
                              size="sm"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {selectedRequest.partnership.successors[0].captain?.name}
                                {selectedRequest.partnership.successors[0].partner
                                  ? ` & ${selectedRequest.partnership.successors[0].partner.name}`
                                  : " (finding partner)"}
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] shrink-0",
                                selectedRequest.partnership.successors[0].status === "ACTIVE"
                                  ? "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  : "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400"
                              )}
                            >
                              {getPartnershipStatusLabel(selectedRequest.partnership.successors[0].status as any)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedPartnership && (
            <div className="space-y-5">
              {/* Original Partnership Card */}
              <div className="rounded-lg border bg-card overflow-hidden">
                <div className="px-4 py-2 bg-muted/40 border-b">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Original Partnership</span>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <PartnershipAvatars
                      captain={selectedPartnership.captain}
                      partner={selectedPartnership.partner}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">
                        {selectedPartnership.captain?.name} & {selectedPartnership.partner?.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedPartnership.division?.name || "No division"} • {selectedPartnership.season?.name}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Card */}
              <div className="rounded-lg border bg-card overflow-hidden">
                <div className="px-4 py-2 bg-muted/40 border-b">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lifecycle Timeline</span>
                </div>
                <div className="p-4">
                  <div className="space-y-0">
                    {/* Created */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <IconCircleCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="w-px flex-1 bg-border my-1" />
                      </div>
                      <div className="pb-4 flex-1">
                        <div className="text-sm font-medium">Partnership Created</div>
                        <div className="text-xs text-muted-foreground">{formatDate(selectedPartnership.createdAt)}</div>
                      </div>
                    </div>

                    {/* Withdrawal Request */}
                    {selectedPartnership.withdrawalRequest && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="size-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <IconUserMinus className="size-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="w-px flex-1 bg-border my-1" />
                        </div>
                        <div className="pb-4 flex-1">
                          <div className="text-sm font-medium">{selectedPartnership.withdrawalRequest.user?.name} Left</div>
                          <div className="text-xs text-muted-foreground mb-2">{formatDate(selectedPartnership.withdrawalRequest.requestDate)}</div>
                          <div className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2 italic">
                            "{selectedPartnership.withdrawalRequest.reason}"
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Dissolved */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <IconCircleX className="size-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        {selectedPartnership.successors && selectedPartnership.successors.length > 0 && (
                          <div className="w-px flex-1 bg-border my-1" />
                        )}
                      </div>
                      <div className={cn("flex-1", selectedPartnership.successors && selectedPartnership.successors.length > 0 ? "pb-4" : "")}>
                        <div className="text-sm font-medium">Partnership Dissolved</div>
                        <div className="text-xs text-muted-foreground">{formatDate(selectedPartnership.dissolvedAt)}</div>
                      </div>
                    </div>

                    {/* Successor */}
                    {selectedPartnership.successors && selectedPartnership.successors.length > 0 && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "size-8 rounded-full flex items-center justify-center",
                            selectedPartnership.successors[0].status === "ACTIVE"
                              ? "bg-emerald-100 dark:bg-emerald-900/30"
                              : "bg-amber-100 dark:bg-amber-900/30"
                          )}>
                            <IconUserPlus className={cn(
                              "size-4",
                              selectedPartnership.successors[0].status === "ACTIVE"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-amber-600 dark:text-amber-400"
                            )} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">New Partnership Formed</div>
                          <div className="text-xs text-muted-foreground mb-2">{formatDate(selectedPartnership.successors[0].createdAt)}</div>
                          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                            <PartnershipAvatars
                              captain={selectedPartnership.successors[0].captain}
                              partner={selectedPartnership.successors[0].partner}
                              size="sm"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {selectedPartnership.successors[0].captain?.name}
                                {selectedPartnership.successors[0].partner
                                  ? ` & ${selectedPartnership.successors[0].partner.name}`
                                  : " (finding partner)"}
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] shrink-0",
                                selectedPartnership.successors[0].status === "ACTIVE"
                                  ? "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  : "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400"
                              )}
                            >
                              {getPartnershipStatusLabel(selectedPartnership.successors[0].status as any)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Pagination component
function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-4 border-t">
      <div className="text-sm text-muted-foreground">
        Showing {(currentPage - 1) * pageSize + 1} to{" "}
        {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next
          <IconChevronRight className="size-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
