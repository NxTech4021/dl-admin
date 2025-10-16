"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
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
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { Badge } from "../ui/badge";

interface SeasonFormData {
  name: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  regiDeadline: Date | undefined;
  entryFee: string;
  description: string;
  categoryIds: string[];
  isActive: boolean;
  paymentRequired: boolean;
  promoCodeSupported: boolean;
  withdrawalEnabled: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface DateErrors {
  startDate?: string;
  endDate?: string;
  regiDeadline?: string;
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
    categoryIds: [],
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
      categoryIds: [],
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

  const validateDates = (
    startDate: Date | undefined,
    endDate: Date | undefined,
    regiDeadline: Date | undefined
  ): DateErrors => {
    const errors: DateErrors = {};

    if (!startDate) errors.startDate = "Start date is required";
    if (!endDate) errors.endDate = "End date is required";
    if (!regiDeadline)
      errors.regiDeadline = "Registration deadline is required";

    if (startDate && endDate && startDate >= endDate) {
      errors.endDate = "End date must be after start date";
    }

    if (regiDeadline && startDate && regiDeadline >= startDate) {
      errors.regiDeadline = "Registration deadline must be before start date";
    }

    return errors;
  };

  const dateErrors = useMemo(() => {
    return validateDates(form.startDate, form.endDate, form.regiDeadline);
  }, [form.startDate, form.endDate, form.regiDeadline]);

  const handleCreateSeason = async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      // Validate required fields
      if (!form.name || !form.categoryIds.length || !form.entryFee) {
        throw new Error("Please fill in all required fields");
      }

      const dateErrors = validateDates(
        form.startDate,
        form.endDate,
        form.regiDeadline
      );

      if (Object.keys(dateErrors).length > 0) {
        const errorMessage = Object.values(dateErrors).join(". ");
        throw new Error(errorMessage);
      }

      const seasonData = {
        name: form.name,
        description: form.description || null,
        entryFee: Number(form.entryFee),
        startDate: form.startDate!.toISOString(),
        endDate: form.endDate!.toISOString(),
        regiDeadline: form.regiDeadline!.toISOString(),
        categoryIds: form.categoryIds,
        leagueIds: [leagueId],
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
    } catch (error: any) {
      // Enhanced error handling
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to create season";
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
        form.categoryIds.length > 0 &&
        form.startDate &&
        form.endDate &&
        form.regiDeadline &&
        form.entryFee &&
        Object.keys(dateErrors).length === 0
    );
  }, [form, dateErrors]);

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

            {/* Category Selection */}
            <div className="space-y-2">
              <Label>Categories *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between h-11",
                      !form.categoryIds.length && "text-muted-foreground"
                    )}
                  >
                    {form.categoryIds.length > 0
                      ? `${form.categoryIds.length} categories selected`
                      : "Select categories"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search categories..." />
                    <CommandEmpty>No categories found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {categories.map((category) => (
                        <CommandItem
                          key={category.id}
                          onSelect={() => {
                            setForm((prev) => {
                              const selected = new Set(prev.categoryIds);
                              if (selected.has(category.id)) {
                                selected.delete(category.id);
                              } else {
                                selected.add(category.id);
                              }
                              return {
                                ...prev,
                                categoryIds: Array.from(selected),
                              };
                            });
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              form.categoryIds.includes(category.id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {category.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {categories.length > 0 && form.categoryIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.categoryIds.map((id) => {
                    const category = categories.find((c) => c.id === id);
                    return category ? (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {category.name}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              categoryIds: prev.categoryIds.filter(
                                (cid) => cid !== id
                              ),
                            }));
                          }}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Select one or more categories for this season
              </p>
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
                  {/* Field-specific error */}
                  {dateErrors[field.key] && (
                    <p className="text-sm text-destructive mt-1">
                      {dateErrors[field.key]}
                    </p>
                  )}
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
                <strong>Categories:</strong>{" "}
                {form.categoryIds
                  .map((id) => categories.find((c) => c.id === id)?.name)
                  .filter(Boolean)
                  .join(", ")}
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
