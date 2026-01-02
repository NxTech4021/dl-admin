"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  IconTrophy,
  IconArrowLeft,
  IconArrowRight,
  IconLoader2,
  IconCheck,
  IconPlus,
  IconCalendarEvent,
  IconSettings,
  IconForms,
  IconCategory,
  IconBuilding,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { CalendarIcon, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/api-error";
import { Category } from "../league/types";
import CategoryCreateModal from "./category-create-modal";

/** Sponsor option for dropdown selection */
interface SponsorOption {
  id: string;
  name: string;
}

/** Raw sponsorship data from API */
interface SponsorshipApiResponse {
  id: string;
  sponsoredName?: string;
}

/** League reference in category */
interface CategoryLeagueRef {
  name: string;
  sportType?: string;
}

/** Season creation payload */
interface SeasonCreatePayload {
  name: string;
  description: string | null;
  entryFee: number;
  startDate: string;
  endDate: string;
  regiDeadline: string;
  categoryId: string;
  leagueIds: string[];
  isActive: boolean;
  paymentRequired: boolean;
  promoCodeSupported: boolean;
  withdrawalEnabled: boolean;
  sponsorId?: string;
}

interface SeasonCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leagueId: string;
  leagueName?: string;
  categories: Category[];
  onSeasonCreated?: () => Promise<void>;
}

// Zod schema for form validation
const seasonCreateSchema = z
  .object({
    name: z.string().min(2, "Season name is required"),
    description: z.string().optional().nullable(),
    entryFee: z.number().nonnegative("Entry fee must be positive"),
    startDate: z.date({ message: "Start date is required" }),
    endDate: z.date({ message: "End date is required" }),
    regiDeadline: z.date({ message: "Registration deadline is required" }),
    categoryIds: z.array(z.string()).min(1, "Select at least one category"),
    isActive: z.boolean(),
    paymentRequired: z.boolean(),
    promoCodeSupported: z.boolean(),
    withdrawalEnabled: z.boolean(),
    hasSponsor: z.boolean(),
    existingSponsorId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Date validation
    if (data.startDate && data.endDate && data.startDate >= data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date must be after start date",
      });
    }
    if (data.regiDeadline && data.startDate && data.regiDeadline >= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["regiDeadline"],
        message: "Registration deadline must be before start date",
      });
    }
    // Sponsor validation - only require sponsorId if hasSponsor is true
    if (data.hasSponsor && !data.existingSponsorId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["existingSponsorId"],
        message: "Select a sponsor when sponsor option is enabled",
      });
    }
  });

// Use z.input for form field values (what the form handles)
// Use z.output for the validated/transformed output
type SeasonFormInput = z.input<typeof seasonCreateSchema>;
type SeasonFormOutput = z.output<typeof seasonCreateSchema>;

// Step type for 3-step wizard
type WizardStep = "form" | "sponsor" | "preview";

export default function SeasonCreateModal({
  open,
  onOpenChange,
  leagueId,
  leagueName,
  categories = [],
  onSeasonCreated,
}: SeasonCreateModalProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Category selection state
  const [categorySearch, setCategorySearch] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isEntryFeeFocused, setIsEntryFeeFocused] = useState(false);

  // Category creation state
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);

  // Sponsor state
  const [sponsors, setSponsors] = useState<SponsorOption[]>([]);
  const [sponsorsLoading, setSponsorsLoading] = useState(false);
  const [sponsorInputValue, setSponsorInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSponsors, setFilteredSponsors] = useState<SponsorOption[]>([]);

  // Batch creation progress
  const [creationProgress, setCreationProgress] = useState<{
    current: number;
    total: number;
  }>({ current: 0, total: 0 });

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<SeasonFormInput, unknown, SeasonFormOutput>({
    resolver: zodResolver(seasonCreateSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      entryFee: 0,
      startDate: undefined,
      endDate: undefined,
      regiDeadline: undefined,
      categoryIds: [],
      isActive: false,
      paymentRequired: false,
      promoCodeSupported: false,
      withdrawalEnabled: false,
      hasSponsor: false,
      existingSponsorId: "",
    },
  });

  const formValues = watch();
  const hasSponsor = watch("hasSponsor");
  const categoryIds = watch("categoryIds");
  const existingSponsorId = watch("existingSponsorId");
  const entryFee = watch("entryFee");

  // Auto-manage paymentRequired based on entryFee
  // - Entry fee > 0: automatically enable payment required
  // - Entry fee = 0 or empty: automatically disable payment required
  useEffect(() => {
    const isFree = !entryFee || entryFee === 0;
    setValue("paymentRequired", !isFree, { shouldValidate: true });
  }, [entryFee, setValue]);

  // Check if form step is valid (without sponsor validation)
  const isFormStepValid = useMemo(() => {
    return (
      formValues.name?.length >= 2 &&
      formValues.categoryIds?.length >= 1 &&
      formValues.startDate &&
      formValues.endDate &&
      formValues.regiDeadline &&
      formValues.startDate < formValues.endDate &&
      formValues.regiDeadline < formValues.startDate
    );
  }, [formValues]);

  // Check if sponsor step can proceed
  const canProceedFromSponsor = useMemo(() => {
    // Can always proceed if no sponsor selected
    if (!hasSponsor) return true;
    // If sponsor is enabled, must have selected a sponsor
    return !!existingSponsorId;
  }, [hasSponsor, existingSponsorId]);

  // Fetch sponsors when entering sponsor step
  useEffect(() => {
    if (currentStep === "sponsor") {
      setSponsorsLoading(true);
      axiosInstance
        .get(endpoints.sponsors.getAll)
        .then((res) => {
          const api = res.data;
          const sponsorships: SponsorshipApiResponse[] = api?.data?.sponsorships || api?.data || api || [];
          const mapped: SponsorOption[] = sponsorships.map((s) => ({
            id: s.id,
            name: s.sponsoredName || "Unnamed Sponsor",
          }));
          setSponsors(mapped);
        })
        .catch(() => {
          setSponsors([]);
          toast.error("Failed to load sponsors");
        })
        .finally(() => setSponsorsLoading(false));
    }
  }, [currentStep]);

  // Fetch categories when dropdown opens
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
        } catch {
          toast.error("Failed to load categories");
        }
      };
      fetchCategories();
    }
  }, [isCategoryDropdownOpen]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!categorySearch) return allCategories;
    return allCategories.filter(
      (category) =>
        category.name?.toLowerCase().includes(categorySearch.toLowerCase()) ||
        category.leagues?.some((league: CategoryLeagueRef) =>
          league.name.toLowerCase().includes(categorySearch.toLowerCase())
        )
    );
  }, [allCategories, categorySearch]);

  // Handle sponsor input change
  const handleSponsorInputChange = (value: string) => {
    setSponsorInputValue(value);

    if (value.trim() === "") {
      setFilteredSponsors([]);
      setShowSuggestions(false);
      setValue("existingSponsorId", "");
      return;
    }

    const filtered = sponsors.filter((sponsor) =>
      sponsor.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSponsors(filtered);
    setShowSuggestions(true);
  };

  // Handle sponsor selection
  const handleSponsorSelect = (sponsor: SponsorOption) => {
    setSponsorInputValue(sponsor.name);
    setValue("existingSponsorId", sponsor.id, { shouldValidate: true });
    setShowSuggestions(false);
  };

  // Handle input blur
  const handleSponsorInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // Handle category created callback
  const handleCategoryCreated = async () => {
    try {
      const response = await axiosInstance.get(endpoints.categories.getAll);
      if (response.status === 200) {
        const result = response.data;
        const categoriesData = result.data || [];
        setAllCategories(categoriesData);

        if (categoriesData.length > 0) {
          const sortedCategories = [...categoriesData].sort((a: Category, b: Category) => {
            const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bDate - aDate;
          });
          const latestCategory = sortedCategories[0];

          if (latestCategory?.id) {
            const currentIds = categoryIds || [];
            setValue("categoryIds", [...currentIds, latestCategory.id], { shouldValidate: true });
          }
        }
      }
    } catch {
      toast.error("Failed to refresh categories");
    }

    setIsCreateCategoryOpen(false);
    setIsCategoryDropdownOpen(false);
  };

  const resetModal = useCallback(() => {
    setCurrentStep("form");
    reset({
      name: "",
      description: "",
      entryFee: 0,
      startDate: undefined,
      endDate: undefined,
      regiDeadline: undefined,
      categoryIds: [],
      isActive: false,
      paymentRequired: false,
      promoCodeSupported: false,
      withdrawalEnabled: false,
      hasSponsor: false,
      existingSponsorId: "",
    });
    setError("");
    setCategorySearch("");
    setIsCategoryDropdownOpen(false);
    setIsCreateCategoryOpen(false);
    setSponsorInputValue("");
    setShowSuggestions(false);
    setFilteredSponsors([]);
    setCreationProgress({ current: 0, total: 0 });
  }, [reset]);

  // Handle category toggle (multi-select)
  const handleCategoryToggle = (categoryId: string) => {
    const currentIds = categoryIds || [];
    const newIds = currentIds.includes(categoryId)
      ? currentIds.filter((id) => id !== categoryId)
      : [...currentIds, categoryId];
    setValue("categoryIds", newIds, { shouldValidate: true });
  };

  // Handle category removal from badge
  const handleRemoveCategory = (categoryId: string) => {
    const currentIds = categoryIds || [];
    setValue(
      "categoryIds",
      currentIds.filter((id) => id !== categoryId),
      { shouldValidate: true }
    );
  };

  // Format currency for display
  const formatCurrency = (value: number | string): string => {
    const numValue = typeof value === "string" ? parseFloat(value) || 0 : value || 0;
    return `RM${numValue.toFixed(2)}`;
  };

  // Parse input to extract numeric value
  const parseCurrencyInput = (input: string): number => {
    const cleaned = input.replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    let numericValue = parts[0] || "0";
    if (parts.length > 1) {
      numericValue += "." + parts.slice(1).join("").substring(0, 2);
    }
    return parseFloat(numericValue) || 0;
  };

  // Navigation handlers
  const handleNextToSponsor = () => {
    if (isFormStepValid) setCurrentStep("sponsor");
  };

  const handleNextToPreview = () => {
    setCurrentStep("preview");
  };

  const handleBackToForm = () => setCurrentStep("form");
  const handleBackToSponsor = () => setCurrentStep("sponsor");

  // Batch creation submit handler
  const onSubmit = async (data: SeasonFormOutput) => {
    setLoading(true);
    setError("");

    const categoryIdsToCreate = data.categoryIds;
    const totalCategories = categoryIdsToCreate.length;
    setCreationProgress({ current: 0, total: totalCategories });

    const results: { categoryId: string; success: boolean; error?: string }[] = [];

    for (let i = 0; i < categoryIdsToCreate.length; i++) {
      const categoryId = categoryIdsToCreate[i];
      setCreationProgress({ current: i + 1, total: totalCategories });

      try {
        const payload: SeasonCreatePayload = {
          name: data.name,
          description: data.description || null,
          entryFee: data.entryFee,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
          regiDeadline: data.regiDeadline.toISOString(),
          categoryId,
          leagueIds: [leagueId],
          isActive: data.isActive,
          paymentRequired: data.paymentRequired,
          promoCodeSupported: data.promoCodeSupported,
          withdrawalEnabled: data.withdrawalEnabled,
          ...(data.hasSponsor && data.existingSponsorId && { sponsorId: data.existingSponsorId }),
        };

        await axiosInstance.post(endpoints.season.create, payload);
        results.push({ categoryId, success: true });
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err, "Failed to create season");
        results.push({ categoryId, success: false, error: errorMessage });
      }
    }

    // Handle results
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    if (failCount === 0) {
      toast.success(
        totalCategories === 1
          ? "Season created successfully!"
          : `${successCount} seasons created successfully!`
      );
      resetModal();
      onOpenChange(false);
      await onSeasonCreated?.();
    } else if (successCount > 0) {
      toast.warning(`Created ${successCount} of ${totalCategories} seasons. ${failCount} failed.`);
      setError(`Some seasons failed to create. Successfully created ${successCount}, failed ${failCount}.`);
    } else {
      toast.error("Failed to create seasons");
      setError(results[0]?.error || "Unknown error occurred");
    }

    setLoading(false);
  };

  // Get step index for stepper
  const getStepIndex = (step: WizardStep): number => {
    switch (step) {
      case "form": return 0;
      case "sponsor": return 1;
      case "preview": return 2;
    }
  };

  const currentStepIndex = getStepIndex(currentStep);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetModal();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border/50">
          <DialogHeader className="px-6 pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
                <IconTrophy className="size-5 text-primary" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-lg font-semibold">
                  New Season
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Create a new season{leagueName ? ` for ${leagueName}` : ""}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* 3-Step Stepper */}
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2">
              {/* Step 1: Details */}
              <button
                type="button"
                onClick={() => currentStepIndex > 0 && setCurrentStep("form")}
                disabled={currentStepIndex === 0}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  currentStep === "form"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : currentStepIndex > 0
                    ? "bg-muted/50 text-muted-foreground hover:bg-muted cursor-pointer"
                    : "bg-muted/50 text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center size-5 rounded-full text-xs font-semibold",
                    currentStep === "form"
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : currentStepIndex > 0
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                      : "bg-muted-foreground/20"
                  )}
                >
                  {currentStepIndex > 0 ? <IconCheck className="size-3" /> : "1"}
                </span>
                Details
              </button>

              {/* Connector 1-2 */}
              <div
                className={cn(
                  "flex-1 h-px max-w-[40px]",
                  currentStepIndex >= 1 ? "bg-primary" : "bg-border"
                )}
              />

              {/* Step 2: Sponsor */}
              <button
                type="button"
                onClick={() => currentStepIndex > 1 && setCurrentStep("sponsor")}
                disabled={currentStepIndex < 1}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  currentStep === "sponsor"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : currentStepIndex > 1
                    ? "bg-muted/50 text-muted-foreground hover:bg-muted cursor-pointer"
                    : "bg-muted/50 text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center size-5 rounded-full text-xs font-semibold",
                    currentStep === "sponsor"
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : currentStepIndex > 1
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                      : "bg-muted-foreground/20"
                  )}
                >
                  {currentStepIndex > 1 ? <IconCheck className="size-3" /> : "2"}
                </span>
                <span className="flex items-center gap-1.5">
                  Sponsor
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] px-1.5 py-0",
                      currentStep === "sponsor" && "border-primary-foreground/30 text-primary-foreground/80"
                    )}
                  >
                    Optional
                  </Badge>
                </span>
              </button>

              {/* Connector 2-3 */}
              <div
                className={cn(
                  "flex-1 h-px max-w-[40px]",
                  currentStepIndex >= 2 ? "bg-primary" : "bg-border"
                )}
              />

              {/* Step 3: Review */}
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium",
                  currentStep === "preview"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground"
                )}
              >
                <span className="size-5 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs">
                  3
                </span>
                Review
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Step 1: Form */}
          {currentStep === "form" && (
            <form className="space-y-4 animate-in slide-in-from-right-4 duration-300">
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
                    {/* Season Name */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium flex items-center gap-1">
                        Season Name
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        {...register("name")}
                        className={cn(
                          "h-9",
                          errors.name && "border-destructive focus-visible:ring-destructive"
                        )}
                        placeholder="e.g., Spring Championship 2025"
                      />
                      {errors.name && (
                        <p className="text-xs text-destructive">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Entry Fee */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium flex items-center gap-1">
                        Entry Fee
                        <span className="text-destructive">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="entryFee"
                        render={({ field }) => (
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                              RM
                            </span>
                            <Input
                              type="text"
                              value={isEntryFeeFocused ? (field.value || "") : formatCurrency(field.value).replace("RM", "")}
                              onChange={(e) => field.onChange(parseCurrencyInput(e.target.value))}
                              onFocus={() => setIsEntryFeeFocused(true)}
                              onBlur={() => setIsEntryFeeFocused(false)}
                              className={cn(
                                "h-9 pl-10",
                                errors.entryFee && "border-destructive"
                              )}
                              placeholder="0.00"
                            />
                          </div>
                        )}
                      />
                      {errors.entryFee && (
                        <p className="text-xs text-destructive">{errors.entryFee.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Description</Label>
                    <Textarea
                      {...register("description")}
                      placeholder="Describe this season..."
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Category Selection Section */}
              <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
                  <IconCategory className="size-4 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Categories
                  </span>
                </div>
                <div className="p-3 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      Select Categories
                      <span className="text-destructive">*</span>
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Select multiple categories to create seasons for each one with the same settings.
                    </p>
                  </div>

                  <div className="flex gap-2 items-start">
                    <Popover
                      open={isCategoryDropdownOpen}
                      onOpenChange={setIsCategoryDropdownOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "flex-1 justify-between h-9",
                            !categoryIds?.length && "text-muted-foreground",
                            errors.categoryIds && "border-destructive"
                          )}
                        >
                          {categoryIds?.length
                            ? `${categoryIds.length} categor${categoryIds.length === 1 ? "y" : "ies"} selected`
                            : "Select categories"}
                          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[320px] p-0" align="start">
                        <div className="p-2 border-b space-y-2">
                          <div className="relative">
                            <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                            <Input
                              placeholder="Search categories..."
                              value={categorySearch}
                              onChange={(e) => setCategorySearch(e.target.value)}
                              className="h-8 pl-8"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-8 text-xs"
                            onClick={() => {
                              setIsCategoryDropdownOpen(false);
                              setIsCreateCategoryOpen(true);
                            }}
                          >
                            <IconPlus className="h-3 w-3 mr-1.5" />
                            Create New Category
                          </Button>
                        </div>
                        <div className="max-h-56 overflow-y-auto">
                          {filteredCategories.length === 0 ? (
                            <div className="p-3 text-center text-xs text-muted-foreground">
                              No categories found
                            </div>
                          ) : (
                            <div className="p-1">
                              {filteredCategories.map((category) => {
                                const isSelected = categoryIds?.includes(category.id);
                                return (
                                  <div
                                    key={category.id}
                                    className={cn(
                                      "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent text-sm",
                                      isSelected && "bg-accent"
                                    )}
                                    onClick={() => handleCategoryToggle(category.id)}
                                  >
                                    <Checkbox
                                      checked={isSelected}
                                      className="pointer-events-none"
                                    />
                                    <span className="truncate flex-1">
                                      {category.name || "Unnamed Category"}
                                    </span>
                                    {category.leagues?.[0]?.sportType && (
                                      <Badge variant="outline" className="text-xs ml-auto">
                                        {category.leagues[0].sportType}
                                      </Badge>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Selected Categories Display */}
                  {categoryIds && categoryIds.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {categoryIds.map((categoryId) => {
                        const category = allCategories.find((c) => c.id === categoryId);
                        return category ? (
                          <Badge
                            key={categoryId}
                            variant="secondary"
                            className="flex items-center gap-1 px-2 py-1"
                          >
                            {category.name || "Unnamed"}
                            <IconX
                              className="size-3 cursor-pointer hover:text-destructive"
                              onClick={() => handleRemoveCategory(categoryId)}
                            />
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}

                  {errors.categoryIds && (
                    <p className="text-xs text-destructive">{errors.categoryIds.message}</p>
                  )}
                </div>
              </div>

              {/* Schedule Section */}
              <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
                  <IconCalendarEvent className="size-4 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Schedule
                  </span>
                </div>
                <div className="p-3">
                  <div className="grid gap-3 md:grid-cols-3">
                    {[
                      { label: "Registration Deadline", key: "regiDeadline" as const },
                      { label: "Start Date", key: "startDate" as const },
                      { label: "End Date", key: "endDate" as const },
                    ].map((field) => (
                      <div key={field.key} className="space-y-1.5">
                        <Label className="text-sm font-medium flex items-center gap-1">
                          {field.label}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Controller
                          control={control}
                          name={field.key}
                          render={({ field: { value, onChange } }) => (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal h-9 text-sm",
                                    !value && "text-muted-foreground",
                                    errors[field.key] && "border-destructive"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                  {value ? format(value, "MMM dd, yyyy") : "Select date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={value}
                                  onSelect={onChange}
                                />
                              </PopoverContent>
                            </Popover>
                          )}
                        />
                        {errors[field.key] && (
                          <p className="text-xs text-destructive">
                            {errors[field.key]?.message}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Settings Section */}
              <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
                  <IconSettings className="size-4 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Settings
                  </span>
                </div>
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: "isActive" as const, label: "Active", hint: undefined },
                      { key: "paymentRequired" as const, label: "Payment Required", hint: "Auto-set by entry fee" },
                      { key: "promoCodeSupported" as const, label: "Promo Codes", hint: undefined },
                      { key: "withdrawalEnabled" as const, label: "Withdrawals", hint: undefined },
                    ].map(({ key, label, hint }) => {
                      // Payment Required is auto-managed based on entry fee
                      const isPaymentRequired = key === "paymentRequired";
                      const isFreeEntry = !entryFee || entryFee === 0;
                      const isDisabled = isPaymentRequired; // Always disabled - auto-managed

                      return (
                        <div
                          key={key}
                          className={cn(
                            "flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-background",
                            isDisabled && "opacity-60"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "size-2 rounded-full transition-colors",
                                formValues[key] ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                              )}
                            />
                            <div className="flex flex-col">
                              <Label className={cn("text-sm font-medium", !isDisabled && "cursor-pointer")} htmlFor={key}>
                                {label}
                              </Label>
                              {isPaymentRequired && (
                                <span className="text-[10px] text-muted-foreground">
                                  {isFreeEntry ? "Free season" : "Paid season"}
                                </span>
                              )}
                            </div>
                          </div>
                          <Controller
                            control={control}
                            name={key}
                            render={({ field: { value, onChange } }) => (
                              <Switch
                                id={key}
                                checked={value}
                                onCheckedChange={onChange}
                                disabled={isDisabled}
                                className="scale-90"
                              />
                            )}
                          />
                        </div>
                      );
                    })}
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

          {/* Step 2: Sponsor */}
          {currentStep === "sponsor" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              {/* Centered Header */}
              <div className="text-center space-y-3 py-4">
                <div className="flex items-center justify-center size-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 mx-auto">
                  <IconBuilding className="size-8 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Add a Sponsor</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Optionally link this season to a sponsor
                  </p>
                </div>
              </div>

              {/* Sponsor Section */}
              <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "size-3 rounded-full transition-colors",
                          hasSponsor ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600"
                        )}
                      />
                      <div>
                        <Label className="text-sm font-medium cursor-pointer" htmlFor="hasSponsor">
                          This season has a sponsor
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Enable to add sponsor details
                        </p>
                      </div>
                    </div>
                    <Controller
                      control={control}
                      name="hasSponsor"
                      render={({ field: { value, onChange } }) => (
                        <Switch
                          id="hasSponsor"
                          checked={value}
                          onCheckedChange={onChange}
                        />
                      )}
                    />
                  </div>

                  {hasSponsor && (
                    <div className="space-y-3 p-4 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                      <Label className="text-sm font-medium flex items-center gap-1">
                        Select Sponsor
                        <span className="text-destructive">*</span>
                      </Label>
                      {sponsorsLoading ? (
                        <div className="flex items-center justify-center h-11 border rounded-md bg-background">
                          <IconLoader2 className="h-4 w-4 animate-spin mr-2 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Loading sponsors...
                          </span>
                        </div>
                      ) : (
                        <div className="relative">
                          <Input
                            placeholder="Type to search sponsors..."
                            value={sponsorInputValue}
                            onChange={(e) => handleSponsorInputChange(e.target.value)}
                            onFocus={() => {
                              if (sponsorInputValue.trim() !== "") {
                                setShowSuggestions(true);
                              }
                            }}
                            onBlur={handleSponsorInputBlur}
                            className={cn(
                              "h-11 bg-background",
                              errors.existingSponsorId && "border-destructive"
                            )}
                          />

                          {/* Suggestions dropdown */}
                          {showSuggestions && filteredSponsors.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                              {filteredSponsors.map((sponsor) => (
                                <div
                                  key={sponsor.id}
                                  className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                                  onClick={() => handleSponsorSelect(sponsor)}
                                >
                                  {sponsor.name}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* No results message */}
                          {showSuggestions &&
                            filteredSponsors.length === 0 &&
                            sponsorInputValue.trim() !== "" && (
                              <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg">
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                  No sponsors found
                                </div>
                              </div>
                            )}
                        </div>
                      )}
                      {errors.existingSponsorId && (
                        <p className="text-xs text-destructive">{errors.existingSponsorId.message}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Info Note */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                <IconBuilding className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Sponsors can be added or changed later from the season settings. You can skip this step if you don&apos;t have a sponsor yet.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {currentStep === "preview" && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              {/* Header Section */}
              <div className="rounded-xl p-5 border border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shadow-sm border border-border/50">
                    <IconTrophy className="size-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold tracking-tight truncate">
                      {formValues.name}
                    </h3>
                    {formValues.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {formValues.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Categories to Create */}
              <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
                  <IconCategory className="size-4 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Categories ({categoryIds?.length || 0})
                  </span>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {categoryIds?.map((categoryId) => {
                      const category = allCategories.find((c) => c.id === categoryId);
                      return category ? (
                        <Badge key={categoryId} variant="secondary" className="text-sm">
                          {category.name || "Unnamed"}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {categoryIds && categoryIds.length > 1
                      ? `${categoryIds.length} seasons will be created with the same settings.`
                      : "One season will be created."}
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Entry Fee
                  </span>
                  <div className="text-2xl font-bold">
                    {formatCurrency(formValues.entryFee)}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Duration
                  </span>
                  <div className="text-lg font-semibold">
                    {formValues.startDate && formValues.endDate
                      ? `${format(formValues.startDate, "MMM dd")} - ${format(formValues.endDate, "MMM dd, yyyy")}`
                      : "Not set"}
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="rounded-xl border border-border/50 divide-y divide-border/50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-muted/20">
                  <span className="text-sm text-muted-foreground">Registration Deadline</span>
                  <span className="text-sm font-medium">
                    {formValues.regiDeadline ? format(formValues.regiDeadline, "MMM dd, yyyy") : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-muted-foreground">Start Date</span>
                  <span className="text-sm font-medium">
                    {formValues.startDate ? format(formValues.startDate, "MMM dd, yyyy") : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-muted/20">
                  <span className="text-sm text-muted-foreground">End Date</span>
                  <span className="text-sm font-medium">
                    {formValues.endDate ? format(formValues.endDate, "MMM dd, yyyy") : "—"}
                  </span>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-2">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Configuration
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "isActive" as const, label: "Active" },
                    { key: "paymentRequired" as const, label: "Payment Required" },
                    { key: "promoCodeSupported" as const, label: "Promo Codes" },
                    { key: "withdrawalEnabled" as const, label: "Withdrawals" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <div
                        className={cn(
                          "size-2 rounded-full",
                          formValues[key] ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                        )}
                      />
                      <span className="text-sm text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sponsor */}
              {formValues.hasSponsor && formValues.existingSponsorId && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-4">
                  <div className="flex items-center gap-2">
                    <IconBuilding className="size-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-medium">Sponsored Season</span>
                    {sponsorInputValue && (
                      <Badge variant="outline" className="ml-auto">
                        {sponsorInputValue}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

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

        {/* Create Category Dialog */}
        <CategoryCreateModal
          open={isCreateCategoryOpen}
          onOpenChange={setIsCreateCategoryOpen}
          onCategoryCreated={handleCategoryCreated}
        />

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border/50 px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            {currentStep === "form" && (
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
                  onClick={handleNextToSponsor}
                  disabled={!isFormStepValid || loading}
                  className="gap-2"
                >
                  Continue
                  <IconArrowRight className="size-4" />
                </Button>
              </>
            )}

            {currentStep === "sponsor" && (
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
                  onClick={handleNextToPreview}
                  disabled={!canProceedFromSponsor || loading}
                  className="gap-2"
                >
                  Continue
                  <IconArrowRight className="size-4" />
                </Button>
              </>
            )}

            {currentStep === "preview" && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBackToSponsor}
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
                      {creationProgress.total > 1
                        ? `Creating ${creationProgress.current}/${creationProgress.total}...`
                        : "Creating..."}
                    </>
                  ) : (
                    <>
                      <IconPlus className="size-4" />
                      {categoryIds && categoryIds.length > 1
                        ? `Create ${categoryIds.length} Seasons`
                        : "Create Season"}
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
