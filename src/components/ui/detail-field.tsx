"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DetailFieldProps {
  label: string;
  value: string | number | null | undefined | React.ReactNode;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  icon?: React.ReactNode;
}

function DetailField({
  label,
  value,
  className,
  labelClassName,
  valueClassName,
  icon,
}: DetailFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label
        className={cn(
          "text-sm font-medium text-muted-foreground flex items-center gap-2",
          labelClassName
        )}
      >
        {icon}
        {label}
      </Label>
      <div className={cn("text-sm font-medium", valueClassName)}>
        {value ?? "N/A"}
      </div>
    </div>
  );
}

export { DetailField };
export type { DetailFieldProps };
