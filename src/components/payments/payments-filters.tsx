"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker, type DateRange } from "@/components/shared";
import {
  IconSearch,
  IconX,
  IconUsers,
  IconCircleCheck,
  IconClock,
  IconAlertTriangle,
} from "@tabler/icons-react";
import type { PaymentFilters, PaymentStatus } from "@/constants/zod/payment-schema";
import type { Season } from "@/constants/zod/season-schema";

interface PaymentsFiltersProps {
  filters: Partial<PaymentFilters>;
  seasons: Season[];
  onFilterChange: (filters: Partial<PaymentFilters>) => void;
}

type StatusFilter = PaymentStatus | "all";

const STATUS_OPTIONS: { value: StatusFilter; label: string; icon: React.ElementType }[] = [
  { value: "all", label: "All", icon: IconUsers },
  { value: "COMPLETED", label: "Paid", icon: IconCircleCheck },
  { value: "PENDING", label: "Pending", icon: IconClock },
  { value: "FAILED", label: "Failed", icon: IconAlertTriangle },
];

export function PaymentsFilters({
  filters,
  seasons,
  onFilterChange,
}: PaymentsFiltersProps) {
  const [searchValue, setSearchValue] = React.useState(filters.search ?? "");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    filters.startDate && filters.endDate
      ? { from: filters.startDate, to: filters.endDate }
      : undefined
  );

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFilterChange({ search: searchValue || undefined });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, filters.search, onFilterChange]);

  const handleStatusChange = React.useCallback(
    (value: StatusFilter) => {
      onFilterChange({
        status: value === "all" ? undefined : value,
      });
    },
    [onFilterChange]
  );

  const handleSeasonChange = React.useCallback(
    (value: string) => {
      onFilterChange({
        seasonId: value === "all" ? undefined : value,
      });
    },
    [onFilterChange]
  );

  const handleDateRangeChange = React.useCallback(
    (range: DateRange | undefined) => {
      setDateRange(range);
      onFilterChange({
        startDate: range?.from,
        endDate: range?.to,
      });
    },
    [onFilterChange]
  );

  const handleClearFilters = React.useCallback(() => {
    setSearchValue("");
    setDateRange(undefined);
    onFilterChange({
      search: undefined,
      seasonId: undefined,
      status: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  }, [onFilterChange]);

  const hasActiveFilters =
    !!filters.search ||
    !!filters.seasonId ||
    !!filters.status ||
    !!filters.startDate ||
    !!filters.endDate;

  const currentStatus: StatusFilter = filters.status ?? "all";

  return (
    <div className="space-y-4">
      {/* Main Filters Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or username..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <IconX className="size-4" />
            </button>
          )}
        </div>

        {/* Right side filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Season Filter */}
          <Select
            value={filters.seasonId ?? "all"}
            onValueChange={handleSeasonChange}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Seasons" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Seasons</SelectItem>
              {seasons.map((season) => (
                <SelectItem key={season.id} value={season.id}>
                  {season.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range Picker */}
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            placeholder="Date range"
          />

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-muted-foreground"
            >
              <IconX className="size-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Status Tabs - Desktop */}
      <div className="hidden md:block">
        <Tabs
          value={currentStatus}
          onValueChange={(v) => handleStatusChange(v as StatusFilter)}
        >
          <TabsList className="grid grid-cols-4 w-auto">
            {STATUS_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <TabsTrigger key={option.value} value={option.value} className="gap-1.5">
                  <Icon className="size-4" />
                  {option.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Status Select - Mobile */}
      <div className="md:hidden">
        <Select
          value={currentStatus}
          onValueChange={(v) => handleStatusChange(v as StatusFilter)}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(() => {
                const current = STATUS_OPTIONS.find((o) => o.value === currentStatus);
                if (!current) return null;
                const Icon = current.icon;
                return (
                  <div className="flex items-center gap-2">
                    <Icon className="size-4" />
                    <span>{current.label}</span>
                  </div>
                );
              })()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="size-4" />
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
