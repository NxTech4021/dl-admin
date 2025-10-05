"use client";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance, {endpoints} from "@/lib/endpoints";
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
import { Trophy, Eye, ArrowLeft, ArrowRight, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type DivisionCreateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
  onDivisionCreated?: () => void;
};

const divisionSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    seasonId: z.string().min(1, "Select a season"),
    divisionLevel: z.enum(["beginner", "intermediate", "advanced"]),
    gameType: z.enum(["singles", "doubles"]),
    genderCategory: z.enum(["male", "female", "mixed"]),
    maxSinglesPlayers: z
      .number()
      .int()
      .positive()
      .optional()
      .nullable(),
    maxDoublesTeams: z
      .number()
      .int()
      .positive()
      .optional()
      .nullable(),
    autoAssignmentEnabled: z.boolean().default(false),
    isActiveDivision: z.boolean().default(true),
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
}: DivisionCreateModalProps) {
  const [currentStep, setCurrentStep] = useState<"form" | "preview">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [seasons, setSeasons] = useState<{ id: string; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<DivisionFormValues>({
    resolver: zodResolver(divisionSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      seasonId: "",
      divisionLevel: "beginner",
      gameType: "singles",
      genderCategory: "male",
      maxSinglesPlayers: undefined,
      maxDoublesTeams: undefined,
      autoAssignmentEnabled: false,
      isActiveDivision: true,
      prizePoolTotal: undefined,
      sponsorName: "",
      description: "",
      threshold: undefined,
    },
  });

  const gameType = watch("gameType");
  const formValues = watch();

  useEffect(() => {
    // fetch seasons
    const fetchSeasons = async () => {
      try {
        const res = await axiosInstance.get(endpoints.season.getAll);
        // assume array of { id, name, startDate? }
        console.log("seasons", res.data)
        setSeasons(
          Array.isArray(res.data) ? res.data : res.data?.seasons ?? []
        );
      } catch (err: any) {  
        try {
          const raw = await axiosInstance.get(endpoints.season.getAll);
          setSeasons(Array.isArray(raw.data) ? raw.data : []);
        } catch (e) {
          console.error("Failed to load seasons", e);
        }
      }
    };

    if (open) fetchSeasons();
  }, [open]);

  const resetModal = () => {
    setCurrentStep("form");
    reset();
    setError("");
  };

  const handleNextToPreview = () => {
    // trigger validation by attempting to parse schema via form state's isValid
    if (isValid) {
      setCurrentStep("preview");
    } else {
      toast.error("Please fix form errors before previewing.");
    }
  };

  const handleBackToForm = () => setCurrentStep("form");

  const onSubmit = async (data: DivisionFormValues) => {
    setLoading(true);
    setError("");
    try {
      // prepare payload (strip undefined/null)
      const payload: any = {
        name: data.name,
        seasonId: data.seasonId,
        divisionLevel: data.divisionLevel,
        gameType: data.gameType,
        genderCategory: data.genderCategory,
        autoAssignmentEnabled: Boolean(data.autoAssignmentEnabled),
        isActiveDivision: Boolean(data.isActiveDivision),
      };

      if (data.maxSinglesPlayers) payload.maxSinglesPlayers = data.maxSinglesPlayers;
      if (data.maxDoublesTeams) payload.maxDoublesTeams = data.maxDoublesTeams;
      if (data.prizePoolTotal !== undefined && data.prizePoolTotal !== null)
        payload.prizePoolTotal = data.prizePoolTotal;
      if (data.sponsorName) payload.sponsorName = data.sponsorName;
      if (data.description) payload.description = data.description;
      if (data.threshold !== undefined && data.threshold !== null)
        payload.threshold = data.threshold;

      const res = await axiosInstance.post(endpoints.division.create, payload);
      console.log("data", payload)
      toast.success(res.data?.message ?? "Division created");
      resetModal();
      onOpenChange(false);
      onDivisionCreated?.();
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
                <Trophy className="h-5 w-5 text-primary" />
              ) : (
                <Eye className="h-5 w-5 text-primary" />
              )}
            </div>
            {currentStep === "form" ? "Create New Division" : "Confirm Division"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {currentStep === "form"
              ? "Set up a new division and link it to a season."
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
                      Division Name *
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
                    <Label className="text-sm font-medium">Season *</Label>
                    <Controller
                      control={control}
                      name="seasonId"
                      render={({ field }) => (
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

              {/* Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-sm font-medium text-muted-foreground px-2">
                    Settings
                  </span>
                  <div className="h-px bg-border flex-1" />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Division Level *</Label>
                    <Controller
                      control={control}
                      name="divisionLevel"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="h-11 w-full">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Game Type *</Label>
                    <Controller
                      control={control}
                      name="gameType"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="h-11 w-full">
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
                    <Label className="text-sm font-medium">Gender Category *</Label>
                    <Controller
                      control={control}
                      name="genderCategory"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="h-11 w-full">
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

                {/* Capacity inputs */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Max Singles Players</Label>
                    <Input
                      type="number"
                      {...register("maxSinglesPlayers", {
                        valueAsNumber: true,
                      })}
                      className="h-11"
                      placeholder="Only required for singles"
                    />
                    {errors.maxSinglesPlayers && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.maxSinglesPlayers.message as string}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Max Doubles Teams</Label>
                    <Input
                      type="number"
                      {...register("maxDoublesTeams", { valueAsNumber: true })}
                      className="h-11"
                      placeholder="Only required for doubles"
                    />
                    {errors.maxDoublesTeams && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.maxDoublesTeams.message as string}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Optional & Extra */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-sm font-medium text-muted-foreground px-2">
                    Optional
                  </span>
                  <div className="h-px bg-border flex-1" />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Prize Pool (Integer)</Label>
                    <Input
                      type="number"
                      {...register("prizePoolTotal", { valueAsNumber: true })}
                      className="h-11"
                      placeholder="e.g., 1000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Sponsor Name</Label>
                    <Input
                      {...register("sponsorName")}
                      className="h-11"
                      placeholder="Optional sponsor display name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Threshold</Label>
                    <Input
                      type="number"
                      {...register("threshold", { valueAsNumber: true })}
                      className="h-11"
                      placeholder="Optional threshold"
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
                      checked={formValues.autoAssignmentEnabled}
                      onCheckedChange={(val) =>
                        setValue("autoAssignmentEnabled", Boolean(val))
                      }
                    />
                    <Label className="text-sm">Auto assignment</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formValues.isActiveDivision}
                      onCheckedChange={(val) =>
                        setValue("isActiveDivision", Boolean(val))
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
                    <X className="h-2.5 w-2.5" />
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
                  <Trophy className="h-6 w-6 text-primary" />
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
                    {formValues.isActiveDivision ? "Yes" : "No"}
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
                <ArrowRight className="mr-2 h-4 w-4" />
                Review Details
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
                <ArrowLeft className="mr-2 h-4 w-4" />
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
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Trophy className="mr-2 h-4 w-4" />
                    Create Division
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
