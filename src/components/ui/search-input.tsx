"use client";

import * as React from "react";
import { IconSearch, IconX } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  showClearButton?: boolean;
}

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  className,
  inputClassName,
  showClearButton = true,
  ...props
}: SearchInputProps) {
  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  return (
    <div className={cn("relative", className)}>
      <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("pl-9 pr-9", inputClassName)}
        {...props}
      />
      {showClearButton && value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 size-7 text-muted-foreground hover:text-foreground"
          onClick={handleClear}
        >
          <IconX className="size-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
}
