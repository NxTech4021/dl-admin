"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { IconLoader2, IconX } from "@tabler/icons-react";
import { Trophy } from "lucide-react";
import axiosInstance, { endpoints } from "@/lib/endpoints";

type GameType = "SINGLES" | "DOUBLES";
type GenderType = "MALE" | "FEMALE" | "MIXED";
type GenderRestriction = "MALE" | "FEMALE" | "MIXED" | "OPEN";

const GAME_TYPE_OPTIONS: { value: GameType; label: string }[] = [
  { value: "SINGLES", label: "Singles" },
  { value: "DOUBLES", label: "Doubles" },
];

const GENDER_TYPE_OPTIONS: { value: GenderType; label: string }[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "MIXED", label: "Mixed" },
];

const GENDER_RESTRICTION_OPTIONS: { value: GenderRestriction; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "MALE", label: "Male Only" },
  { value: "FEMALE", label: "Female Only" },
  { value: "MIXED", label: "Mixed" },
];


interface CategoryFormData {
  name: string;
  matchFormat: string;
  game_type: GameType | "";
  gender_category: GenderType | "";
  genderRestriction: GenderRestriction | "";
  maxPlayers: number | null;
  maxTeams: number | null;
  isActive: boolean;
  categoryOrder: number;
}

interface CategoryCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated?: () => Promise<void>;
}

export default function CategoryCreateModal({
  open,
  onOpenChange,
  onCategoryCreated,
}: CategoryCreateModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    matchFormat: "",
    game_type: "",
    gender_category: "",
    genderRestriction: "",
    maxPlayers: null,
    maxTeams: null,
    isActive: true,
    categoryOrder: 0,
  });
  const [loading, setLoading] = useState(false);
  
  // Existing categories for duplicate checking (globally, not per league)
  const [existingCategories, setExistingCategories] = useState<Array<{
    id: string;
    name: string | null;
    gender_category: GenderType | null;
    game_type: GameType | null;
  }>>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Fetch all existing categories globally (for duplicate checking)
  useEffect(() => {
    if (open) {
      setCategoriesLoading(true);
      axiosInstance
        .get(endpoints.categories.getAll)
        .then((res) => {
          const result = res.data;
          const categoriesData = result?.data || result || [];
          setExistingCategories(Array.isArray(categoriesData) ? categoriesData : []);
        })
        .catch((error) => {
          console.error("Error fetching categories:", error);
          setExistingCategories([]);
        })
        .finally(() => setCategoriesLoading(false));
    } else {
      setExistingCategories([]);
    }
  }, [open]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        name: "",
        matchFormat: "",
        game_type: "",
        gender_category: "",
        genderRestriction: "",
        maxPlayers: null,
        maxTeams: null,
        isActive: true,
        categoryOrder: 0,
      });
    }
  }, [open]);

  const generateCategoryName = useCallback(
    (gender: GenderType | "", gameType: GameType | ""): string => {
      if (!gender || !gameType) return "";
      
      let genderPrefix: string;
      if (gender === "MIXED") {
        genderPrefix = "Mixed";
      } else if (gender === "MALE") {
        genderPrefix = "Men's";
      } else {
        // gender === "FEMALE"
        genderPrefix = "Women's";
      }
      // Game type should be plural: Singles, Doubles
      const gameTypeSuffix = gameType === "SINGLES" ? "Singles" : "Doubles";
      return `${genderPrefix} ${gameTypeSuffix}`;
    },
    []
  );

  // Auto-calculate gender restriction from gender category
  const getGenderRestriction = (genderCategory: GenderType | ""): GenderRestriction | "" => {
    if (!genderCategory) return "";
    if (genderCategory === "MIXED") {
      return "MIXED";
    }
    return genderCategory as GenderRestriction;
  };

  // Check if combination already exists globally
  const isDuplicateCombination = useCallback(
    (gender: GenderType | "", gameType: GameType | ""): boolean => {
      if (!gender || !gameType) return false;
      
      return existingCategories.some(
        (category) =>
          category.gender_category === gender &&
          category.game_type === gameType
      );
    },
    [existingCategories]
  );

  // Check if a specific gender option is already used with any game type
  const isGenderUsed = useCallback(
    (gender: GenderType): boolean => {
      return existingCategories.some(
        (category) => category.gender_category === gender
      );
    },
    [existingCategories]
  );

  // Check if a specific game type option is already used with any gender
  const isGameTypeUsed = useCallback(
    (gameType: GameType): boolean => {
      return existingCategories.some(
        (category) => category.game_type === gameType
      );
    },
    [existingCategories]
  );

  // Check if a specific combination is already used
  const isCombinationUsed = useCallback(
    (gender: GenderType, gameType: GameType): boolean => {
      return existingCategories.some(
        (category) =>
          category.gender_category === gender &&
          category.game_type === gameType
      );
    },
    [existingCategories]
  );

  // Check if Mixed Singles combination
  const isMixedSingles = (gender: GenderType | "", gameType: GameType | ""): boolean => {
    return gender === "MIXED" && gameType === "SINGLES";
  };

  const handleGameTypeChange = (value: GameType) => {
    // Prevent Mixed Singles
    if (formData.gender_category && isMixedSingles(formData.gender_category, value)) {
      toast.error("Mixed Singles category is not allowed");
      return;
    }

    // Check for duplicate combination if gender is selected
    if (formData.gender_category && isCombinationUsed(formData.gender_category, value)) {
      toast.error(
        `A ${generateCategoryName(formData.gender_category, value)} category already exists`
      );
      return;
    }

    setFormData((prev) => ({
      ...prev,
      game_type: value,
      name: prev.gender_category ? generateCategoryName(prev.gender_category, value) : "",
    }));
  };

  const handleGenderChange = (value: GenderType) => {
    // If switching to MIXED and SINGLES is selected, reset to empty
    const newGameType = value === "MIXED" && formData.game_type === "SINGLES" 
      ? "" 
      : formData.game_type;

    // Prevent Mixed Singles
    if (newGameType && isMixedSingles(value, newGameType)) {
      toast.error("Mixed Singles category is not allowed");
      return;
    }

    // Check for duplicate combination if game type is selected
    if (newGameType && isCombinationUsed(value, newGameType)) {
      toast.error(
        `A ${generateCategoryName(value, newGameType)} category already exists`
      );
      return;
    }

    setFormData((prev) => ({
      ...prev,
      gender_category: value,
      genderRestriction: getGenderRestriction(value),
      game_type: newGameType,
      name: newGameType ? generateCategoryName(value, newGameType) : "",
    }));
  };

  const handleSubmit = async () => {
    if (!formData.gender_category || !formData.game_type || !formData.matchFormat) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate Mixed Singles
    if (isMixedSingles(formData.gender_category, formData.game_type)) {
      toast.error("Mixed Singles category is not allowed");
      return;
    }

    // Validate duplicate combination
    if (isDuplicateCombination(formData.gender_category, formData.game_type)) {
      toast.error(
        `A ${formData.name} category already exists. Please choose a different combination.`
      );
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(endpoints.categories.create, {
        name: formData.name,
        genderRestriction: formData.genderRestriction,
        matchFormat: formData.matchFormat,
        game_type: formData.game_type,
        gender_category: formData.gender_category,
        maxPlayers: formData.maxPlayers,
        maxTeams: formData.maxTeams,
        isActive: formData.isActive,
        categoryOrder: formData.categoryOrder,
      });

      toast.success("Category created successfully!");
      onOpenChange(false);
      if (onCategoryCreated) {
        await onCategoryCreated();
      }
      
      // Reset form
      setFormData({
        name: "",
        matchFormat: "",
        game_type: "",
        gender_category: "",
        genderRestriction: "",
        maxPlayers: null,
        maxTeams: null,
        isActive: true,
        categoryOrder: 0,
      });
    } catch (err: any) {
      console.error("Error creating category:", err);
      toast.error(err.response?.data?.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-3 pr-12">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Trophy className="h-4 w-4 text-primary" />
            Create Category
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="space-y-3">
            {/* Minimal Preview */}
            <div className="border rounded-lg p-3 bg-muted/30">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1.5 truncate">
                    {formData.name || "Category name"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {formData.gender_category && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                        {GENDER_TYPE_OPTIONS.find(opt => opt.value === formData.gender_category)?.label}
                      </Badge>
                    )}
                    {formData.game_type && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                        {GAME_TYPE_OPTIONS.find(opt => opt.value === formData.game_type)?.label}
                      </Badge>
                    )}
                    {formData.matchFormat && (
                      <span className="text-muted-foreground">· {formData.matchFormat}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Category Settings */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="genderCategory" className="text-xs">Gender *</Label>
                <Select
                  value={formData.gender_category || undefined}
                  onValueChange={handleGenderChange}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_TYPE_OPTIONS.map((option) => {
                      // Disable Mixed if Singles is selected
                      const isMixedSinglesDisabled = option.value === "MIXED" && formData.game_type === "SINGLES";
                      // Disable if this gender is already used with the selected game type
                      const isCombinationDisabled = formData.game_type 
                        ? isCombinationUsed(option.value, formData.game_type)
                        : false;
                      const isDisabled = isMixedSinglesDisabled || isCombinationDisabled;
                      return (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                          disabled={isDisabled}
                          className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          {option.label}
                          {isCombinationDisabled && formData.game_type && (
                            <span className="ml-2 text-xs text-muted-foreground">(already exists)</span>
                          )}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {formData.gender_category && formData.game_type && isMixedSingles(formData.gender_category, formData.game_type) && (
                  <p className="text-xs text-destructive mt-1">
                    Mixed Singles category is not allowed
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="gameType" className="text-xs">Game Type *</Label>
                <Select
                  value={formData.game_type || undefined}
                  onValueChange={handleGameTypeChange}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select game type" />
                  </SelectTrigger>
                  <SelectContent>
                    {GAME_TYPE_OPTIONS.map((option) => {
                      // Hide Singles if Mixed is selected
                      if (option.value === "SINGLES" && formData.gender_category === "MIXED") {
                        return null;
                      }
                      // Disable if this game type is already used with the selected gender
                      const isCombinationDisabled = formData.gender_category 
                        ? isCombinationUsed(formData.gender_category, option.value)
                        : false;
                      return (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                          disabled={isCombinationDisabled}
                          className={isCombinationDisabled ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          {option.label}
                          {isCombinationDisabled && formData.gender_category && (
                            <span className="ml-2 text-xs text-muted-foreground">(already exists)</span>
                          )}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {formData.gender_category && formData.game_type && isMixedSingles(formData.gender_category, formData.game_type) && (
                  <p className="text-xs text-destructive mt-1">
                    Mixed Singles category is not allowed
                  </p>
                )}
              </div>
            </div>

            {/* Duplicate Warning */}
            {formData.gender_category && formData.game_type && isDuplicateCombination(formData.gender_category, formData.game_type) && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
                <IconX className="h-3.5 w-3.5 shrink-0" />
                <span>
                  A {formData.name || generateCategoryName(formData.gender_category, formData.game_type)} category already exists. Please choose a different combination.
                </span>
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="matchFormat" className="text-xs">Match Format *</Label>
              <Input
                id="matchFormat"
                value={formData.matchFormat}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    matchFormat: e.target.value,
                  }))
                }
                placeholder="e.g., Best of 3"
                className="h-9"
              />
            </div>

            {/* Max Players and Max Teams */}
            {/* <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="maxPlayers" className="text-xs">Max Players</Label>
                <Input
                  id="maxPlayers"
                  type="number"
                  value={formData.maxPlayers || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxPlayers: e.target.value ? parseInt(e.target.value) : null,
                    }))
                  }
                  placeholder="Unlimited"
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="maxTeams" className="text-xs">Max Teams</Label>
                <Input
                  id="maxTeams"
                  type="number"
                  value={formData.maxTeams || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxTeams: e.target.value ? parseInt(e.target.value) : null,
                    }))
                  }
                  placeholder="Unlimited"
                  className="h-9"
                />
              </div>
            </div> */}

            {/* Status */}
            <div className="flex items-center justify-between p-2 border rounded-md">
              <Label htmlFor="isActive" className="text-xs font-medium cursor-pointer">
                Active
              </Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: checked,
                  }))
                }
                className="scale-75"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 px-6 pt-4 pb-6 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            size="sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              loading ||
              !formData.gender_category ||
              !formData.game_type ||
              !formData.matchFormat ||
              isMixedSingles(formData.gender_category, formData.game_type) ||
              isDuplicateCombination(formData.gender_category, formData.game_type)
            }
            size="sm"
          >
            {loading ? (
              <>
                <IconLoader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Trophy className="mr-1.5 h-3.5 w-3.5" />
                Create
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

