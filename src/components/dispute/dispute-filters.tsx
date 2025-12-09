"use client";

import { SearchInput } from "@/components/ui/search-input";
import { FilterBar } from "@/components/ui/filter-bar";
import { FilterSelect } from "@/components/ui/filter-select";
import { DisputeStatus, DisputePriority, DisputeCategory } from "@/constants/zod/dispute-schema";

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "REJECTED", label: "Rejected" },
];

const PRIORITY_OPTIONS = [
  { value: "URGENT", label: "Urgent" },
  { value: "HIGH", label: "High" },
  { value: "NORMAL", label: "Normal" },
  { value: "LOW", label: "Low" },
];

const CATEGORY_OPTIONS = [
  { value: "WRONG_SCORE", label: "Wrong Score" },
  { value: "NO_SHOW", label: "No Show" },
  { value: "BEHAVIOR", label: "Behavior Issue" },
  { value: "OTHER", label: "Other" },
];

interface DisputeFiltersProps {
  selectedStatus?: DisputeStatus;
  selectedPriority?: DisputePriority;
  selectedCategory?: DisputeCategory;
  searchQuery: string;
  onStatusChange: (status: DisputeStatus | undefined) => void;
  onPriorityChange: (priority: DisputePriority | undefined) => void;
  onCategoryChange: (category: DisputeCategory | undefined) => void;
  onSearchChange: (search: string) => void;
  onClearFilters: () => void;
}

export function DisputeFilters({
  selectedStatus,
  selectedPriority,
  selectedCategory,
  searchQuery,
  onStatusChange,
  onPriorityChange,
  onCategoryChange,
  onSearchChange,
  onClearFilters,
}: DisputeFiltersProps) {
  const hasFilters = selectedStatus || selectedPriority || selectedCategory || searchQuery;

  return (
    <FilterBar onClearAll={onClearFilters} showClearButton={!!hasFilters}>
      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search disputes..."
        className="w-full md:w-64"
      />

      <FilterSelect
        value={selectedStatus}
        onChange={(val) => onStatusChange(val as DisputeStatus | undefined)}
        options={STATUS_OPTIONS}
        allLabel="All Statuses"
        triggerClassName="w-[160px]"
      />

      <FilterSelect
        value={selectedPriority}
        onChange={(val) => onPriorityChange(val as DisputePriority | undefined)}
        options={PRIORITY_OPTIONS}
        allLabel="All Priorities"
        triggerClassName="w-[140px]"
      />

      <FilterSelect
        value={selectedCategory}
        onChange={(val) => onCategoryChange(val as DisputeCategory | undefined)}
        options={CATEGORY_OPTIONS}
        allLabel="All Categories"
        triggerClassName="w-[160px]"
      />
    </FilterBar>
  );
}
