"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  CalendarIcon,
  Loader2,
  Trophy,
  X,
  ArrowLeft,
  ArrowRight,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import axiosInstance, { endpoints } from "@/lib/endpoints";

type SeasonStatus = "UPCOMING" | "ACTIVE" | "FINISHED" | "CANCELLED";

interface SeasonFormData {
  name: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  regiDeadline: Date | undefined;
  entryFee: string;
  description: string;
  status: SeasonStatus;
  categoryId: string;
  isActive: boolean;
  paymentRequired: boolean;
  promoCodeSupported: boolean;
  withdrawalEnabled: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface SeasonCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leagueId: string;
  leagueName?: string;
  categories: Category[];
  onSeasonCreated?: () => Promise<void>;
}

type ToggleFields = Extract<
  keyof SeasonFormData,
  "isActive" | "paymentRequired" | "promoCodeSupported" | "withdrawalEnabled"
>;
type DateFields = Extract<
  keyof SeasonFormData,
  "startDate" | "endDate" | "regiDeadline"
>;

export default function SeasonCreateModal({
  open,
  onOpenChange,
  leagueId,
  leagueName,
  categories = [],
  onSeasonCreated,
}: SeasonCreateModalProps) {
  const [currentStep, setCurrentStep] = useState<"form" | "preview">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<SeasonFormData>({
    name: "",
    startDate: undefined,
    endDate: undefined,
    regiDeadline: undefined,
    entryFee: "",
    description: "",

    status: "UPCOMING",
    categoryId: "",
    isActive: false,
    paymentRequired: false,
    promoCodeSupported: false,
    withdrawalEnabled: false,
  });

  const resetModal = () => {
    setCurrentStep("form");
    setForm({
      name: "",
      startDate: undefined,
      endDate: undefined,
      regiDeadline: undefined,
      entryFee: "",
      description: "",

      status: "UPCOMING",
      categoryId: "",
      isActive: false,
      paymentRequired: false,
      promoCodeSupported: false,
      withdrawalEnabled: false,
    });
    setError("");
  };

  const handleChange = <K extends keyof SeasonFormData>(
    key: K,
    value: SeasonFormData[K]
  ): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNextToPreview = () => {
    if (isFormValid) setCurrentStep("preview");
  };

  const handleBackToForm = () => setCurrentStep("form");

  // Add this validation utility
  const validateDates = (
    startDate: Date | undefined,
    endDate: Date | undefined,
    regiDeadline: Date | undefined
  ): string | null => {
    if (!startDate || !endDate || !regiDeadline) {
      return "All dates are required";
    }
    if (startDate >= endDate) {
      return "End date must be after start date";
    }
    if (regiDeadline >= startDate) {
      return "Registration deadline must be before start date";
    }
    return null;
  };

  // Update the handleCreateSeason function
  const handleCreateSeason = async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      // Validate required fields
      if (!form.name || !form.categoryId || !form.entryFee) {
        throw new Error("Please fill in all required fields");
      }

      // Validate dates
      const dateError = validateDates(
        form.startDate,
        form.endDate,
        form.regiDeadline
      );
      if (dateError) {
        throw new Error(dateError);
      }

      const seasonData = {
        name: form.name,
        description: form.description || null,
        entryFee: Number(form.entryFee),
        startDate: form.startDate!.toISOString(),
        endDate: form.endDate!.toISOString(),
        regiDeadline: form.regiDeadline!.toISOString(),
        status: form.status,
        categoryId: form.categoryId,
        leagueIds: leagueId ? [leagueId] : [],
        isActive: form.isActive,
        paymentRequired: form.paymentRequired,
        promoCodeSupported: form.promoCodeSupported,
        withdrawalEnabled: form.withdrawalEnabled,
      };

      const response = await axiosInstance.post(
        endpoints.season.create,
        seasonData
      );

      toast.success("Season created successfully!");
      resetModal();
      onOpenChange(false);
      await onSeasonCreated?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create season";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update the isFormValid check
  const isFormValid = useMemo(() => {
    return Boolean(
      form.name &&
        form.categoryId &&
        form.startDate &&
        form.endDate &&
        form.regiDeadline &&
        form.entryFee &&
        !validateDates(form.startDate, form.endDate, form.regiDeadline)
    );
  }, [form]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetModal();
        onOpenChange(isOpen);
      }}
    >
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
            {currentStep === "form"
              ? "Create New Season"
              : "Confirm Season Details"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {currentStep === "form"
              ? "Set up your new season with full details."
              : "Review all season information before creating."}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div
            className={cn(
              "flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors",
              currentStep === "form"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
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
            <span>2. Confirm</span>
          </div>
        </div>

        {/* Form Step */}
        {currentStep === "form" && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Season Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., Spring Championship 2025"
                  className="h-11"
                />
              </div>
              <div>
                <Label>Entry Fee (MYR) *</Label>
                <Input
                  type="number"
                  value={form.entryFee}
                  onChange={(e) => handleChange("entryFee", e.target.value)}
                  placeholder="150"
                  min="0"
                  className="h-11"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe this season..."
              />
            </div>

            {/* Category */}
            <div>
              <Label>Category *</Label>
              <Select
                value={form.categoryId}
                onValueChange={(val) => handleChange("categoryId", val)}
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))
                  ) : (
                    <p className="p-2 text-sm text-muted-foreground">
                      No categories available
                    </p>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Schedule */}
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  label: "Registration Deadline",
                  key: "regiDeadline" as const,
                },
                { label: "Start Date", key: "startDate" as const },
                { label: "End Date", key: "endDate" as const },
              ].map((field) => (
                <div key={field.key}>
                  <Label>{field.label} *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-11",
                          !form[field.key] && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form[field.key]
                          ? format(form[field.key] as Date, "MMM dd, yyyy")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form[field.key]}
                        onSelect={(val) => handleChange(field.key, val)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              ))}
            </div>
            {/* Toggles */}
            <div className="grid grid-cols-2 gap-4">
              {(
                [
                  "isActive",
                  "paymentRequired",
                  "promoCodeSupported",
                  "withdrawalEnabled",
                ] as const
              ).map((key) => (
                <div
                  key={key}
                  className="flex items-center justify-between border p-3 rounded-lg"
                >
                  <Label className="capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </Label>
                  <Switch
                    checked={form[key]}
                    onCheckedChange={(val) => handleChange(key, val)}
                  />
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                <X className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>
        )}

        {/* Preview Step */}
        {currentStep === "preview" && (
          <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{form.name}</h3>
              <p className="text-sm text-muted-foreground">
                {form.description || "No description"}
              </p>
            </div>

            <div className="space-y-2">
              <p>
                <strong>Entry Fee:</strong> MYR {form.entryFee}
              </p>
              <p>
                <strong>Category:</strong>{" "}
                {categories.find((c) => c.id === form.categoryId)?.name}
              </p>
              <p>
                <strong>Dates:</strong> {format(form.startDate!, "MMM dd")} -{" "}
                {format(form.endDate!, "MMM dd, yyyy")}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-3 pt-4">
          {currentStep === "form" ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleNextToPreview}
                disabled={!isFormValid || loading}
              >
                <ArrowRight className="mr-2 h-4 w-4" /> Review Details
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleBackToForm}
                disabled={loading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleCreateSeason} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />{" "}
                    Creating...
                  </>
                ) : (
                  <>
                    <Trophy className="mr-2 h-4 w-4" /> Create Season
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
