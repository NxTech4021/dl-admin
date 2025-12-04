"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { IconSearch, IconX } from "@tabler/icons-react";
import { DisputeStatus, DisputePriority, DisputeCategory } from "@/constants/zod/dispute-schema";

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
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-wrap gap-3">
        {/* Search */}
        <div className="relative w-full md:w-64">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search disputes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={selectedStatus || "all"}
          onValueChange={(val) => onStatusChange(val === "all" ? undefined : val as DisputeStatus)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select
          value={selectedPriority || "all"}
          onValueChange={(val) => onPriorityChange(val === "all" ? undefined : val as DisputePriority)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="NORMAL">Normal</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={selectedCategory || "all"}
          onValueChange={(val) => onCategoryChange(val === "all" ? undefined : val as DisputeCategory)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="WRONG_SCORE">Wrong Score</SelectItem>
            <SelectItem value="NO_SHOW">No Show</SelectItem>
            <SelectItem value="BEHAVIOR">Behavior Issue</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasFilters && (
          <Button variant="ghost" size="icon" onClick={onClearFilters}>
            <IconX className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
