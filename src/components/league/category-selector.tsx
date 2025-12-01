"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { toast } from "sonner";
import { Category as CategorySchema } from "@/constants/zod/category-schema";
import { Category } from "./types";

interface CategorySelectorProps {
  value: string;
  onChange: (categoryName: string, categoryData?: CategorySchema) => void;
  placeholder?: string;
  className?: string;
}

/** Extended category data from API response */
interface CategoryApiData extends Category {
  gender_category?: "MALE" | "FEMALE" | "MIXED" | null;
}

export function CategorySelector({
  value,
  onChange,
  placeholder = "Select a category...",
  className,
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryApiData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch categories on mount
  useEffect(() => {
    const abortController = new AbortController();

    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(endpoints.categories.getAll, {
          signal: abortController.signal,
        });
        if (response.status === 200) {
          const result = response.data;
          const categoriesData = result.data || [];
          setCategories(categoriesData);
        }
      } catch (error) {
        if (abortController.signal.aborted) return;
        setCategories([]);
        toast.error("Failed to load categories");
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      abortController.abort();
    };
  }, []);

  // Refresh categories when dropdown opens to get latest data
  useEffect(() => {
    if (!isOpen) return;

    const abortController = new AbortController();

    const fetchLatestCategories = async () => {
      try {
        const response = await axiosInstance.get(endpoints.categories.getAll, {
          signal: abortController.signal,
        });
        if (response.status === 200) {
          const result = response.data;
          const categoriesData = result.data || [];
          setCategories(categoriesData);
        }
      } catch {
        // Keep existing categories on refresh failure - no toast to avoid spam on dropdown open
      }
    };

    fetchLatestCategories();

    return () => {
      abortController.abort();
    };
  }, [isOpen]);

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCategory = categories.find(
    (category) => category.name === value
  );

  const handleCategorySelect = (category: CategoryApiData) => {
    // Transform CategoryData to match CategorySchema
    // Map "OPEN" to "MIXED" to match schema requirements
    const normalizeGenderRestriction = (gr: string): "MALE" | "FEMALE" | "MIXED" => {
      const upper = gr.toUpperCase();
      if (upper === "MALE") return "MALE";
      if (upper === "FEMALE") return "FEMALE";
      return "MIXED"; // Map OPEN and any other value to MIXED
    };

    const genderRestriction = normalizeGenderRestriction(category.genderRestriction);

    // Validate game_type against expected values
    const normalizeGameType = (gt: string | null | undefined): "SINGLES" | "DOUBLES" | null => {
      if (!gt) return null;
      const upper = gt.toUpperCase();
      if (upper === "SINGLES") return "SINGLES";
      if (upper === "DOUBLES") return "DOUBLES";
      return null;
    };

    const categorySchema: CategorySchema = {
      id: category.id,
      name: category.name,
      genderRestriction,
      matchFormat: category.matchFormat ?? null,
      game_type: normalizeGameType(category.game_type),
      gender_category: category.gender_category ?? null,
      isActive: category.isActive ?? true,
      categoryOrder: category.categoryOrder ?? 0,
      seasons: (category.seasons ?? []).map((season) => ({
        id: season.id,
        name: season.name,
        startDate: null,
        endDate: null,
      })),
      createdAt: category.createdAt ? new Date(category.createdAt) : new Date(),
      updatedAt: category.updatedAt ? new Date(category.updatedAt) : new Date(),
    };
    onChange(category.name || "", categorySchema);
    setIsOpen(false);
    setSearchTerm("");
  };

  const getGenderRestrictionBadgeVariant = (restriction: string) => {
    switch (restriction?.toUpperCase()) {
      case "MALE":
        return "default";
      case "FEMALE":
        return "secondary";
      case "MIXED":
        return "outline";
      case "OPEN":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getGameTypeBadgeVariant = (gameType: string | null) => {
    switch (gameType) {
      case "SINGLES":
        return "default";
      case "DOUBLES":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className="w-full justify-between h-11"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedCategory ? (
          <div className="flex items-center gap-2">
            <span className="font-medium">{selectedCategory.name}</span>
            <span className="text-xs capitalize text-muted-foreground">
              {selectedCategory.game_type?.toLowerCase() || "Unknown"}
            </span>
            <span className="text-xs capitalize text-muted-foreground">
              {selectedCategory.genderRestriction?.toLowerCase() || "Unknown"}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg">
          <div className="p-2">
            <Input
              placeholder="Search categories..."
              className="mb-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div
              ref={scrollContainerRef}
              className="max-h-64 overflow-y-auto overflow-x-hidden"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#d1d5db #f3f4f6",
                WebkitOverflowScrolling: "touch",
              }}
              onWheel={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (scrollContainerRef.current) {
                  scrollContainerRef.current.scrollTop += e.deltaY;
                }
              }}
            >
              {isLoading ? (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  Loading categories...
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  {searchTerm
                    ? "No categories found matching your search."
                    : "No categories found."}
                </div>
              ) : (
                filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategorySelect(category)}
                    className={cn(
                      "flex items-center justify-between px-2 py-1.5 text-sm cursor-pointer rounded-sm hover:bg-accent hover:text-accent-foreground",
                      selectedCategory?.id === category.id &&
                        "bg-accent text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCategory?.id === category.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs capitalize text-muted-foreground">
                        {category.game_type?.toLowerCase() || "Unknown"}
                      </span>
                      <span className="text-xs capitalize text-muted-foreground">
                        {category.genderRestriction?.toLowerCase() || "Unknown"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Details Display */}
      {selectedCategory && (
        <div className="mt-3 p-3 bg-muted/30 rounded-lg border">
          <h4 className="text-sm font-medium mb-2">Category Details</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <Label className="text-muted-foreground">Game Type:</Label>
              <p className="font-medium capitalize">
                {selectedCategory.game_type?.toLowerCase() || "Not set"}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">
                Gender Restriction:
              </Label>
              <p className="font-medium capitalize">
                {selectedCategory.genderRestriction?.toLowerCase() || "Not set"}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Match Format:</Label>
              <p className="font-medium">
                {selectedCategory.matchFormat || "Not set"}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Max Players:</Label>
              <p className="font-medium">
                {selectedCategory.maxPlayers || "Not set"}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Max Teams:</Label>
              <p className="font-medium">
                {selectedCategory.maxTeams || "Not set"}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">League:</Label>
              <p className="font-medium">
                {selectedCategory.league?.name || "Not set"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
