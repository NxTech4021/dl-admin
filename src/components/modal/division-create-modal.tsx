"use client";
import React, { useEffect, useState } from "react";
// @ts-expect-error
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
  DialogFooter,
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
  IconEye,
  IconArrowLeft,
  IconArrowRight,
  IconLoader2,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/use-notifications";

type DivisionBase = {
  id: string;
  seasonId: string;
  name: string;
  description?: string | null;
  threshold?: number | null;
  divisionLevel: "beginner" | "intermediate" | "advanced";
  gameType: "singles" | "doubles";
  genderCategory?: "male" | "female" | "mixed" | null;
  maxSingles?: number | null;
  maxDoublesTeams?: number | null;
  autoAssignmentEnabled?: boolean;
  isActive?: boolean;
  prizePoolTotal?: number | null;
  sponsoredDivisionName?: string | null;
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
};

const divisionSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    seasonId: z.string().min(1, "Select a season"),
    divisionLevel: z.enum(["beginner", "intermediate", "advanced"]),
    gameType: z.enum(["singles", "doubles"]),
    genderCategory: z.enum(["male", "female", "mixed"]),
    maxSinglesPlayers: z.number().int().positive().optional().nullable(),
    maxDoublesTeams: z.number().int().positive().optional().nullable(),
    autoAssignmentEnabled: z.boolean().default(false).optional(),
    isActive: z.boolean().default(true).optional(),
    prizePoolTotal: z.number().int().nonnegative().optional().nullable(),
    sponsorName: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    threshold: z.number().int().nonnegative().optional().nullable(),
  })
  .superRefine((val, ctx) => {
    if (val.gameType === "singles") {
      if (!val.maxSinglesPlayers) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maxSinglesPlayers"],
          message: "Max singles players is required for singles game type",
        });
      }
    }
    if (val.gameType === "doubles") {
      if (!val.maxDoublesTeams) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maxDoublesTeams"],
          message: "Max doubles teams is required for doubles game type",
        });
      }
    }
  });

type DivisionFormValues = z.infer<typeof divisionSchema>;

export default function DivisionCreateModal({
  open,
  onOpenChange,
  children,
  onDivisionCreated,
  mode = "create",
  division,
  seasonId,
  adminId
}: DivisionCreateModalProps) {
  const [currentStep, setCurrentStep] = useState<"form" | "preview">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [seasons, setSeasons] = useState<Array<{
    id: string;
    name: string;
    category?: {
      id: string;
      name: string | null;
      game_type?: "SINGLES" | "DOUBLES" | null;
      gender_category?: "MALE" | "FEMALE" | "MIXED" | null;
    } | null;
    categories?: Array<{
      id: string;
      name: string | null;
      game_type?: "SINGLES" | "DOUBLES" | null;
      gender_category?: "MALE" | "FEMALE" | "MIXED" | null;
    }>;
  }>>([]);

  
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
    resolver: zodResolver(divisionSchema),
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
  // Get category from either category (singular) or first item in categories array
  const seasonCategory = selectedSeason?.category || 
    (selectedSeason?.categories && selectedSeason.categories.length > 0 
      ? selectedSeason.categories[0] 
      : null);
  const hasCategory = Boolean(
    seasonCategory?.game_type && seasonCategory?.gender_category
  );

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const res = await axiosInstance.get(endpoints.season.getAll);
        const seasonsData = Array.isArray(res.data) ? res.data : res.data?.seasons ?? [];
        setSeasons(seasonsData);
      } catch (err: any) {
        try {
          const raw = await axiosInstance.get(endpoints.season.getAll);
          const seasonsData = Array.isArray(raw.data) ? raw.data : [];
          setSeasons(seasonsData);
        } catch (e) {
          console.error("Failed to load seasons", e);
          setSeasons([]);
        }
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

  // Auto-fill gameType and genderCategory when season is selected
  useEffect(() => {
    if (seasonCategory?.game_type && seasonCategory?.gender_category) {
      const gameTypeLower = seasonCategory.game_type.toLowerCase() as "singles" | "doubles";
      const genderCategoryLower = seasonCategory.gender_category.toLowerCase() as "male" | "female" | "mixed";
      
      setValue("gameType", gameTypeLower);
      setValue("genderCategory", genderCategoryLower);
      trigger(["gameType", "genderCategory"]);
    }
  }, [selectedSeasonId, seasonCategory, setValue, trigger]);

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
        isActive:
          division.isActive !== undefined ? division.isActive : true,
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
  }, [open, isEditMode, division, resetModal]);

  const handleNextToPreview = async () => {
    const valid = await trigger();
    if (!valid) return;
    if (isValid) {
      setCurrentStep("preview");
    } else {
      toast.error("Please fix form errors before previewing.");
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

      console.log("payload", payload)
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
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              {currentStep === "form" ? (
                <IconCategory className="h-5 w-5 text-primary" />
              ) : (
                <IconEye className="h-5 w-5 text-primary" />
              )}
            </div>
            {currentStep === "form"
              ? isEditMode
                ? "Edit Division"
                : "Create New Division"
              : isEditMode
              ? "Confirm Updates"
              : "Confirm Division"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {currentStep === "form"
              ? isEditMode
                ? "Update division settings and linked season."
                : "Set up a new division and link it to a season."
              : isEditMode
              ? "Review the changes before updating this division."
              : "Review division details before creating."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4">
            <div
              className={cn(
                "flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors",
                currentStep === "form"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  currentStep === "form"
                    ? "bg-primary-foreground"
                    : "bg-muted-foreground"
                )}
              />
              <span>1. Details</span>
            </div>
            <div className="w-8 h-px bg-border" />
            <div
              className={cn(
                "flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors",
                currentStep === "preview"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  currentStep === "preview"
                    ? "bg-primary-foreground"
                    : "bg-muted-foreground"
                )}
              />
              <span>2. Confirm</span>
            </div>
          </div>

          {/* Form */}
          {currentStep === "form" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              {/* Basic */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-sm font-medium text-muted-foreground px-2">
                    Basic Information
                  </span>
                  <div className="h-px bg-border flex-1" />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Division Name
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      {...register("name")}
                      className="h-11"
                      placeholder="e.g., Division A"
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Season
                      <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="seasonId"
                      render={({ field }: { field: { value: string; onChange: (value: string) => void } }) => (
                        <Select
                          value={field.value}
                          onValueChange={(val) => field.onChange(val)}
                        >
                          <SelectTrigger className="h-11 w-full">
                            <SelectValue placeholder="Select season" />
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
                      <p className="text-xs text-destructive mt-1">
                        {errors.seasonId.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-sm font-medium text-muted-foreground px-2">
                    Division Type
                  </span>
                  <div className="h-px bg-border flex-1" />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Division Level
                      <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="divisionLevel"
                      render={({ field }: { field: { value: string; onChange: (value: string) => void } }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="h-11 w-full">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">
                              Intermediate
                            </SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Game Type
                      <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="gameType"
                      render={({ field }: { field: { value: string; onChange: (value: string) => void } }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={hasCategory}
                        >
                          <SelectTrigger className={cn("h-11 w-full", hasCategory && "opacity-50 cursor-not-allowed")}>
                            <SelectValue placeholder="Select game type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="singles">Singles</SelectItem>
                            <SelectItem value="doubles">Doubles</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Gender
                      <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="genderCategory"
                      render={({ field }: { field: { value: string; onChange: (value: string) => void } }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={hasCategory}
                        >
                          <SelectTrigger className={cn("h-11 w-full", hasCategory && "opacity-50 cursor-not-allowed")}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="mixed">Mixed</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  {watch("gameType") === "singles" && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Max Singles Players
                      </Label>
                      <Input
                        type="number"
                        {...register("maxSinglesPlayers", {
                          valueAsNumber: true,
                        })}
                        className={`h-11 ${
                          errors.maxSinglesPlayers
                            ? "border-destructive focus:border-destructive focus:ring-destructive"
                            : ""
                        }`}
                        placeholder="e.g 12"
                      />
                      {errors.maxSinglesPlayers && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.maxSinglesPlayers.message}
                        </p>
                      )}
                    </div>
                  )}

                  {watch("gameType") === "doubles" && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Max Doubles Teams
                      </Label>
                      <Input
                        type="number"
                        {...register("maxDoublesTeams", {
                          valueAsNumber: true,
                        })}
                        className={`h-11 ${
                          errors.maxDoublesTeams
                            ? "border-destructive focus:border-destructive focus:ring-destructive"
                            : ""
                        }`}
                        placeholder="e.g 10"
                      />
                      {errors.maxDoublesTeams && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.maxDoublesTeams.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Optional & Extra */}
              <div className="space-y-2">
                {/* <div className="flex items-center gap-2">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-sm font-medium text-muted-foreground px-2">
                    Optional
                  </span>
                  <div className="h-px bg-border flex-1" />
                </div> */}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Prize Pool</Label>
                    <Input
                      type="number"
                      {...register("prizePoolTotal", { valueAsNumber: true })}
                      className="h-11"
                      placeholder="e.g., 1000"
                    />
                  </div>

                  {/* <div className="space-y-2">
                    <Label className="text-sm font-medium">Sponsor Name</Label>
                    <Input
                      {...register("sponsorName")}
                      className="h-11"
                      placeholder="Optional sponsor display name"
                    />
                  </div> */}

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Rating Threshold
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      {...register("threshold", { valueAsNumber: true })}
                      className="h-11"
                      placeholder="e.g 100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <Input
                    {...register("description")}
                    className="h-11"
                    placeholder="Short description (optional)"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formValues.isActive}
                      onCheckedChange={(val) =>
                        setValue("isActive", Boolean(val))
                      }
                    />
                    <Label className="text-sm">Active</Label>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                  <div className="h-4 w-4 rounded-full bg-destructive/20 flex items-center justify-center">
                    <IconX className="h-2.5 w-2.5" />
                  </div>
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          {currentStep === "preview" && (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto">
                  <IconCategory className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{formValues.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {seasons.find((s) => s.id === formValues.seasonId)?.name ||
                    "—"}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Level
                  </span>
                  <span className="text-sm font-medium capitalize">
                    {formValues.divisionLevel}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Game Type
                  </span>
                  <span className="text-sm font-medium capitalize">
                    {formValues.gameType}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Gender
                  </span>
                  <span className="text-sm font-medium capitalize">
                    {formValues.genderCategory}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Capacity
                  </span>
                  <span className="text-sm font-medium">
                    {formValues.gameType === "singles"
                      ? `${formValues.maxSinglesPlayers ?? "—"} players`
                      : `${formValues.maxDoublesTeams ?? "—"} teams`}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Prize Pool
                  </span>
                  <span className="text-sm font-medium">
                    {formValues.prizePoolTotal
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                        }).format(Number(formValues.prizePoolTotal))
                      : "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Sponsor
                  </span>
                  <span className="text-sm font-medium">
                    {formValues.sponsorName ?? "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Auto Assignment
                  </span>
                  <span className="text-sm font-medium">
                    {formValues.autoAssignmentEnabled ? "Yes" : "No"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Active
                  </span>
                  <span className="text-sm font-medium">
                    {formValues.isActive ? "Yes" : "No"}
                  </span>
                </div>

                {formValues.description && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Description
                    </span>
                    <p className="text-sm mt-1">{formValues.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-3 pt-4">
          {currentStep === "form" ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleNextToPreview}
                disabled={loading}
                className="flex-1 sm:flex-none min-w-[140px]"
              >
                <IconArrowRight className="mr-2 h-4 w-4" />
                {isEditMode ? "Review Changes" : "Review Details"}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleBackToForm}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Back to Edit
              </Button>

              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
                className="flex-1 sm:flex-none min-w-[160px]"
              >
                {loading ? (
                  <>
                    <IconLoader2 className="animate-spin mr-2 h-4 w-4" />
                    {isEditMode ? "Saving..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <IconCategory className="mr-2 h-4 w-4" />
                    {isEditMode ? "Save Changes" : "Create Division"}
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}