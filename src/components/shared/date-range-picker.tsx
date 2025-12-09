"use client";

import * as React from "react";
import { format, subDays, startOfMonth, endOfMonth, startOfYear, subMonths } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Predefined date range options
const dateRangePresets = [
  { label: "Today", getValue: () => ({ from: new Date(), to: new Date() }) },
  { label: "Yesterday", getValue: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) },
  { label: "Last 7 days", getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
  { label: "Last 14 days", getValue: () => ({ from: subDays(new Date(), 13), to: new Date() }) },
  { label: "Last 30 days", getValue: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
  { label: "Last 90 days", getValue: () => ({ from: subDays(new Date(), 89), to: new Date() }) },
  { label: "This month", getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: "Last month", getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
  { label: "This year", getValue: () => ({ from: startOfYear(new Date()), to: new Date() }) },
  { label: "Custom", getValue: () => null },
] as const;

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  align?: "start" | "center" | "end";
  showPresets?: boolean;
  disabled?: boolean;
  fromDate?: Date;
  toDate?: Date;
  numberOfMonths?: number;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select date range",
  className,
  align = "start",
  showPresets = true,
  disabled = false,
  fromDate,
  toDate = new Date(),
  numberOfMonths = 2,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedPreset, setSelectedPreset] = React.useState<string | undefined>();

  const handlePresetChange = (presetLabel: string) => {
    setSelectedPreset(presetLabel);

    if (presetLabel === "Custom") {
      return;
    }

    const preset = dateRangePresets.find(p => p.label === presetLabel);
    if (preset) {
      const range = preset.getValue();
      if (range) {
        onChange?.(range);
      }
    }
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    setSelectedPreset("Custom");
    onChange?.(range);
  };

  const formatDateRange = () => {
    if (!value?.from) {
      return placeholder;
    }

    if (value.to) {
      // Check if from and to are the same day
      if (format(value.from, "yyyy-MM-dd") === format(value.to, "yyyy-MM-dd")) {
        return format(value.from, "MMM d, yyyy");
      }
      return `${format(value.from, "MMM d, yyyy")} - ${format(value.to, "MMM d, yyyy")}`;
    }

    return format(value.from, "MMM d, yyyy");
  };

  const handleClear = () => {
    setSelectedPreset(undefined);
    onChange?.(undefined);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="date-range-picker"
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <div className="flex">
          {showPresets && (
            <div className="border-r p-3 w-[150px]">
              <Select value={selectedPreset} onValueChange={handlePresetChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select preset" />
                </SelectTrigger>
                <SelectContent>
                  {dateRangePresets.map((preset) => (
                    <SelectItem key={preset.label} value={preset.label}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-3 space-y-1">
                {dateRangePresets.slice(0, -1).map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start text-xs",
                      selectedPreset === preset.label && "bg-accent"
                    )}
                    onClick={() => handlePresetChange(preset.label)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="p-3">
            <Calendar
              mode="range"
              defaultMonth={value?.from}
              selected={value}
              onSelect={handleCalendarSelect}
              numberOfMonths={numberOfMonths}
              fromDate={fromDate}
              toDate={toDate}
            />
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={() => setOpen(false)}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Export types for external use
export type { DateRange };
