"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, StarOff, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

export interface FilterPreset {
  id: string;
  name: string;
  chartRange: "monthly" | "average" | "thisWeek";
  historyRange: 1 | 3 | 6;
  createdAt: Date;
}

interface DashboardFilterPresetsProps {
  currentChartRange: "monthly" | "average" | "thisWeek";
  currentHistoryRange: 1 | 3 | 6;
  onApplyPreset: (preset: FilterPreset) => void;
}

const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: "default-1",
    name: "Monthly Overview",
    chartRange: "monthly",
    historyRange: 3,
    createdAt: new Date(),
  },
  {
    id: "default-2",
    name: "Weekly Snapshot",
    chartRange: "thisWeek",
    historyRange: 1,
    createdAt: new Date(),
  },
  {
    id: "default-3",
    name: "6-Month Trends",
    chartRange: "average",
    historyRange: 6,
    createdAt: new Date(),
  },
];

export function DashboardFilterPresets({
  currentChartRange,
  currentHistoryRange,
  onApplyPreset,
}: DashboardFilterPresetsProps) {
  const [presets, setPresets] = React.useState<FilterPreset[]>(() => {
    if (typeof window === "undefined") return DEFAULT_PRESETS;

    const saved = localStorage.getItem("dashboard-filter-presets");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...DEFAULT_PRESETS, ...parsed];
      } catch {
        return DEFAULT_PRESETS;
      }
    }
    return DEFAULT_PRESETS;
  });

  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [presetName, setPresetName] = React.useState("");

  const saveCurrentAsPreset = () => {
    if (!presetName.trim()) {
      toast.error("Please enter a preset name");
      return;
    }

    const newPreset: FilterPreset = {
      id: `custom-${Date.now()}`,
      name: presetName.trim(),
      chartRange: currentChartRange,
      historyRange: currentHistoryRange,
      createdAt: new Date(),
    };

    const customPresets = presets.filter((p) => p.id.startsWith("custom-"));
    const updatedCustomPresets = [...customPresets, newPreset];

    localStorage.setItem(
      "dashboard-filter-presets",
      JSON.stringify(updatedCustomPresets)
    );

    setPresets([...DEFAULT_PRESETS, ...updatedCustomPresets]);
    setShowSaveDialog(false);
    setPresetName("");

    toast.success(`Preset "${newPreset.name}" saved`);
  };

  const deletePreset = (id: string) => {
    if (id.startsWith("default-")) {
      toast.error("Cannot delete default presets");
      return;
    }

    const updatedPresets = presets.filter((p) => p.id !== id);
    const customPresets = updatedPresets.filter((p) => p.id.startsWith("custom-"));

    localStorage.setItem(
      "dashboard-filter-presets",
      JSON.stringify(customPresets)
    );

    setPresets(updatedPresets);
    toast.success("Preset deleted");
  };

  const applyPreset = (preset: FilterPreset) => {
    onApplyPreset(preset);
    toast.success(`Applied "${preset.name}" preset`);
  };

  const formatPresetDetails = (preset: FilterPreset) => {
    const chartRangeLabel =
      preset.chartRange === "monthly"
        ? "Monthly"
        : preset.chartRange === "average"
        ? "Average/Week"
        : "This Week";

    return `${chartRangeLabel} • ${preset.historyRange}mo`;
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-6 sm:h-7 touch-manipulation text-xs"
          >
            <Star className="h-3 w-3" />
            <span className="hidden sm:inline">Presets</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filter Presets</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {DEFAULT_PRESETS.map((preset) => (
            <DropdownMenuItem
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-sm">{preset.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatPresetDetails(preset)}
                </span>
              </div>
              <StarOff className="h-3 w-3 text-muted-foreground" />
            </DropdownMenuItem>
          ))}

          {presets.filter((p) => p.id.startsWith("custom-")).length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Custom Presets
              </DropdownMenuLabel>
              {presets
                .filter((p) => p.id.startsWith("custom-"))
                .map((preset) => (
                  <DropdownMenuItem
                    key={preset.id}
                    className="flex items-center justify-between cursor-pointer"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <div
                      className="flex flex-col gap-0.5 flex-1"
                      onClick={() => applyPreset(preset)}
                    >
                      <span className="font-medium text-sm">{preset.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatPresetDetails(preset)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePreset(preset.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </DropdownMenuItem>
                ))}
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowSaveDialog(true)}
            className="cursor-pointer text-primary"
          >
            <Save className="h-3 w-3 mr-2" />
            Save Current as Preset
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
            <DialogDescription>
              Save your current filter settings for quick access later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                placeholder="e.g., Q4 Analysis"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    saveCurrentAsPreset();
                  }
                }}
              />
            </div>

            <div className="rounded-lg border p-3 bg-muted/30">
              <div className="text-sm font-medium mb-2">Current Settings</div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>
                  Chart Range:{" "}
                  <span className="font-medium text-foreground">
                    {currentChartRange === "monthly"
                      ? "Monthly"
                      : currentChartRange === "average"
                      ? "Average / Week"
                      : "This Week"}
                  </span>
                </div>
                <div>
                  Historical Range:{" "}
                  <span className="font-medium text-foreground">
                    {currentHistoryRange} Month{currentHistoryRange > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveCurrentAsPreset}>Save Preset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
