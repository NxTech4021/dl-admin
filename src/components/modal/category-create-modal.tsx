"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import {
  IconCategory,
  IconLoader2,
  IconX,
  IconCheck,
  IconPlus,
  IconArrowLeft,
  IconArrowRight,
  IconSettings,
  IconUsers,
  IconUser,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { logger } from "@/lib/logger";

type GameType = "SINGLES" | "DOUBLES";
type GenderType = "MALE" | "FEMALE" | "MIXED" | "OPEN";
type GenderRestriction = "MALE" | "FEMALE" | "MIXED" | "OPEN";

const GAME_TYPE_OPTIONS: { value: GameType; label: string; icon: React.ReactNode }[] = [
  { value: "SINGLES", label: "Singles", icon: <IconUser className="size-4" /> },
  { value: "DOUBLES", label: "Doubles", icon: <IconUsers className="size-4" /> },
];

const GENDER_TYPE_OPTIONS: { value: GenderType; label: string }[] = [
  { value: "MALE", label: "Men's" },
  { value: "FEMALE", label: "Women's" },
  { value: "MIXED", label: "Mixed" },
  { value: "OPEN", label: "Open" },
];

// Zod schema for form validation
const categoryCreateSchema = z
  .object({
    gender_category: z.enum(["MALE", "FEMALE", "MIXED", "OPEN"], {
      message: "Gender is required",
    }),
    game_type: z.enum(["SINGLES", "DOUBLES"], {
      message: "Game type is required",
    }),
    matchFormat: z.string().min(1, "Match format is required"),
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    // Prevent Mixed Singles
    if (data.gender_category === "MIXED" && data.game_type === "SINGLES") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["game_type"],
        message: "Mixed Singles category is not allowed",
      });
    }
  });

// Use z.input for form field values (what the form handles)
// Use z.output for the validated/transformed output
type CategoryFormInput = z.input<typeof categoryCreateSchema>;
type CategoryFormOutput = z.output<typeof categoryCreateSchema>;

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
  const [currentStep, setCurrentStep] = useState<"form" | "preview">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Existing categories for duplicate checking
  const [existingCategories, setExistingCategories] = useState<
    Array<{
      id: string;
      name: string | null;
      gender_category: GenderType | null;
      game_type: GameType | null;
    }>
  >([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<CategoryFormInput, unknown, CategoryFormOutput>({
    resolver: zodResolver(categoryCreateSchema),
    mode: "onChange",
    defaultValues: {
      gender_category: undefined as unknown as GenderType,
      game_type: undefined as unknown as GameType,
      matchFormat: "",
      isActive: true,
    },
  });

  const formValues = watch();
  const genderCategory = watch("gender_category");
  const gameType = watch("game_type");

  // Generate category name from gender and game type
  const generateCategoryName = useCallback(
    (gender: GenderType | undefined, gameType: GameType | undefined): string => {
      if (!gender || !gameType) return "";

      let genderPrefix: string;
      if (gender === "MIXED") {
        genderPrefix = "Mixed";
      } else if (gender === "MALE") {
        genderPrefix = "Men's";
      } else if (gender === "OPEN") {
        genderPrefix = "Open";
      } else {
        genderPrefix = "Women's";
      }
      const gameTypeSuffix = gameType === "SINGLES" ? "Singles" : "Doubles";
      return `${genderPrefix} ${gameTypeSuffix}`;
    },
    []
  );

  // Auto-calculate gender restriction from gender category
  const getGenderRestriction = (
    genderCategory: GenderType | undefined
  ): GenderRestriction | undefined => {
    if (!genderCategory) return undefined;
    if (genderCategory === "MIXED") {
      return "MIXED";
    }
    return genderCategory as GenderRestriction;
  };

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
        .catch((err) => {
          logger.error("Error fetching categories:", err);
          setExistingCategories([]);
        })
        .finally(() => setCategoriesLoading(false));
    } else {
      setExistingCategories([]);
    }
  }, [open]);

  // Reset form when modal closes
  const resetModal = useCallback(() => {
    setCurrentStep("form");
    reset({
      gender_category: undefined as unknown as GenderType,
      game_type: undefined as unknown as GameType,
      matchFormat: "",
      isActive: true,
    });
    setError("");
  }, [reset]);

  useEffect(() => {
    if (!open) {
      resetModal();
    }
  }, [open, resetModal]);

  // Check if combination already exists globally
  const isDuplicateCombination = useCallback(
    (gender: GenderType | undefined, gameType: GameType | undefined): boolean => {
      if (!gender || !gameType) return false;

      return existingCategories.some(
        (category) =>
          category.gender_category === gender && category.game_type === gameType
      );
    },
    [existingCategories]
  );

  // Check if a specific combination is already used
  const isCombinationUsed = useCallback(
    (gender: GenderType, gameType: GameType): boolean => {
      return existingCategories.some(
        (category) =>
          category.gender_category === gender && category.game_type === gameType
      );
    },
    [existingCategories]
  );

  // Check if Mixed Singles combination
  const isMixedSingles = (
    gender: GenderType | undefined,
    gameType: GameType | undefined
  ): boolean => {
    return gender === "MIXED" && gameType === "SINGLES";
  };

  const handleGameTypeChange = (value: GameType) => {
    // Prevent Mixed Singles
    if (genderCategory && isMixedSingles(genderCategory, value)) {
      toast.error("Mixed Singles category is not allowed");
      return;
    }

    // Check for duplicate combination if gender is selected
    if (genderCategory && isCombinationUsed(genderCategory, value)) {
      toast.error(
        `A ${generateCategoryName(genderCategory, value)} category already exists`
      );
      return;
    }

    setValue("game_type", value, { shouldValidate: true });
  };

  const handleGenderChange = (value: GenderType) => {
    // If switching to MIXED and SINGLES is selected, reset game type
    const newGameType =
      value === "MIXED" && gameType === "SINGLES" ? undefined : gameType;

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

    setValue("gender_category", value, { shouldValidate: true });
    if (newGameType !== gameType) {
      setValue("game_type", newGameType as GameType, { shouldValidate: true });
    }
  };

  const handleNextToPreview = () => {
    if (isValid && !isDuplicateCombination(genderCategory, gameType)) {
      setCurrentStep("preview");
    }
  };

  const handleBackToForm = () => setCurrentStep("form");

  const onSubmit = async (data: CategoryFormOutput) => {
    // Final validation
    if (isMixedSingles(data.gender_category, data.game_type)) {
      toast.error("Mixed Singles category is not allowed");
      return;
    }

    if (isDuplicateCombination(data.gender_category, data.game_type)) {
      toast.error(
        `A ${generateCategoryName(data.gender_category, data.game_type)} category already exists`
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axiosInstance.post(endpoints.categories.create, {
        name: generateCategoryName(data.gender_category, data.game_type),
        genderRestriction: getGenderRestriction(data.gender_category),
        matchFormat: data.matchFormat,
        game_type: data.game_type,
        gender_category: data.gender_category,
        isActive: data.isActive,
        categoryOrder: 0,
      });

      toast.success("Category created successfully!");
      onOpenChange(false);
      if (onCategoryCreated) {
        await onCategoryCreated();
      }
      resetModal();
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to create category";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const categoryName = generateCategoryName(genderCategory, gameType);
  const hasDuplicate = isDuplicateCombination(genderCategory, gameType);
  const hasMixedSingles = isMixedSingles(genderCategory, gameType);
  const canProceed =
    isValid && !hasDuplicate && !hasMixedSingles && !categoriesLoading;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetModal();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border/50">
          <DialogHeader className="px-6 pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
                <IconCategory className="size-5 text-primary" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-lg font-semibold">
                  New Category
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Create a new category for your league
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Stepper */}
          <div className="px-6 pb-4">
            <div className="flex items-center gap-3">
              {/* Step 1 */}
              <button
                type="button"
                onClick={() => currentStep === "preview" && setCurrentStep("form")}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  currentStep === "form"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center size-5 rounded-full text-xs font-semibold",
                    currentStep === "form"
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                  )}
                >
                  {currentStep === "preview" ? (
                    <IconCheck className="size-3" />
                  ) : (
                    "1"
                  )}
                </span>
                Details
              </button>

              {/* Connector */}
              <div
                className={cn(
                  "flex-1 h-px max-w-[60px]",
                  currentStep === "preview" ? "bg-primary" : "bg-border"
                )}
              />

              {/* Step 2 */}
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium",
                  currentStep === "preview"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground"
                )}
              >
                <span className="size-5 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs">
                  2
                </span>
                Review
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Form Step */}
          {currentStep === "form" && (
            <form className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              {/* Category Type Section */}
              <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
                  <IconCategory className="size-4 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Category Type
                  </span>
                </div>
                <div className="p-3 space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    {/* Gender */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium flex items-center gap-1">
                        Gender
                        <span className="text-destructive">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="gender_category"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={handleGenderChange}
                          >
                            <SelectTrigger
                              className={cn(
                                "h-9",
                                errors.gender_category && "border-destructive"
                              )}
                            >
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              {GENDER_TYPE_OPTIONS.map((option) => {
                                const isMixedSinglesDisabled =
                                  option.value === "MIXED" && gameType === "SINGLES";
                                const isCombinationDisabled = gameType
                                  ? isCombinationUsed(option.value, gameType)
                                  : false;
                                const isDisabled =
                                  isMixedSinglesDisabled || isCombinationDisabled;
                                return (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    disabled={isDisabled}
                                    className={
                                      isDisabled ? "opacity-50 cursor-not-allowed" : ""
                                    }
                                  >
                                    <div className="flex items-center gap-2">
                                      {option.label}
                                      {isCombinationDisabled && gameType && (
                                        <span className="text-xs text-muted-foreground">
                                          (exists)
                                        </span>
                                      )}
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.gender_category && (
                        <p className="text-xs text-destructive">
                          {errors.gender_category.message}
                        </p>
                      )}
                    </div>

                    {/* Game Type */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium flex items-center gap-1">
                        Game Type
                        <span className="text-destructive">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="game_type"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={handleGameTypeChange}
                          >
                            <SelectTrigger
                              className={cn(
                                "h-9",
                                errors.game_type && "border-destructive"
                              )}
                            >
                              <SelectValue placeholder="Select game type" />
                            </SelectTrigger>
                            <SelectContent>
                              {GAME_TYPE_OPTIONS.map((option) => {
                                // Hide Singles if Mixed is selected
                                if (
                                  option.value === "SINGLES" &&
                                  genderCategory === "MIXED"
                                ) {
                                  return null;
                                }
                                const isCombinationDisabled = genderCategory
                                  ? isCombinationUsed(genderCategory, option.value)
                                  : false;
                                return (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    disabled={isCombinationDisabled}
                                    className={
                                      isCombinationDisabled
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }
                                  >
                                    <div className="flex items-center gap-2">
                                      {option.icon}
                                      {option.label}
                                      {isCombinationDisabled && genderCategory && (
                                        <span className="text-xs text-muted-foreground">
                                          (exists)
                                        </span>
                                      )}
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.game_type && (
                        <p className="text-xs text-destructive">
                          {errors.game_type.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Auto-generated Name Preview */}
                  {categoryName && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                      <span className="text-xs text-muted-foreground">
                        Category name:
                      </span>
                      <span className="text-sm font-medium">{categoryName}</span>
                    </div>
                  )}

                  {/* Duplicate Warning */}
                  {hasDuplicate && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
                      <IconX className="h-4 w-4 shrink-0" />
                      <span>
                        A {categoryName} category already exists. Please choose a
                        different combination.
                      </span>
                    </div>
                  )}

                  {/* Mixed Singles Warning */}
                  {hasMixedSingles && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
                      <IconX className="h-4 w-4 shrink-0" />
                      <span>Mixed Singles category is not allowed.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Match Format Section */}
              <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
                  <IconSettings className="size-4 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Match Settings
                  </span>
                </div>
                <div className="p-3 space-y-3">
                  {/* Match Format */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      Match Format
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      {...register("matchFormat")}
                      placeholder="e.g., Best of 3 sets"
                      className={cn(
                        "h-9",
                        errors.matchFormat && "border-destructive"
                      )}
                    />
                    {errors.matchFormat && (
                      <p className="text-xs text-destructive">
                        {errors.matchFormat.message}
                      </p>
                    )}
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-background">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "size-2 rounded-full transition-colors",
                          formValues.isActive
                            ? "bg-emerald-500"
                            : "bg-slate-300 dark:bg-slate-600"
                        )}
                      />
                      <Label
                        className="text-sm font-medium cursor-pointer"
                        htmlFor="isActive"
                      >
                        Active
                      </Label>
                    </div>
                    <Controller
                      control={control}
                      name="isActive"
                      render={({ field: { value, onChange } }) => (
                        <Switch
                          id="isActive"
                          checked={value}
                          onCheckedChange={onChange}
                          className="scale-90"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                  <IconX className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </form>
          )}

          {/* Preview Step */}
          {currentStep === "preview" && (
            <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
              {/* Header Section */}
              <div className="rounded-xl p-5 border border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shadow-sm border border-border/50">
                    <IconCategory className="size-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold tracking-tight">
                      {categoryName || "Category"}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      New category for your league
                    </p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="rounded-xl border border-border/50 divide-y divide-border/50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-muted/20">
                  <span className="text-sm text-muted-foreground">Gender</span>
                  <Badge variant="secondary">
                    {GENDER_TYPE_OPTIONS.find(
                      (opt) => opt.value === genderCategory
                    )?.label || "—"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-muted-foreground">Game Type</span>
                  <Badge variant="secondary" className="flex items-center gap-1.5">
                    {gameType === "SINGLES" ? (
                      <IconUser className="size-3" />
                    ) : (
                      <IconUsers className="size-3" />
                    )}
                    {GAME_TYPE_OPTIONS.find((opt) => opt.value === gameType)
                      ?.label || "—"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-muted/20">
                  <span className="text-sm text-muted-foreground">Match Format</span>
                  <span className="text-sm font-medium">
                    {formValues.matchFormat || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={cn(
                        "size-2 rounded-full",
                        formValues.isActive
                          ? "bg-emerald-500"
                          : "bg-slate-300 dark:bg-slate-600"
                      )}
                    />
                    <span className="text-sm font-medium">
                      {formValues.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                  <IconX className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border/50 px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            {currentStep === "form" ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleNextToPreview}
                  disabled={!canProceed || loading}
                  className="gap-2"
                >
                  Continue
                  <IconArrowRight className="size-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBackToForm}
                  disabled={loading}
                  className="gap-2 text-muted-foreground"
                >
                  <IconArrowLeft className="size-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={loading}
                  className="gap-2 min-w-[140px]"
                >
                  {loading ? (
                    <>
                      <IconLoader2 className="animate-spin size-4" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <IconPlus className="size-4" />
                      Create Category
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
