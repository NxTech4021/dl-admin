"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  options: FilterOption[];
  placeholder?: string;
  allLabel?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

export function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
  allLabel = "All",
  className,
  triggerClassName,
  disabled = false,
}: FilterSelectProps) {
  const handleChange = (newValue: string) => {
    onChange(newValue === "all" ? undefined : newValue);
  };

  return (
    <Select
      value={value || "all"}
      onValueChange={handleChange}
      disabled={disabled}
    >
      <SelectTrigger className={cn("w-[160px]", triggerClassName, className)}>
        <SelectValue placeholder={placeholder || allLabel} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
