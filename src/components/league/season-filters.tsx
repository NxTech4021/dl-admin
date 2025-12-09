"use client";

import { SearchInput } from "@/components/ui/search-input";
import { FilterBar } from "@/components/ui/filter-bar";
import { FilterSelect } from "@/components/ui/filter-select";

const STATUS_OPTIONS = [
  { value: "UPCOMING", label: "Upcoming" },
  { value: "ACTIVE", label: "Active" },
  { value: "FINISHED", label: "Finished" },
  { value: "CANCELLED", label: "Cancelled" },
];

interface SeasonFiltersProps {
  globalFilter: string;
  statusFilter: string;
  onGlobalFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  className?: string;
}

export function SeasonFilters({
  globalFilter,
  statusFilter,
  onGlobalFilterChange,
  onStatusFilterChange,
}: SeasonFiltersProps) {
  const handleClear = () => {
    onGlobalFilterChange("");
    onStatusFilterChange("all");
  };

  const hasFilters = !!globalFilter || statusFilter !== "all";

  return (
    <FilterBar onClearAll={handleClear} showClearButton={hasFilters}>
      <SearchInput
        value={globalFilter}
        onChange={onGlobalFilterChange}
        placeholder="Search seasons by name, sport type..."
        className="w-full md:w-64"
      />

      <FilterSelect
        value={statusFilter === "all" ? undefined : statusFilter}
        onChange={(val) => onStatusFilterChange(val || "all")}
        options={STATUS_OPTIONS}
        allLabel="All Statuses"
        triggerClassName="w-[160px]"
      />
    </FilterBar>
  );
}
