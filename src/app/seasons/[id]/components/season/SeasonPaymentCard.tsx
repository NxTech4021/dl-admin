"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { tableContainerVariants, tableRowVariants, fastTransition } from "@/lib/animation-variants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Membership } from "@/constants/zod/season-schema";
import {
  IconCreditCard,
  IconUsers,
  IconCircleCheck,
  IconClock,
  IconAlertTriangle,
  IconCurrencyDollar,
  IconInfoCircle,
  IconReceipt,
  IconSearch,
  IconX,
} from "@tabler/icons-react";

interface SeasonPaymentCardProps {
  memberships: Membership[];
  entryFee?: number | null;
  paymentRequired: boolean;
  seasonName: string;
}

type PaymentStatusFilter = "all" | "COMPLETED" | "PENDING" | "FAILED";

const FILTER_OPTIONS = [
  { value: "all", label: "All", icon: IconUsers },
  { value: "COMPLETED", label: "Paid", icon: IconCircleCheck },
  { value: "PENDING", label: "Pending", icon: IconClock },
  { value: "FAILED", label: "Failed", icon: IconAlertTriangle },
] as const;

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "N/A";
  return new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: "MYR",
  }).format(amount);
};

const getInitials = (name: string | null | undefined): string => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name: string): string => {
  const colors = [
    "bg-slate-600",
    "bg-zinc-600",
    "bg-stone-600",
    "bg-emerald-600",
    "bg-teal-600",
    "bg-cyan-600",
    "bg-sky-600",
    "bg-indigo-600",
    "bg-violet-600",
    "bg-fuchsia-600",
  ];
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getPaymentStatusBadge = (status: string | undefined) => {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
        >
          <IconCircleCheck className="size-3 mr-1" />
          Paid
        </Badge>
      );
    case "PENDING":
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800"
        >
          <IconClock className="size-3 mr-1" />
          Pending
        </Badge>
      );
    case "FAILED":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800"
        >
          <IconAlertTriangle className="size-3 mr-1" />
          Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Unknown
        </Badge>
      );
  }
};

const getMembershipStatusBadge = (status: string | undefined) => {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge variant="default" className="capitalize text-xs">
          Active
        </Badge>
      );
    case "PENDING":
      return (
        <Badge variant="secondary" className="capitalize text-xs">
          Pending
        </Badge>
      );
    case "INACTIVE":
      return (
        <Badge variant="outline" className="capitalize text-xs text-muted-foreground">
          Inactive
        </Badge>
      );
    case "FLAGGED":
      return (
        <Badge variant="destructive" className="capitalize text-xs">
          Flagged
        </Badge>
      );
    case "REMOVED":
      return (
        <Badge variant="outline" className="capitalize text-xs text-red-600 border-red-200">
          Removed
        </Badge>
      );
    case "WAITLISTED":
      return (
        <Badge variant="outline" className="capitalize text-xs text-amber-600 border-amber-200">
          Waitlisted
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="capitalize text-xs">
          {status?.toLowerCase() || "Unknown"}
        </Badge>
      );
  }
};

export default function SeasonPaymentCard({
  memberships,
  entryFee,
  paymentRequired,
  seasonName,
}: SeasonPaymentCardProps) {
  const [activeFilter, setActiveFilter] = useState<PaymentStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const stats = useMemo(() => {
    const total = memberships.length;
    const completed = memberships.filter((m) => m.paymentStatus === "COMPLETED").length;
    const pending = memberships.filter((m) => m.paymentStatus === "PENDING").length;
    const failed = memberships.filter((m) => m.paymentStatus === "FAILED").length;
    const revenue = entryFee ? completed * entryFee : 0;

    return { total, completed, pending, failed, revenue };
  }, [memberships, entryFee]);

  const filteredMemberships = useMemo(() => {
    let result = memberships;

    // Filter by payment status
    if (activeFilter !== "all") {
      result = result.filter((m) => m.paymentStatus === activeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((m) => {
        const name = m.user?.name?.toLowerCase() || "";
        const username = m.user?.username?.toLowerCase() || "";
        const email = m.user?.email?.toLowerCase() || "";
        return name.includes(query) || username.includes(query) || email.includes(query);
      });
    }

    return result;
  }, [memberships, activeFilter, searchQuery]);

  const getUsername = (user: Membership["user"]) => {
    if (!user) return "unknown";
    return (
      (user as Membership["user"] & { displayUsername?: string })?.displayUsername ||
      user.username ||
      user.email?.split("@")[0] ||
      "unknown"
    );
  };

  const getFilterCount = (filter: PaymentStatusFilter) => {
    switch (filter) {
      case "all":
        return stats.total;
      case "COMPLETED":
        return stats.completed;
      case "PENDING":
        return stats.pending;
      case "FAILED":
        return stats.failed;
    }
  };

  // Not payment required state
  if (!paymentRequired) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCreditCard className="size-5" />
            Payment Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-sky-50 border border-sky-200 dark:bg-sky-950/30 dark:border-sky-800">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/50">
              <IconInfoCircle className="size-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="font-medium text-sky-900 dark:text-sky-100">
                No Payment Required
              </p>
              <p className="text-sm text-sky-700 dark:text-sky-300">
                This season does not require payment for registration.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty memberships state
  if (memberships.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCreditCard className="size-5" />
            Payment Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <IconReceipt className="size-8 opacity-50" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">No payments yet</p>
                <p className="text-sm">
                  Payment records will appear here once players register for the season.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mobile card view for each membership
  const MobilePaymentCard = ({ membership }: { membership: Membership }) => (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      {/* Player Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 ring-2 ring-background">
            <AvatarImage src={membership.user?.image || undefined} />
            <AvatarFallback
              className={`text-white font-semibold text-xs ${getAvatarColor(
                membership.user?.name || "Unknown"
              )}`}
            >
              {getInitials(membership.user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">
              {membership.user?.name || "Unknown"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              @{getUsername(membership.user)}
            </p>
          </div>
        </div>
        {getPaymentStatusBadge(membership.paymentStatus)}
      </div>

      {/* Details Row */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-0.5">{getMembershipStatusBadge(membership.status)}</div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="text-sm font-medium tabular-nums mt-0.5">
              {formatCurrency(entryFee)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Joined</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {membership.joinedAt
              ? new Date(membership.joinedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "-"}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      {/* Header - Responsive */}
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <IconCreditCard className="size-5" />
          Payment Management
        </CardTitle>
        {entryFee && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border w-fit">
            <span className="text-sm text-muted-foreground">Entry Fee:</span>
            <span className="font-semibold text-sm">{formatCurrency(entryFee)}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Statistics - Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Total Registered */}
          <div className="rounded-lg border bg-card p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted">
                <IconUsers className="size-4 sm:size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">
                  {stats.total}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Registered</p>
              </div>
            </div>
          </div>

          {/* Paid */}
          <div className="rounded-lg border bg-card p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50">
                <IconCircleCheck className="size-4 sm:size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">
                  {stats.completed}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Paid</p>
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="rounded-lg border bg-card p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-50 dark:bg-amber-950/50">
                <IconClock className="size-4 sm:size-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">
                  {stats.pending}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>

          {/* Failed */}
          <div className="rounded-lg border bg-card p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-50 dark:bg-red-950/50">
                <IconAlertTriangle className="size-4 sm:size-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">
                  {stats.failed}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="rounded-lg border bg-card p-3 sm:p-4 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted">
                <IconCurrencyDollar className="size-4 sm:size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold truncate">
                  {entryFee ? formatCurrency(stats.revenue) : "N/A"}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Table Section */}
        <Tabs
          value={activeFilter}
          onValueChange={(v) => setActiveFilter(v as PaymentStatusFilter)}
        >
          {/* Search and Filter Row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <IconX className="size-4" />
                </button>
              )}
            </div>

            {/* Mobile: Dropdown Select */}
            <div className="md:hidden w-full sm:w-auto">
              <Select
                value={activeFilter}
                onValueChange={(v) => setActiveFilter(v as PaymentStatusFilter)}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue>
                    {(() => {
                      const currentFilter = FILTER_OPTIONS.find(f => f.value === activeFilter);
                      if (!currentFilter) return null;
                      const Icon = currentFilter.icon;
                      return (
                        <div className="flex items-center gap-2">
                          <Icon className="size-4" />
                          <span>{currentFilter.label} ({getFilterCount(activeFilter)})</span>
                        </div>
                      );
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {FILTER_OPTIONS.map((filter) => {
                    const Icon = filter.icon;
                    return (
                      <SelectItem key={filter.value} value={filter.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="size-4" />
                          <span>{filter.label} ({getFilterCount(filter.value as PaymentStatusFilter)})</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Desktop: Tab List */}
            <TabsList className="hidden md:grid grid-cols-4 w-auto">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="COMPLETED">Paid ({stats.completed})</TabsTrigger>
              <TabsTrigger value="PENDING">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="FAILED">Failed ({stats.failed})</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeFilter} className="mt-4">
            {filteredMemberships.length > 0 ? (
              <>
                {/* Mobile: Card View */}
                <div className="md:hidden space-y-3">
                  {filteredMemberships.map((membership) => (
                    <MobilePaymentCard key={membership.id} membership={membership} />
                  ))}
                </div>

                {/* Desktop: Table View */}
                <div className="hidden md:block overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[280px] text-left pl-4">Player</TableHead>
                        <TableHead className="w-[120px] text-left">Membership</TableHead>
                        <TableHead className="w-[140px] text-left">Payment Status</TableHead>
                        <TableHead className="w-[100px] text-left">Amount</TableHead>
                        <TableHead className="w-[120px] text-left pr-4">Join Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <motion.tbody
                      initial="hidden"
                      animate="visible"
                      variants={tableContainerVariants}
                    >
                      {filteredMemberships.map((membership) => (
                        <motion.tr
                          key={membership.id}
                          variants={tableRowVariants}
                          transition={fastTransition}
                          className="hover:bg-muted/30 border-b transition-colors"
                        >
                          <TableCell className="pl-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-9 ring-2 ring-background">
                                <AvatarImage src={membership.user?.image || undefined} />
                                <AvatarFallback
                                  className={`text-white font-semibold text-xs ${getAvatarColor(
                                    membership.user?.name || "Unknown"
                                  )}`}
                                >
                                  {getInitials(membership.user?.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {membership.user?.name || "Unknown"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  @{getUsername(membership.user)}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getMembershipStatusBadge(membership.status)}
                          </TableCell>
                          <TableCell>
                            {getPaymentStatusBadge(membership.paymentStatus)}
                          </TableCell>
                          <TableCell className="font-medium tabular-nums">
                            {formatCurrency(entryFee)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground pr-4">
                            {membership.joinedAt
                              ? new Date(membership.joinedAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "-"}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </Table>
                </div>
              </>
            ) : (
              <div className="rounded-lg border bg-muted/20 py-12">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <IconReceipt className="size-8 opacity-50" />
                  <p className="text-sm font-medium">No payments found</p>
                  <p className="text-xs text-center px-4">
                    {searchQuery
                      ? `No results for "${searchQuery}"${activeFilter !== "all" ? ` in ${activeFilter.toLowerCase()} payments` : ""}.`
                      : `No ${activeFilter === "all" ? "" : activeFilter.toLowerCase()} payments for this filter.`}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-xs text-primary hover:underline mt-1"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
