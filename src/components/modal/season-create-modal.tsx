"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SeasonFormData {
  name: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  regiDeadline: Date | undefined;
  entryFee: string;
  description: string;
  categoryId: string;
  isActive: boolean;
  paymentRequired: boolean;
  promoCodeSupported: boolean;
  withdrawalEnabled: boolean;
}

interface Category {
  id: string;
  name: string | null;
  genderRestriction: string;
  matchFormat: string | null;
  game_type: string | null;
  leagues: Array<{
    id: string;
    name: string;
  }>;
  seasons: Array<{
    id: string;
    name: string;
  }>;
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
  
  // Category selection state
  const [categorySearch, setCategorySearch] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isEntryFeeFocused, setIsEntryFeeFocused] = useState(false);

  const [form, setForm] = useState<SeasonFormData>({
    name: "",
    startDate: undefined,
    endDate: undefined,
    regiDeadline: undefined,
    entryFee: "",
    description: "",
    categoryId: "",
    isActive: false,
    paymentRequired: false,
    promoCodeSupported: false,
    withdrawalEnabled: false,
  });

  // Fetch categories when modal opens
  useEffect(() => {
    if (isCategoryDropdownOpen) {
      const fetchCategories = async () => {
        try {
          const response = await axiosInstance.get(endpoints.categories.getAll);
          if (response.status === 200) {
            const result = response.data;
            const categoriesData = result.data || [];
            setAllCategories(categoriesData);
          }
        } catch (error) {
          console.error("Failed to fetch categories:", error);
        }
      };
      fetchCategories();
    }
  }, [isCategoryDropdownOpen]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!categorySearch) return allCategories;
    return allCategories.filter(category =>
      category.name?.toLowerCase().includes(categorySearch.toLowerCase()) ||
      category.leagues?.some(league => 
        league.name.toLowerCase().includes(categorySearch.toLowerCase())
      )
    );
  }, [allCategories, categorySearch]);

  const resetModal = () => {
    setCurrentStep("form");
    setForm({
      name: "",
      startDate: undefined,
      endDate: undefined,
      regiDeadline: undefined,
      entryFee: "",
      description: "",
      categoryId: "",
      isActive: false,
      paymentRequired: false,
      promoCodeSupported: false,
      withdrawalEnabled: false,
    });
    setError("");
    setCategorySearch("");
    setIsCategoryDropdownOpen(false);
  };

  // Helper function to get sport type badge variant
  const getSportTypeBadgeVariant = (sportType: string) => {
    switch (sportType?.toLowerCase()) {
      case "tennis":
        return "default";
      case "pickleball":
        return "secondary";
      case "padel":
        return "outline";
      default:
        return "outline";
    }
  };

  // Helper function to handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setForm((prev) => ({
      ...prev,
      categoryId: prev.categoryId === categoryId ? "" : categoryId,
    }));
  };

  const handleChange = <K extends keyof SeasonFormData>(
    key: K,
    value: SeasonFormData[K]
  ): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Format currency for display
  const formatCurrency = (value: string): string => {
    if (!value || value === "0") return "RM0.00";
    const numValue = parseFloat(value) || 0;
    return `RM${numValue.toFixed(2)}`;
  };

  // Get display value for entry fee input
  const getEntryFeeDisplayValue = (): string => {
    if (isEntryFeeFocused) {
      // Show just the numeric value when focused
      return form.entryFee || "";
    }
    // Show formatted value when not focused
    return formatCurrency(form.entryFee);
  };

  // Parse input to extract numeric value
  const parseCurrencyInput = (input: string): string => {
    // Remove all non-numeric characters except decimal point
    const cleaned = input.replace(/[^\d.]/g, "");
    // Ensure only one decimal point
    const parts = cleaned.split(".");
    let numericValue = parts[0] || "";
    if (parts.length > 1) {
      // Limit to 2 decimal places
      numericValue += "." + parts.slice(1).join("").substring(0, 2);
    }
    return numericValue;
  };

  // Handle entry fee input with currency formatting
  const handleEntryFeeChange = (value: string) => {
    const numericValue = parseCurrencyInput(value);
    setForm((prev) => ({ ...prev, entryFee: numericValue }));
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
      if (!form.name || !form.categoryId || !form.entryFee) {
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
        categoryId: form.categoryId, // Backend now accepts single categoryId
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
        form.categoryId &&
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
      <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 pr-12">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
              <Trophy className="h-4 w-4 text-primary" />
              {currentStep === "form" ? "Create Season" : "Review"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                  currentStep === "form"
                    ? "bg-primary text-primary-foreground"
                    : "bg-green-500 text-white"
                )}
              >
                {currentStep === "preview" ? <Check className="h-3 w-3" /> : "1"}
              </div>
              <div className="w-8 h-px bg-border" />
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                  currentStep === "preview"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                2
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {/* Form Step */}
          {currentStep === "form" && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            {/* Basic Info - Compact Grid */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="season-name" className="text-xs">Season Name *</Label>
                <Input
                  id="season-name"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., Spring Championship 2025"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="entry-fee" className="text-xs">Entry Fee (MYR) *</Label>
                <Input
                  id="entry-fee"
                  type="text"
                  value={getEntryFeeDisplayValue()}
                  onChange={(e) => handleEntryFeeChange(e.target.value)}
                  onFocus={() => setIsEntryFeeFocused(true)}
                  onBlur={() => setIsEntryFeeFocused(false)}
                  placeholder="RM0.00"
                  className="h-9"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe this season..."
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-xs">Category *</Label>
              <div className="flex gap-2 items-start">
                <Popover open={isCategoryDropdownOpen} onOpenChange={setIsCategoryDropdownOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "flex-1 justify-between h-9",
                        !form.categoryId && "text-muted-foreground"
                      )}
                    >
                      {form.categoryId
                        ? allCategories.find(c => c.id === form.categoryId)?.name || "Selected"
                        : "Select category"}
                      <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <div className="p-2 border-b">
                      <Input
                        placeholder="Search..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                      {filteredCategories.length === 0 ? (
                        <div className="p-3 text-center text-xs text-muted-foreground">
                          No categories found
                        </div>
                      ) : (
                        <div className="p-1">
                          {filteredCategories.map((category) => (
                            <div
                              key={category.id}
                              className={cn(
                                "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent text-sm",
                                form.categoryId === category.id && "bg-accent"
                              )}
                              onClick={() => handleCategorySelect(category.id)}
                            >
                              <div className={cn(
                                "w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center",
                                form.categoryId === category.id
                                  ? "bg-primary border-primary"
                                  : "border-muted-foreground"
                              )}>
                                {form.categoryId === category.id && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                                )}
                              </div>
                              <span className="truncate">
                                {category.name || "Unnamed Category"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                {form.categoryId && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1 h-9"
                  >
                    {allCategories.find((c) => c.id === form.categoryId)?.name || "Selected"}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          categoryId: "",
                        }));
                      }}
                    />
                  </Badge>
                )}
              </div>
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
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-xs">{field.label} *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-9 text-xs",
                          !form[field.key] && "text-muted-foreground",
                          dateErrors[field.key] && "border-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
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
                  {dateErrors[field.key] && (
                    <p className="text-xs text-destructive">
                      {dateErrors[field.key]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Settings */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
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
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <Label className="text-xs font-medium capitalize cursor-pointer" htmlFor={key}>
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </Label>
                  <Switch
                    id={key}
                    checked={form[key]}
                    onCheckedChange={(val) => handleChange(key, val)}
                    className="scale-75"
                  />
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
                <X className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

          {/* Preview Step */}
          {currentStep === "preview" && (
            <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
            {/* Season Header */}
            <div className="text-center space-y-2 pb-3 border-b">
              <h3 className="text-lg font-semibold">{form.name}</h3>
              {form.description && (
                <p className="text-xs text-muted-foreground">
                  {form.description}
                </p>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Entry Fee</p>
                <p className="text-lg font-semibold">{formatCurrency(form.entryFee)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Category</p>
                <Badge variant="secondary" className="text-sm">
                  {allCategories.find((c) => c.id === form.categoryId)?.name || "None"}
                </Badge>
              </div>
            </div>

            {/* Schedule */}
            <div className="grid gap-3 md:grid-cols-3 pt-2 border-t">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Registration Deadline</p>
                <p className="text-sm font-medium">
                  {format(form.regiDeadline!, "MMM dd, yyyy")}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Start Date</p>
                <p className="text-sm font-medium">
                  {format(form.startDate!, "MMM dd, yyyy")}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">End Date</p>
                <p className="text-sm font-medium">
                  {format(form.endDate!, "MMM dd, yyyy")}
                </p>
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t">
              {[
                { key: "isActive", label: "Active" },
                { key: "paymentRequired", label: "Payment" },
                { key: "promoCodeSupported", label: "Promo Codes" },
                { key: "withdrawalEnabled", label: "Withdrawals" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    form[key as keyof typeof form] ? "bg-green-500" : "bg-muted"
                  )} />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 px-6 pt-4 pb-6 border-t">
          {currentStep === "form" ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleNextToPreview}
                disabled={!isFormValid || loading}
                size="sm"
              >
                Review
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleBackToForm}
                disabled={loading}
                size="sm"
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Back
              </Button>
              <Button 
                onClick={handleCreateSeason} 
                disabled={loading}
                size="sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-1.5 h-3.5 w-3.5" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Trophy className="mr-1.5 h-3.5 w-3.5" />
                    Create
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
