"use client";
import React, { useEffect, useState } from "react";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  IconCategory,
  IconArrowLeft,
  IconArrowRight,
  IconLoader2,
  IconX,
  IconUsers,
  IconUser,
  IconTrophy,
  IconChartBar,
  IconSparkles,
  IconSettings,
  IconCalendarEvent,
  IconForms,
  IconLayersSubtract,
  IconCheck,
  IconPlus,
  IconPencil,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/use-notifications";

type DivisionBase = {
  id: string;
  seasonId: string;
  name: string;
  description?: string | null;
  threshold?: number | null;
  divisionLevel: "beginner" | "improver" | "intermediate" | "upper_intermediate" | "expert" | "advanced";
  gameType: "singles" | "doubles";
  genderCategory?: "male" | "female" | "mixed" | null;
  maxSingles?: number | null;
  maxDoublesTeams?: number | null;
  autoAssignmentEnabled?: boolean;
  isActive?: boolean;
  prizePoolTotal?: number | null;
  sponsoredDivisionName?: string | null;
};

type SeasonWithCategory = {
  id: string;
  name: string;
  category?: {
    id: string;
    name: string | null;
    game_type?: "SINGLES" | "DOUBLES" | string | null;
    gender_category?: "MALE" | "FEMALE" | "MIXED" | string | null;
    genderCategory?: string | null;
    gameType?: string | null;
  } | null;
};

type DivisionCreateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
  onDivisionCreated?: () => void;
  mode?: "create" | "edit";
  division?: DivisionBase | null;
  seasonId?: string;
  adminId?: string;
  /** Pass the season object to auto-populate and lock fields when creating from Season Detail page */
  season?: SeasonWithCategory | null;
};

const divisionSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    seasonId: z.string().min(1, "Select a season"),
    divisionLevel: z.enum(["beginner", "improver", "intermediate", "upper_intermediate", "expert", "advanced"]),
    gameType: z.enum(["singles", "doubles"]),
    genderCategory: z.enum(["male", "female", "mixed"]),
    maxSinglesPlayers: z.preprocess((val) => {
      if (
        val === undefined ||
        val === null ||
        val === "" ||
        Number.isNaN(val)
      ) {
        return null;
      }
      const num = typeof val === "string" ? Number(val) : val;
      return Number.isNaN(num) ? null : num;
    }, z.number().int().positive().nullable().optional()),
    maxDoublesTeams: z.preprocess((val) => {
      if (
        val === undefined ||
        val === null ||
        val === "" ||
        Number.isNaN(val)
      ) {
        return null;
      }
      const num = typeof val === "string" ? Number(val) : val;
      return Number.isNaN(num) ? null : num;
    }, z.number().int().positive().nullable().optional()),
    autoAssignmentEnabled: z.boolean().default(false).optional(),
    isActive: z.boolean().default(true).optional(),
    prizePoolTotal: z.preprocess((val) => {
      if (
        val === undefined ||
        val === null ||
        val === "" ||
        Number.isNaN(val)
      ) {
        return null;
      }
      const num = typeof val === "string" ? Number(val) : val;
      return Number.isNaN(num) ? null : num;
    }, z.number().int().nonnegative().nullable().optional()),
    sponsorName: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    threshold: z.preprocess((val) => {
      if (
        val === undefined ||
        val === null ||
        val === "" ||
        Number.isNaN(val)
      ) {
        return null;
      }
      const num = typeof val === "string" ? Number(val) : val;
      return Number.isNaN(num) ? null : num;
    }, z.number().int().nonnegative().nullable().optional()),
  })
  .superRefine((val, ctx) => {
    if (val.gameType === "singles") {
      if (!val.maxSinglesPlayers || val.maxSinglesPlayers === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maxSinglesPlayers"],
          message: "Max singles players is required for singles game type",
        });
      }
    }
    if (val.gameType === "doubles") {
      if (!val.maxDoublesTeams || val.maxDoublesTeams === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maxDoublesTeams"],
          message: "Max doubles teams is required for doubles game type",
        });
      }
    }
  });

type DivisionFormValues = z.infer<typeof divisionSchema>;

/** Get level-specific styling */
const getLevelStyles = (level: string | null | undefined) => {
  switch (level?.toLowerCase()) {
    case "beginner":
      return {
        badge: "text-sky-700 bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800",
        accent: "bg-sky-500",
        bg: "bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-950/30 dark:to-sky-900/20",
        iconBg: "bg-sky-100 dark:bg-sky-900/50",
        iconColor: "text-sky-600 dark:text-sky-400",
      };
    case "improver":
      return {
        badge: "text-teal-700 bg-teal-50 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800",
        accent: "bg-teal-500",
        bg: "bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-950/30 dark:to-teal-900/20",
        iconBg: "bg-teal-100 dark:bg-teal-900/50",
        iconColor: "text-teal-600 dark:text-teal-400",
      };
    case "intermediate":
      return {
        badge: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
        accent: "bg-amber-500",
        bg: "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20",
        iconBg: "bg-amber-100 dark:bg-amber-900/50",
        iconColor: "text-amber-600 dark:text-amber-400",
      };
    case "upper_intermediate":
      return {
        badge: "text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800",
        accent: "bg-orange-500",
        bg: "bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20",
        iconBg: "bg-orange-100 dark:bg-orange-900/50",
        iconColor: "text-orange-600 dark:text-orange-400",
      };
    case "expert":
      return {
        badge: "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
        accent: "bg-rose-500",
        bg: "bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-rose-900/20",
        iconBg: "bg-rose-100 dark:bg-rose-900/50",
        iconColor: "text-rose-600 dark:text-rose-400",
      };
    case "advanced":
      return {
        badge: "text-violet-700 bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800",
        accent: "bg-violet-500",
        bg: "bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/30 dark:to-violet-900/20",
        iconBg: "bg-violet-100 dark:bg-violet-900/50",
        iconColor: "text-violet-600 dark:text-violet-400",
      };
    default:
      return {
        badge: "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700",
        accent: "bg-slate-500",
        bg: "bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/30 dark:to-slate-800/20",
        iconBg: "bg-slate-100 dark:bg-slate-800",
        iconColor: "text-slate-600 dark:text-slate-400",
      };
  }
};

/** Format level label */
const formatLevel = (level: string | null | undefined): string => {
  if (!level) return "Unknown";
  const labels: Record<string, string> = {
    beginner: "Beginner",
    improver: "Improver",
    intermediate: "Intermediate",
    upper_intermediate: "Upper Intermediate",
    expert: "Expert",
    advanced: "Advanced",
  };
  return labels[level.toLowerCase()] || level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
};

/** Format game type label */
const formatGameType = (gameType: string | null | undefined): string => {
  if (!gameType) return "Unknown";
  return gameType.charAt(0).toUpperCase() + gameType.slice(1).toLowerCase();
};

/** Format gender category */
const formatGender = (gender: string | null | undefined): string => {
  if (!gender) return "Open";
  switch (gender.toLowerCase()) {
    case "male": return "Men's";
    case "female": return "Women's";
    case "mixed": return "Mixed";
    default: return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  }
};

export default function DivisionCreateModal({
  open,
  onOpenChange,
  children,
  onDivisionCreated,
  mode = "create",
  division,
  seasonId,
  adminId,
  season: passedSeason,
}: DivisionCreateModalProps) {
  const [currentStep, setCurrentStep] = useState<"form" | "preview">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [seasons, setSeasons] = useState<
    Array<{
      id: string;
      name: string;
      category?: {
        id: string;
        name: string | null;
        game_type?: "SINGLES" | "DOUBLES" | null;
        gender_category?: "MALE" | "FEMALE" | "MIXED" | null;
        gameType?: string | null;
        genderCategory?: string | null;
      } | null;
      categories?: Array<{
        id: string;
        name: string | null;
        game_type?: "SINGLES" | "DOUBLES" | null;
        gender_category?: "MALE" | "FEMALE" | "MIXED" | null;
        gameType?: string | null;
        genderCategory?: string | null;
      }>;
    }>
  >([]);

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm<DivisionFormValues>({
    resolver: zodResolver(divisionSchema as any),
    mode: "onChange",
    defaultValues: {
      name: "",
      seasonId: seasonId || "",
      divisionLevel: "beginner",
      gameType: "singles",
      genderCategory: "male",
      maxSinglesPlayers: undefined,
      maxDoublesTeams: undefined,
      autoAssignmentEnabled: false,
      isActive: true,
      prizePoolTotal: undefined,
      sponsorName: "",
      description: "",
      threshold: undefined,
    },
  });

  const gameType = watch("gameType");
  const formValues = watch();
  const isEditMode = mode === "edit";
  const selectedSeasonId = watch("seasonId");
  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId);

  // Determine if season dropdown should be locked (when creating from Season Detail page)
  const isSeasonLocked = Boolean(seasonId && !isEditMode);

  // Use passed season data if available, otherwise use fetched season data
  const effectiveSeason = passedSeason || selectedSeason;

  // Get category from either category (singular) or first item in categories array
  const seasonCategory =
    effectiveSeason?.category ||
    (selectedSeason?.categories && selectedSeason.categories.length > 0
      ? selectedSeason.categories[0]
      : null);
  const hasCategory = Boolean(
    seasonCategory?.game_type || seasonCategory?.gameType
  ) && Boolean(
    seasonCategory?.gender_category || seasonCategory?.genderCategory
  );

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const res = await axiosInstance.get(endpoints.season.getAll);
        // Handle ApiResponse structure: { success, status, data, message }
        // The actual seasons array is in res.data.data
        let seasonsData: any[] = [];
        
        if (Array.isArray(res.data)) {
          // Direct array response (shouldn't happen with ApiResponse, but handle it)
          seasonsData = res.data;
        } else if (res.data?.data && Array.isArray(res.data.data)) {
          // ApiResponse structure: data.data contains the seasons array
          seasonsData = res.data.data;
        } else if (res.data?.seasons && Array.isArray(res.data.seasons)) {
          // Fallback: check for res.data.seasons
          seasonsData = res.data.seasons;
        } else {
          seasonsData = [];
        }

        setSeasons(seasonsData);
      } catch {
        setSeasons([]);
      }
    };

    if (open) fetchSeasons();
  }, [open]);

  const resetModal = React.useCallback(() => {
    setCurrentStep("form");
    reset({
      name: "",
      seasonId: seasonId || "",
      divisionLevel: "beginner",
      gameType: "singles",
      genderCategory: "male",
      maxSinglesPlayers: undefined,
      maxDoublesTeams: undefined,
      autoAssignmentEnabled: false,
      isActive: true,
      prizePoolTotal: undefined,
      sponsorName: "",
      description: "",
      threshold: undefined,
    });
    setError("");
  }, [reset, seasonId]);

  // Auto-fill gameType and genderCategory when season is selected or passed
  useEffect(() => {
    // Use passed season if available, otherwise use selected season from dropdown
    const seasonToUse = passedSeason || selectedSeason;
    if (!selectedSeasonId || !seasonToUse) return;

    // Get category from either category (singular) or first item in categories array
    const category =
      seasonToUse?.category ||
      (selectedSeason?.categories && selectedSeason.categories.length > 0
        ? selectedSeason.categories[0]
        : null);

    // Handle both snake_case (game_type, gender_category) and camelCase (gameType, genderCategory) field names
    const gameTypeValue = category?.game_type || category?.gameType;
    const genderCategoryValue = category?.gender_category || category?.genderCategory;

    if (gameTypeValue && genderCategoryValue) {
      const gameTypeLower = gameTypeValue.toLowerCase() as
        | "singles"
        | "doubles";
      const genderCategoryLower =
        genderCategoryValue.toLowerCase() as
          | "male"
          | "female"
          | "mixed";

      setValue("gameType", gameTypeLower);
      setValue("genderCategory", genderCategoryLower);
      trigger(["gameType", "genderCategory"]);
    }
  }, [selectedSeasonId, selectedSeason, passedSeason, setValue, trigger]);

  useEffect(() => {
    if (open && isEditMode && division) {
      setCurrentStep("form");
      reset({
        name: division.name ?? "",
        seasonId: division.seasonId ?? "",
        divisionLevel: division.divisionLevel ?? "beginner",
        gameType: division.gameType ?? "singles",
        genderCategory:
          (division.genderCategory as DivisionFormValues["genderCategory"]) ??
          "male",
        maxSinglesPlayers:
          division.maxSingles !== undefined && division.maxSingles !== null
            ? division.maxSingles
            : undefined,
        maxDoublesTeams:
          division.maxDoublesTeams !== undefined &&
          division.maxDoublesTeams !== null
            ? division.maxDoublesTeams
            : undefined,
        autoAssignmentEnabled: Boolean(division.autoAssignmentEnabled),
        isActive: division.isActive !== undefined ? division.isActive : true,
        prizePoolTotal:
          division.prizePoolTotal !== undefined &&
          division.prizePoolTotal !== null
            ? Number(division.prizePoolTotal)
            : undefined,
        sponsorName: division.sponsoredDivisionName ?? "",
        description: division.description ?? "",
        threshold:
          division.threshold !== undefined && division.threshold !== null
            ? division.threshold
            : undefined,
      });
    }
    if (!open) {
      resetModal();
    }
  }, [open, isEditMode, division, resetModal, reset]);

  const handleNextToPreview = async () => {
    const valid = await trigger();
    if (valid) {
      setCurrentStep("preview");
    } else {
      // Show specific validation errors
      const errorMessages = Object.values(errors)
        .map((error: any) => error?.message)
        .filter(Boolean);
      if (errorMessages.length > 0) {
        toast.error(
          errorMessages[0] || "Please fix form errors before previewing."
        );
      } else {
        toast.error("Please fix form errors before previewing.");
      }
    }
  };

  const handleBackToForm = () => setCurrentStep("form");

  const { refresh: refreshNotifications } = useNotifications();

  const onSubmit = async (data: DivisionFormValues) => {
    setLoading(true);
    setError("");
    try {
      const payload: any = {
        name: data.name,
        seasonId: data.seasonId,
        adminId: adminId,
        divisionLevel: data.divisionLevel,
        gameType: data.gameType,
        genderCategory: data.genderCategory,
        autoAssignmentEnabled: Boolean(data.autoAssignmentEnabled),
        isActive: Boolean(data.isActive),
      };

      const toNumberOrNull = (value: unknown) => {
        if (value === undefined || value === null || value === "") {
          return null;
        }
        const parsed = Number(value);
        return Number.isNaN(parsed) ? null : parsed;
      };

      payload.maxSinglesPlayers = toNumberOrNull(data.maxSinglesPlayers);
      payload.maxDoublesTeams = toNumberOrNull(data.maxDoublesTeams);
      payload.prizePoolTotal = toNumberOrNull(data.prizePoolTotal);
      payload.threshold = toNumberOrNull(data.threshold);
      payload.sponsorName =
        data.sponsorName && data.sponsorName.trim().length > 0
          ? data.sponsorName.trim()
          : null;
      payload.description =
        data.description && data.description.trim().length > 0
          ? data.description.trim()
          : null;

      let res;
      if (isEditMode && division) {
        res = await axiosInstance.put(
          endpoints.division.update(division.id),
          payload
        );
        toast.success(res.data?.message ?? "Division updated");
      } else {
        res = await axiosInstance.post(endpoints.division.create, payload);
        toast.success(res.data?.message ?? "Division created");
      }

      onDivisionCreated?.();
      refreshNotifications();
      resetModal();
      onOpenChange(false);
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to create division";
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetModal();
        onOpenChange(isOpen);
      }}
    >
      {children}
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border/50">
          <DialogHeader className="px-6 pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center justify-center size-10 rounded-xl",
                isEditMode
                  ? "bg-amber-100 dark:bg-amber-900/30"
                  : "bg-primary/10"
              )}>
                {isEditMode ? (
                  <IconPencil className="size-5 text-amber-600 dark:text-amber-400" />
                ) : (
                  <IconPlus className="size-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <DialogTitle className="text-lg font-semibold">
                  {isEditMode ? "Edit Division" : "New Division"}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {isEditMode
                    ? "Update division settings and configuration"
                    : "Create a new division for your season"}
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
                <span className={cn(
                  "flex items-center justify-center size-5 rounded-full text-xs font-semibold",
                  currentStep === "form"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : currentStep === "preview"
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                    : "bg-muted-foreground/20 text-muted-foreground"
                )}>
                  {currentStep === "preview" ? (
                    <IconCheck className="size-3" />
                  ) : (
                    "1"
                  )}
                </span>
                Details
              </button>

              {/* Connector */}
              <div className={cn(
                "flex-1 h-px max-w-[60px]",
                currentStep === "preview" ? "bg-primary" : "bg-border"
              )} />

              {/* Step 2 */}
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  currentStep === "preview"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground"
                )}
              >
                <span className={cn(
                  "flex items-center justify-center size-5 rounded-full text-xs font-semibold",
                  currentStep === "preview"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted-foreground/20 text-muted-foreground"
                )}>
                  2
                </span>
                Review
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* Form */}
          {currentStep === "form" && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              {/* Basic Information Section */}
              <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
                  <IconForms className="size-4 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Basic Information
                  </span>
                </div>
                <div className="p-3 space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1">
                        Division Name
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        {...register("name")}
                        className={cn(
                          "h-9",
                          errors.name && "border-destructive focus-visible:ring-destructive"
                        )}
                        placeholder="e.g., Division A"
                      />
                      {errors.name && (
                        <p className="text-xs text-destructive">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium flex items-center gap-1">
                        <IconCalendarEvent className="size-3.5" />
                        Season
                        <span className="text-destructive">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="seasonId"
                        render={({
                          field,
                        }: {
                          field: {
                            value: string;
                            onChange: (value: string) => void;
                          };
                        }) => (
                          <Select
                            value={field.value}
                            onValueChange={(val) => field.onChange(val)}
                            disabled={isSeasonLocked}
                          >
                            <SelectTrigger
                              className={cn(
                                "h-9 w-full",
                                isSeasonLocked && "opacity-60 cursor-not-allowed bg-muted/50"
                              )}
                            >
                              <SelectValue placeholder="Select season">
                                {isSeasonLocked && passedSeason
                                  ? passedSeason.name
                                  : undefined}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {seasons.length > 0 ? (
                                seasons.map((s) => (
                                  <SelectItem key={s.id} value={s.id}>
                                    {s.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-season" disabled>
                                  No seasons available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.seasonId && (
                        <p className="text-xs text-destructive">
                          {errors.seasonId.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Division Type Section */}
              <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
                  <IconLayersSubtract className="size-4 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Division Type
                  </span>
                </div>
                <div className="p-3 space-y-3">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium flex items-center gap-1">
                        Level
                        <span className="text-destructive">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="divisionLevel"
                        render={({
                          field,
                        }: {
                          field: {
                            value: string;
                            onChange: (value: string) => void;
                          };
                        }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="h-9 w-full">
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">
                                <div className="flex items-center gap-2">
                                  <div className="size-2 rounded-full bg-sky-500" />
                                  Beginner
                                </div>
                              </SelectItem>
                              <SelectItem value="improver">
                                <div className="flex items-center gap-2">
                                  <div className="size-2 rounded-full bg-teal-500" />
                                  Improver
                                </div>
                              </SelectItem>
                              <SelectItem value="intermediate">
                                <div className="flex items-center gap-2">
                                  <div className="size-2 rounded-full bg-amber-500" />
                                  Intermediate
                                </div>
                              </SelectItem>
                              <SelectItem value="upper_intermediate">
                                <div className="flex items-center gap-2">
                                  <div className="size-2 rounded-full bg-orange-500" />
                                  Upper Intermediate
                                </div>
                              </SelectItem>
                              <SelectItem value="expert">
                                <div className="flex items-center gap-2">
                                  <div className="size-2 rounded-full bg-rose-500" />
                                  Expert
                                </div>
                              </SelectItem>
                              <SelectItem value="advanced">
                                <div className="flex items-center gap-2">
                                  <div className="size-2 rounded-full bg-violet-500" />
                                  Advanced
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium flex items-center gap-1">
                        {watch("gameType") === "doubles" ? (
                          <IconUsers className="size-3.5" />
                        ) : (
                          <IconUser className="size-3.5" />
                        )}
                        Game Type
                        <span className="text-destructive">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="gameType"
                        render={({
                          field,
                        }: {
                          field: {
                            value: string;
                            onChange: (value: string) => void;
                          };
                        }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={hasCategory}
                          >
                            <SelectTrigger
                              className={cn(
                                "h-9 w-full",
                                hasCategory && "opacity-60 cursor-not-allowed bg-muted/50"
                              )}
                            >
                              <SelectValue placeholder="Select game type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="singles">
                                <div className="flex items-center gap-2">
                                  <IconUser className="size-3.5 text-muted-foreground" />
                                  Singles
                                </div>
                              </SelectItem>
                              <SelectItem value="doubles">
                                <div className="flex items-center gap-2">
                                  <IconUsers className="size-3.5 text-muted-foreground" />
                                  Doubles
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium flex items-center gap-1">
                        Gender
                        <span className="text-destructive">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="genderCategory"
                        render={({
                          field,
                        }: {
                          field: {
                            value: string;
                            onChange: (value: string) => void;
                          };
                        }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={hasCategory}
                          >
                            <SelectTrigger
                              className={cn(
                                "h-9 w-full",
                                hasCategory && "opacity-60 cursor-not-allowed bg-muted/50"
                              )}
                            >
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Men's</SelectItem>
                              <SelectItem value="female">Women's</SelectItem>
                              <SelectItem value="mixed">Mixed</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  {/* Capacity Field - conditionally shown */}
                  <div className="pt-2 border-t border-border/50">
                    {watch("gameType") === "singles" && (
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium flex items-center gap-1">
                          <IconUser className="size-3.5" />
                          Max Players
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="number"
                          {...register("maxSinglesPlayers", {
                            valueAsNumber: true,
                          })}
                          className={cn(
                            "h-9 max-w-[180px]",
                            errors.maxSinglesPlayers && "border-destructive focus-visible:ring-destructive"
                          )}
                          placeholder="e.g., 12"
                        />
                        {errors.maxSinglesPlayers && (
                          <p className="text-xs text-destructive">
                            {errors.maxSinglesPlayers.message}
                          </p>
                        )}
                      </div>
                    )}

                    {watch("gameType") === "doubles" && (
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium flex items-center gap-1">
                          <IconUsers className="size-3.5" />
                          Max Teams
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="number"
                          {...register("maxDoublesTeams", {
                            valueAsNumber: true,
                          })}
                          className={cn(
                            "h-9 max-w-[180px]",
                            errors.maxDoublesTeams && "border-destructive focus-visible:ring-destructive"
                          )}
                          placeholder="e.g., 10"
                        />
                        {errors.maxDoublesTeams && (
                          <p className="text-xs text-destructive">
                            {errors.maxDoublesTeams.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Optional Settings Section */}
              <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
                  <IconSettings className="size-4 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Additional Settings
                  </span>
                  <Badge variant="outline" className="text-[10px] ml-auto bg-background">
                    Optional
                  </Badge>
                </div>
                <div className="p-3 space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium flex items-center gap-1">
                        <IconTrophy className="size-3.5 text-amber-500" />
                        Prize Pool
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                          RM
                        </span>
                        <Input
                          type="number"
                          {...register("prizePoolTotal", { valueAsNumber: true })}
                          className="h-9 pl-10"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium flex items-center gap-1">
                        <IconChartBar className="size-3.5" />
                        Rating Threshold
                      </Label>
                      <Input
                        type="number"
                        {...register("threshold", { valueAsNumber: true })}
                        className={cn(
                          "h-9",
                          errors.threshold && "border-destructive focus-visible:ring-destructive"
                        )}
                        placeholder="e.g., 100"
                      />
                      {errors.threshold && (
                        <p className="text-xs text-destructive">
                          {errors.threshold.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Description</Label>
                    <Input
                      {...register("description")}
                      className="h-9"
                      placeholder="Short description (optional)"
                    />
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "size-2 rounded-full",
                        formValues.isActive ? "bg-emerald-500" : "bg-slate-400"
                      )} />
                      <Label className="text-sm font-medium">Active</Label>
                    </div>
                    <Switch
                      checked={formValues.isActive}
                      onCheckedChange={(val) =>
                        setValue("isActive", Boolean(val))
                      }
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-8 rounded-lg bg-destructive/10">
                      <IconX className="size-4 text-destructive" />
                    </div>
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          {currentStep === "preview" && (() => {
            const levelStyles = getLevelStyles(formValues.divisionLevel);
            const isDoubles = formValues.gameType === "doubles";
            const seasonName = passedSeason?.name || seasons.find((s) => s.id === formValues.seasonId)?.name || "—";

            return (
              <div className="space-y-5 animate-in slide-in-from-left-4 duration-300">
                {/* Header Section with Division Name */}
                <div className={cn(
                  "rounded-xl p-5 border border-border/50",
                  levelStyles.bg
                )}>
                  {/* Badges Row */}
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    <Badge variant="outline" className={cn("text-xs font-medium border", levelStyles.badge)}>
                      {formatLevel(formValues.divisionLevel)}
                    </Badge>
                    <Badge variant="outline" className="text-xs font-medium bg-background/80">
                      {isDoubles ? <IconUsers className="size-3 mr-1" /> : <IconUser className="size-3 mr-1" />}
                      {formatGameType(formValues.gameType)}
                    </Badge>
                    <Badge variant="outline" className="text-xs font-medium bg-background/80">
                      {formatGender(formValues.genderCategory)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        formValues.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                          : "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      )}
                    >
                      {formValues.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Division Name & Icon */}
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl shadow-sm border border-border/50",
                      levelStyles.iconBg
                    )}>
                      <IconCategory className={cn("size-6", levelStyles.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold tracking-tight truncate">
                        {formValues.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                        <IconCalendarEvent className="size-3.5" />
                        <span>{seasonName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Capacity Card */}
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
                    <div className="flex items-center gap-2">
                      {isDoubles ? (
                        <IconUsers className="size-4 text-muted-foreground" />
                      ) : (
                        <IconUser className="size-4 text-muted-foreground" />
                      )}
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Capacity
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">
                          {isDoubles
                            ? formValues.maxDoublesTeams ?? "—"
                            : formValues.maxSinglesPlayers ?? "—"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {isDoubles ? "teams" : "players"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">maximum allowed</p>
                    </div>
                  </div>

                  {/* Rating Threshold Card */}
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
                    <div className="flex items-center gap-2">
                      <IconChartBar className="size-4 text-muted-foreground" />
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Rating
                      </span>
                    </div>
                    {formValues.threshold ? (
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold">{formValues.threshold}</span>
                          <span className="text-sm text-muted-foreground">pts</span>
                        </div>
                        <p className="text-xs text-muted-foreground">minimum threshold</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-lg font-medium text-muted-foreground">No limit</span>
                        <p className="text-xs text-muted-foreground">Open to all ratings</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prize Pool Section */}
                {formValues.prizePoolTotal && (
                  <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconTrophy className="size-5 text-amber-600 dark:text-amber-400" />
                        <span className="text-sm font-medium text-amber-900 dark:text-amber-100">Prize Pool</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-700 dark:text-amber-300">
                        <IconSparkles className="size-4" />
                        <span className="text-lg font-bold">
                          RM {new Intl.NumberFormat("en-MY", {
                            maximumFractionDigits: 0,
                          }).format(Number(formValues.prizePoolTotal))}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Configuration Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IconSettings className="size-4 text-muted-foreground" />
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Configuration
                    </span>
                  </div>
                  <div className="rounded-xl border border-border/50 divide-y divide-border/50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-muted/20">
                      <span className="text-sm text-muted-foreground">Auto Assignment</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          formValues.autoAssignmentEnabled
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                            : "bg-slate-50 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400"
                        )}
                      >
                        {formValues.autoAssignmentEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          formValues.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                            : "bg-slate-50 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400"
                        )}
                      >
                        {formValues.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                {formValues.description && (
                  <div className="space-y-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Description
                    </span>
                    <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg border border-border/50">
                      {formValues.description}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Footer */}
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
                  disabled={loading}
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
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <IconArrowLeft className="size-4" />
                  Back
                </Button>

                <Button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={loading}
                  className={cn(
                    "gap-2 min-w-[140px]",
                    isEditMode
                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                      : ""
                  )}
                >
                  {loading ? (
                    <>
                      <IconLoader2 className="animate-spin size-4" />
                      {isEditMode ? "Saving..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      {isEditMode ? (
                        <IconCheck className="size-4" />
                      ) : (
                        <IconPlus className="size-4" />
                      )}
                      {isEditMode ? "Save Changes" : "Create Division"}
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
