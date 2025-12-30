import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExportButton, type ExportColumn } from "@/components/shared";
import {
  IconCreditCard,
  IconUsers,
  IconCircleCheck,
  IconClock,
  IconAlertTriangle,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import { usePayments, usePaymentStats, useSeasons } from "@/hooks/use-queries";
import { PaymentsDataTable } from "@/components/payments/payments-data-table";
import { PaymentsFilters } from "@/components/payments/payments-filters";
import { PaymentDetailModal } from "@/components/payments/payment-detail-modal";
import { PaymentStatusModal } from "@/components/payments/payment-status-modal";
import { BulkPaymentModal } from "@/components/payments/bulk-payment-modal";
import type { PaymentRecord, PaymentFilters } from "@/constants/zod/payment-schema";
import { AnimatedContainer, AnimatedFilterBar } from "@/components/ui/animated-container";
import {
  statsGridContainer,
  statsCardVariants,
  defaultTransition,
} from "@/lib/animation-variants";

export const Route = createFileRoute("/_authenticated/payments/")({
  component: PaymentsPage,
});

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "N/A";
  return new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: "MYR",
  }).format(amount);
};

function PaymentsPage() {
  // Filter state
  const [filters, setFilters] = React.useState<Partial<PaymentFilters>>({
    page: 1,
    limit: 20,
  });

  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Modal states
  const [detailPayment, setDetailPayment] = React.useState<PaymentRecord | null>(null);
  const [statusPayment, setStatusPayment] = React.useState<PaymentRecord | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = React.useState(false);

  // Queries
  const { data: paymentsData, isLoading: isLoadingPayments, refetch } = usePayments(filters);
  const { data: stats, isLoading: isLoadingStats } = usePaymentStats({
    seasonId: filters.seasonId,
    startDate: filters.startDate,
    endDate: filters.endDate,
  });
  const { data: seasons } = useSeasons();

  // Filter seasons to only those with paymentRequired
  const paymentSeasons = React.useMemo(() => {
    return seasons?.filter((s) => s.paymentRequired) ?? [];
  }, [seasons]);

  // Handlers
  const handleFilterChange = React.useCallback((newFilters: Partial<PaymentFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    setSelectedIds([]);
  }, []);

  const handlePageChange = React.useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleViewDetail = React.useCallback((payment: PaymentRecord) => {
    setDetailPayment(payment);
  }, []);

  const handleUpdateStatus = React.useCallback((payment: PaymentRecord) => {
    setStatusPayment(payment);
  }, []);

  const handleBulkAction = React.useCallback(() => {
    if (selectedIds.length > 0) {
      setIsBulkModalOpen(true);
    }
  }, [selectedIds]);

  const handleRefresh = React.useCallback(() => {
    refetch();
  }, [refetch]);

  // Export columns
  const exportColumns: ExportColumn<PaymentRecord>[] = [
    { key: "user.name", header: "Player Name", formatter: (v, row) => row.user?.name ?? "" },
    { key: "user.username", header: "Username", formatter: (v, row) => row.user?.username ?? "" },
    { key: "user.email", header: "Email", formatter: (v, row) => row.user?.email ?? "" },
    { key: "season.name", header: "Season", formatter: (v, row) => row.season?.name ?? "" },
    { key: "season.entryFee", header: "Entry Fee", formatter: (v, row) => formatCurrency(row.season?.entryFee) },
    { key: "paymentStatus", header: "Payment Status" },
    { key: "status", header: "Membership Status" },
    { key: "joinedAt", header: "Joined Date", formatter: (v) => v ? new Date(v as string).toLocaleDateString() : "" },
  ];

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-6">
            {/* Page Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="px-4 lg:px-6 py-6">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-center gap-3">
                      <IconCreditCard className="size-8 text-primary" />
                      <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                          Payments
                        </h1>
                        <p className="text-muted-foreground">
                          Manage payment records across all seasons
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ExportButton
                        data={paymentsData?.data ?? []}
                        columns={exportColumns}
                        filename="payments-export"
                        formats={["csv", "excel"]}
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Statistics Cards */}
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={statsGridContainer}
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
                  >
                    {/* Total Payments */}
                    <motion.div
                      variants={statsCardVariants}
                      transition={defaultTransition}
                      className="rounded-lg border bg-card p-3 sm:p-4"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted">
                          <IconUsers className="size-4 sm:size-5 text-muted-foreground" />
                        </div>
                        <div>
                          {isLoadingStats ? (
                            <Skeleton className="h-7 w-12" />
                          ) : (
                            <p className="text-xl sm:text-2xl font-bold">
                              {stats?.total ?? 0}
                            </p>
                          )}
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Total</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Paid */}
                    <motion.div
                      variants={statsCardVariants}
                      transition={defaultTransition}
                      className="rounded-lg border bg-card p-3 sm:p-4"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50">
                          <IconCircleCheck className="size-4 sm:size-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          {isLoadingStats ? (
                            <Skeleton className="h-7 w-12" />
                          ) : (
                            <p className="text-xl sm:text-2xl font-bold">
                              {stats?.completed ?? 0}
                            </p>
                          )}
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Paid</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Pending */}
                    <motion.div
                      variants={statsCardVariants}
                      transition={defaultTransition}
                      className="rounded-lg border bg-card p-3 sm:p-4"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-50 dark:bg-amber-950/50">
                          <IconClock className="size-4 sm:size-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          {isLoadingStats ? (
                            <Skeleton className="h-7 w-12" />
                          ) : (
                            <p className="text-xl sm:text-2xl font-bold">
                              {stats?.pending ?? 0}
                            </p>
                          )}
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Pending</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Failed */}
                    <motion.div
                      variants={statsCardVariants}
                      transition={defaultTransition}
                      className="rounded-lg border bg-card p-3 sm:p-4"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-50 dark:bg-red-950/50">
                          <IconAlertTriangle className="size-4 sm:size-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          {isLoadingStats ? (
                            <Skeleton className="h-7 w-12" />
                          ) : (
                            <p className="text-xl sm:text-2xl font-bold">
                              {stats?.failed ?? 0}
                            </p>
                          )}
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Failed</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Total Revenue */}
                    <motion.div
                      variants={statsCardVariants}
                      transition={defaultTransition}
                      className="rounded-lg border bg-card p-3 sm:p-4"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50">
                          <IconCurrencyDollar className="size-4 sm:size-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          {isLoadingStats ? (
                            <Skeleton className="h-7 w-20" />
                          ) : (
                            <p className="text-lg sm:text-xl font-bold truncate">
                              {formatCurrency(stats?.totalRevenue ?? 0)}
                            </p>
                          )}
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Revenue</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Outstanding */}
                    <motion.div
                      variants={statsCardVariants}
                      transition={defaultTransition}
                      className="rounded-lg border bg-card p-3 sm:p-4"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-50 dark:bg-amber-950/50">
                          <IconClock className="size-4 sm:size-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          {isLoadingStats ? (
                            <Skeleton className="h-7 w-20" />
                          ) : (
                            <p className="text-lg sm:text-xl font-bold truncate">
                              {formatCurrency(stats?.outstandingAmount ?? 0)}
                            </p>
                          )}
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Outstanding</p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 lg:px-6 pb-6 space-y-4">
              {/* Filters */}
              <AnimatedFilterBar>
                <PaymentsFilters
                  filters={filters}
                  seasons={paymentSeasons}
                  onFilterChange={handleFilterChange}
                  onRefresh={handleRefresh}
                />
              </AnimatedFilterBar>

              {/* Bulk Action Bar */}
              {selectedIds.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <span className="text-sm font-medium">
                    {selectedIds.length} payment{selectedIds.length !== 1 ? "s" : ""} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleBulkAction}>
                      Update Status
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedIds([])}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}

              {/* Data Table */}
              <AnimatedContainer delay={0.1}>
                <PaymentsDataTable
                  data={paymentsData?.data ?? []}
                  pagination={paymentsData?.pagination}
                  isLoading={isLoadingPayments}
                  selectedIds={selectedIds}
                  onSelectionChange={setSelectedIds}
                  onPageChange={handlePageChange}
                  onViewDetail={handleViewDetail}
                  onUpdateStatus={handleUpdateStatus}
                />
              </AnimatedContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PaymentDetailModal
        payment={detailPayment}
        open={!!detailPayment}
        onOpenChange={(open) => !open && setDetailPayment(null)}
        onUpdateStatus={() => {
          if (detailPayment) {
            setStatusPayment(detailPayment);
            setDetailPayment(null);
          }
        }}
      />

      <PaymentStatusModal
        payment={statusPayment}
        open={!!statusPayment}
        onOpenChange={(open) => !open && setStatusPayment(null)}
        onSuccess={() => {
          setStatusPayment(null);
          refetch();
        }}
      />

      <BulkPaymentModal
        membershipIds={selectedIds}
        open={isBulkModalOpen}
        onOpenChange={setIsBulkModalOpen}
        onSuccess={() => {
          setSelectedIds([]);
          setIsBulkModalOpen(false);
          refetch();
        }}
      />
    </>
  );
}
