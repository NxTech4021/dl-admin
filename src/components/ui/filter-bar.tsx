"use client";

import * as React from "react";
import { IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
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
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-muted-foreground hover:text-foreground"
        >
          <IconX className="mr-2 size-4" />
          Clear filters
        </Button>
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
