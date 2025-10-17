"use client";

import { useCallback, useEffect, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Category } from "../league/types";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { toast } from "sonner";
import { IconLoader2 } from "@tabler/icons-react";

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

interface EditCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onCategoryUpdated?: () => void;
  leagueId: string;
}

export function EditCategoryModal({
  open,
  onOpenChange,
  category,
  onCategoryUpdated,
  leagueId,
}: EditCategoryModalProps) {
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
        genderPrefix = `${gender.charAt(0)}${gender.slice(1).toLowerCase()}'s`;
      }
      const gameTypeSuffix = gameType.charAt(0) + gameType.slice(1).toLowerCase();
      return `${genderPrefix} ${gameTypeSuffix}`;
    },
    []
  );

  useEffect(() => {
    if (category) {
      const gender_category = category.genderRestriction === "OPEN" 
        ? "MIXED" 
        : category.genderRestriction === "MALE" 
          ? "MEN" 
          : "WOMEN";

      setFormData({
        name: category.name || "",
        matchFormat: category.matchFormat || "",
        game_type: category.game_type === "SINGLES" || category.game_type === "DOUBLES"
          ? category.game_type
          : "SINGLES",
        gender_category,
        isActive: category.isActive ?? true,
        categoryOrder: category.categoryOrder ?? 0,
      });
    }
  }, [category]);

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
    if (!category) return;
    setLoading(true);
    try {
      const genderRestriction =
        formData.gender_category === "MIXED"
          ? "OPEN"
          : formData.gender_category === "MEN"
          ? "MALE"
          : "FEMALE";

      await axiosInstance.put(endpoints.categories.update(category.id), {
        leagueIds: [leagueId],
        name: formData.name,
        genderRestriction,
        matchFormat: formData.matchFormat,
        game_type: formData.game_type,
        gender_category: formData.gender_category,
        isActive: formData.isActive,
        categoryOrder: formData.categoryOrder,
      });
      
      toast.success("Category updated!");
      onCategoryUpdated?.();
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Preview Card */}
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <h3 className="font-semibold text-lg mb-2">
              {formData.name || "Select options below"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {formData.matchFormat || "Enter match format below"}
            </p>
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

          {/* Match Format */}
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

          {/* Category Order and Status */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Category Order</Label>
              <Input
                type="number"
                value={formData.categoryOrder}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    categoryOrder: parseInt(e.target.value) || 0,
                  }))
                }
                className="h-11"
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-sm">Active</span>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: checked,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.name || !formData.matchFormat}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Update Category"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
