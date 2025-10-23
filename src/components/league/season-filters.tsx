"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconFilter, IconX } from "@tabler/icons-react";

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
  className = "",
}: SeasonFiltersProps) {
  const handleClear = () => {
    onGlobalFilterChange("");
    onStatusFilterChange("all");
  };

  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div className="flex flex-1 gap-2">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search seasons by name, sport type..."
            value={globalFilter}
            onChange={(event) => onGlobalFilterChange(event.target.value)}
            className="w-full"
          />
        </div>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[180px]">
            <IconFilter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="UPCOMING">Upcoming</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="FINISHED">Finished</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {(globalFilter || statusFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
          >
            <IconX className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
