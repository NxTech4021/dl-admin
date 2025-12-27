"use client";

import * as React from "react";
import { IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  children: React.ReactNode;
  className?: string;
  onClearAll?: () => void;
  showClearButton?: boolean;
}

export function FilterBar({
  children,
  className,
  onClearAll,
  showClearButton = false,
}: FilterBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {children}
      {showClearButton && onClearAll && (
        <button
          onClick={onClearAll}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md border border-transparent hover:border-border transition-all cursor-pointer"
        >
          <IconX className="size-3.5" />
          <span>Clear</span>
        </button>
      )}
    </div>
  );
}

interface FilterGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function FilterGroup({ children, className }: FilterGroupProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
    </div>
  );
}
