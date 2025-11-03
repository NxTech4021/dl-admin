"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { toast } from "sonner";
import { IconLoader2 } from "@tabler/icons-react";

interface CreateCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leagueId: string;
  onCategoryCreated?: () => void;
}

type GameType = "SINGLES" | "DOUBLES";
type GenderType = "MEN" | "WOMEN" | "MIXED";

const GAME_TYPE_OPTIONS: { value: GameType; label: string }[] = [
  { value: "SINGLES", label: "Singles" },
  { value: "DOUBLES", label: "Doubles" },
];

const GENDER_OPTIONS: { value: GenderType; label: string }[] = [
  { value: "MEN", label: "Men" },
  { value: "WOMEN", label: "Women" },
  { value: "MIXED", label: "Mixed" },
];

interface CategoryFormData {
  name: string;
  matchFormat: string;
  game_type: GameType;
  gender_category: GenderType;
  isActive: boolean;
  categoryOrder: number;
}

export function CreateCategoryModal({
  open,
  onOpenChange,
  leagueId,
  onCategoryCreated,
}: CreateCategoryModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    matchFormat: "",
    game_type: "SINGLES",
    gender_category: "MIXED",
    isActive: true,
    categoryOrder: 0,
  });
  const [loading, setLoading] = useState(false);

  const generateCategoryName = useCallback(
    (gender: GenderType, gameType: GameType) => {
      let genderPrefix;
      if (gender === "MIXED") {
        genderPrefix = "Mixed";
      } else {
        // For MEN/WOMEN types (already in correct format)
        genderPrefix = `${gender.charAt(0)}${gender.slice(1).toLowerCase()}'s`;
      }
      // Game type should be plural: Singles, Doubles
      const gameTypeSuffix = gameType === "SINGLES" ? "Singles" : "Doubles";
      return `${genderPrefix} ${gameTypeSuffix}`;
    },
    []
  );

  const handleGameTypeChange = (value: GameType) => {
    setFormData((prev) => ({
      ...prev,
      game_type: value,
      name: generateCategoryName(prev.gender_category, value),
      
      matchFormat: prev.matchFormat,
    }));
  };

  const handleGenderChange = (value: GenderType) => {
    setFormData((prev) => ({
      ...prev,
      gender_category: value,
      name: generateCategoryName(value, prev.game_type),
    }));
  };

  const handleSubmit = async () => {
    if (!leagueId) {
      toast.error("League ID is missing");
      return;
    }
    setLoading(true);
    try {
      // Map gender_category to genderRestriction
      const genderRestriction =
        formData.gender_category === "MIXED"
          ? "OPEN"
          : formData.gender_category === "MEN"
          ? "MALE"
          : "FEMALE";

      await axiosInstance.post(endpoints.categories.create, {
        leagueIds: [leagueId],
        name: formData.name,
        genderRestriction,
        matchFormat: formData.matchFormat,
        game_type: formData.game_type,
        gender_category: formData.gender_category,
        isActive: formData.isActive,
        categoryOrder: formData.categoryOrder,
      });

      toast.success("Category created!");
      onCategoryCreated?.();
      onOpenChange(false);
      setFormData({
        name: "",
        matchFormat: "",
        game_type: "SINGLES",
        gender_category: "MIXED",
        isActive: true,
        categoryOrder: 0,
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Preview Card */}
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <h3 className="font-semibold text-lg mb-2">
              {formData.name || "Select options below"}
            </h3>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {formData.matchFormat || "Match format will be set automatically"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Gender Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="genderCategory">Gender Category</Label>
              <Select
                value={formData.gender_category}
                onValueChange={handleGenderChange}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select gender category" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Game Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="gameType">Game Type</Label>
              <Select
                value={formData.game_type}
                onValueChange={handleGameTypeChange}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select game type" />
                </SelectTrigger>
                <SelectContent>
                  {GAME_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Match Format *</Label>
            <Input
              value={formData.matchFormat}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  matchFormat: e.target.value,
                }))
              }
              placeholder="e.g., Best of 3 Sets, Pro Sets, etc."
              className="h-11"
            />
            <p className="text-sm text-muted-foreground">
              Specify the match format for this category
            </p>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            onClick={handleSubmit}
            disabled={
              loading ||
              !formData.name ||
              !formData.matchFormat
            }
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Category"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
