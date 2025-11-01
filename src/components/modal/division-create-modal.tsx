"use client";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axiosInstance, { endpoints } from "@/lib/endpoints";

// Schema imports
import {
  divisionFormSchema,
  defaultFormValues,
  getDisplayLabels,
  transformToPayload,
  transformFromDivision,
  type DivisionFormValues,
  type DivisionBase,
  divisionLevelEnum,
  gameTypeEnum,
  genderCategoryEnum,
} from "@/ZodSchema/division-schema";

// UI Components
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { IconCategory, IconEye, IconArrowLeft, IconArrowRight, IconLoader2 } from "@tabler/icons-react";

// Import formatCurrency from constants
import { formatCurrency } from "@/components/data-table/constants";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDivisionCreated?: () => void;
  mode?: "create" | "edit";
  division?: DivisionBase | null;
  seasonId?: string;
  adminId?: string;
};

export default function DivisionCreateModal({
  open,
  onOpenChange,
  onDivisionCreated,
  mode = "create",
  division,
  seasonId,
  adminId,
}: Props) {
  const [currentStep, setCurrentStep] = useState<"form" | "preview">("form");
  const [loading, setLoading] = useState(false);
  const [seasons, setSeasons] = useState<{ id: string; name: string }[]>([]);
  
  const isEditMode = mode === "edit";
  const labels = getDisplayLabels();

  const form = useForm<DivisionFormValues>({
    resolver: zodResolver(divisionFormSchema),
    mode: "onChange",
    defaultValues: { ...defaultFormValues, seasonId: seasonId || "" },
  });

  const { register, handleSubmit, watch, control, reset, setValue, trigger, formState: { errors, isValid } } = form;
  const formValues = watch();

  // Fetch seasons
  useEffect(() => {
    if (!open) return;
    
    axiosInstance.get(endpoints.season.getAll)
      .then(res => setSeasons(Array.isArray(res.data) ? res.data : res.data?.seasons ?? []))
      .catch(err => console.error("Failed to load seasons", err));
  }, [open]);

  // Reset form
  const resetForm = () => {
    setCurrentStep("form");
    reset({ ...defaultFormValues, seasonId: seasonId || "" });
  };

  // Handle edit mode
  useEffect(() => {
    if (open && isEditMode && division) {
      setCurrentStep("form");
      reset(transformFromDivision(division));
    } else if (!open) {
      resetForm();
    }
  }, [open, isEditMode, division, reset, seasonId]);

  // Navigation
  const handleNextToPreview = async () => {
    const valid = await trigger();
    if (valid && isValid) {
      setCurrentStep("preview");
    } else {
      toast.error("Please fix form errors before previewing.");
    }
  };

  // Submit
  const onSubmit = async (data: DivisionFormValues) => {
    setLoading(true);
    try {
      const payload = transformToPayload(data, adminId);
      
      if (isEditMode && division) {
        await axiosInstance.put(endpoints.division.update(division.id), payload);
        toast.success("Division updated successfully");
      } else {
        await axiosInstance.post(endpoints.division.create, payload);
        toast.success("Division created successfully");
      }
      
      onDivisionCreated?.();
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      const message = err.response?.data?.error || err.response?.data?.message || "Operation failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const FormField = ({ name, label, required = false, children }: any) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {errors[name] && (
        <p className="text-xs text-destructive">{errors[name]?.message}</p>
      )}
    </div>
  );

  const renderForm = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField name="name" label="Division Name" required>
          <Input {...register("name")} placeholder="e.g., Division A" />
        </FormField>

        <FormField name="seasonId" label="Season" required>
          <Controller
            control={control}
            name="seasonId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>

      {/* Division Type */}
      <div className="grid gap-4 md:grid-cols-3">
        <FormField name="divisionLevel" label="Level" required>
          <Controller
            control={control}
            name="divisionLevel"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {divisionLevelEnum.options.map((level) => (
                    <SelectItem key={level} value={level}>{labels.divisionLevel[level]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField name="gameType" label="Game Type" required>
          <Controller
            control={control}
            name="gameType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {gameTypeEnum.options.map((type) => (
                    <SelectItem key={type} value={type}>{labels.gameType[type]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField name="genderCategory" label="Gender" required>
          <Controller
            control={control}
            name="genderCategory"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {genderCategoryEnum.options.map((category) => (
                    <SelectItem key={category} value={category}>{labels.genderCategory[category]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>

      {/* Capacity */}
      <div className="grid gap-4 md:grid-cols-2">
        {formValues.gameType === "singles" && (
          <FormField name="maxSinglesPlayers" label="Max Singles Players" required>
            <Input
              type="number"
              {...register("maxSinglesPlayers", { valueAsNumber: true })}
              placeholder="e.g., 12"
            />
          </FormField>
        )}

        {formValues.gameType === "doubles" && (
          <FormField name="maxDoublesTeams" label="Max Doubles Teams" required>
            <Input
              type="number"
              {...register("maxDoublesTeams", { valueAsNumber: true })}
              placeholder="e.g., 10"
            />
          </FormField>
        )}

        <FormField name="threshold" label="Rating Threshold" required>
          <Input
            type="number"
            {...register("threshold", { valueAsNumber: true })}
            placeholder="e.g., 1500"
          />
        </FormField>
      </div>

      {/* Optional Fields */}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField name="prizePoolTotal" label="Prize Pool (MYR)">
          <Input
            type="number"
            {...register("prizePoolTotal", { valueAsNumber: true })}
            placeholder="e.g., 1000"
          />
        </FormField>

        <FormField name="description" label="Description">
          <Input {...register("description")} placeholder="Optional description" />
        </FormField>
      </div>

      {/* Active Switch */}
      <div className="flex items-center gap-2">
        <Switch
          checked={formValues.isActive}
          onCheckedChange={(val) => setValue("isActive", Boolean(val))}
        />
        <Label className="text-sm">Active</Label>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-4">
          <IconCategory className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">{formValues.name}</h3>
        <p className="text-sm text-muted-foreground">
          {seasons.find((s) => s.id === formValues.seasonId)?.name || "—"}
        </p>
      </div>

      <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
        {[
          ["Level", labels.divisionLevel[formValues.divisionLevel]],
          ["Game Type", labels.gameType[formValues.gameType]],
          ["Gender", labels.genderCategory[formValues.genderCategory]],
          ["Rating Threshold", formValues.threshold ? `${formValues.threshold} pts` : "—"],
          ["Capacity", formValues.gameType === "singles" 
            ? `${formValues.maxSinglesPlayers ?? "—"} players`
            : `${formValues.maxDoublesTeams ?? "—"} teams`
          ],
          ["Prize Pool", formatCurrency(formValues.prizePoolTotal, 'MYR')],
          ["Status", formValues.isActive ? "Active" : "Inactive"],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
            <span className="text-sm font-medium">{value}</span>
          </div>
        ))}
        
        {formValues.description && (
          <div className="pt-2 border-t">
            <span className="text-sm font-medium text-muted-foreground block mb-1">Description</span>
            <p className="text-sm">{formValues.description}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); onOpenChange(isOpen); }}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              {currentStep === "form" ? <IconCategory className="h-5 w-5 text-primary" /> : <IconEye className="h-5 w-5 text-primary" />}
            </div>
            {currentStep === "form" 
              ? (isEditMode ? "Edit Division" : "Create New Division")
              : (isEditMode ? "Confirm Updates" : "Confirm Division")}
          </DialogTitle>
          <DialogDescription>
            {currentStep === "form"
              ? (isEditMode ? "Update division settings." : "Set up a new division.")
              : "Review details before saving."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {currentStep === "form" ? renderForm() : renderPreview()}
        </div>

        <DialogFooter className="flex gap-3">
          {currentStep === "form" ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleNextToPreview} disabled={loading}>
                <IconArrowRight className="mr-2 h-4 w-4" />
                {isEditMode ? "Review Changes" : "Review Details"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setCurrentStep("form")} disabled={loading}>
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Back to Edit
              </Button>
              <Button onClick={handleSubmit(onSubmit)} disabled={loading}>
                {loading ? (
                  <><IconLoader2 className="animate-spin mr-2 h-4 w-4" />{isEditMode ? "Saving..." : "Creating..."}</>
                ) : (
                  <><IconCategory className="mr-2 h-4 w-4" />{isEditMode ? "Save Changes" : "Create Division"}</>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
