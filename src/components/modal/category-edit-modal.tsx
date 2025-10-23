"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { IconLoader2, IconX } from "@tabler/icons-react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { Category } from "@/ZodSchema/category-schema";

type GameType = "SINGLES" | "DOUBLES";
type GenderType = "MALE" | "FEMALE" | "MIXED";
type GenderRestriction = "MALE" | "FEMALE" | "MIXED" | "OPEN";

const GAME_TYPE_OPTIONS: { value: GameType; label: string }[] = [
  { value: "SINGLES", label: "Singles" },
  { value: "DOUBLES", label: "Doubles" },
];

const GENDER_TYPE_OPTIONS: { value: GenderType; label: string }[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "MIXED", label: "Mixed" },
];

const GENDER_RESTRICTION_OPTIONS: { value: GenderRestriction; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "MALE", label: "Male Only" },
  { value: "FEMALE", label: "Female Only" },
  { value: "MIXED", label: "Mixed" },
];

const getSportTypeBadgeVariant = (sportType: string) => {
  switch (sportType?.toUpperCase()) {
    case "PADEL":
      return "default";
    case "PICKLEBALL":
      return "secondary";
    case "TENNIS":
      return "outline";
    default:
      return "outline";
  }
};

interface League {
  id: string;
  name: string;
  sportType: string;
}

interface CategoryFormData {
  name: string;
  matchFormat: string;
  game_type: GameType;
  gender_category: GenderType;
  genderRestriction: GenderRestriction;
  maxPlayers: number | null;
  maxTeams: number | null;
  isActive: boolean;
  categoryOrder: number;
  leagueIds: string[];
}

interface CategoryEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  onCategoryUpdated?: () => Promise<void>;
}

export default function CategoryEditModal({
  open,
  onOpenChange,
  categoryId,
  onCategoryUpdated,
}: CategoryEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [leagues, setLeagues] = useState<League[]>([]);
  const [leaguesLoading, setLeaguesLoading] = useState(false);
  const [leagueSelectOpen, setLeagueSelectOpen] = useState(false);
  const [leagueSearchTerm, setLeagueSearchTerm] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState<Category | null>(null);

  // Form data
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    matchFormat: "",
    game_type: "SINGLES",
    gender_category: "MALE",
    genderRestriction: "OPEN",
    maxPlayers: null,
    maxTeams: null,
    categoryOrder: 0,
    leagueIds: [],
    isActive: true,
  });

  // Helper functions
  const generateCategoryName = useCallback(
    (gender: GenderType, gameType: GameType) => {
      let genderPrefix;
      if (gender === "MIXED") {
        genderPrefix = "Mixed";
      } else {
        genderPrefix = `${gender.charAt(0)}${gender.slice(1).toLowerCase()}'s`;
      }
      const gameTypeSuffix =
        gameType.charAt(0) + gameType.slice(1).toLowerCase();
      return `${genderPrefix} ${gameTypeSuffix}`;
    },
    []
  );

  const handleGameTypeChange = (value: GameType) => {
    setFormData((prev) => ({
      ...prev,
      game_type: value,
      name: generateCategoryName(prev.gender_category, value),
    }));
  };

  const handleGenderChange = (value: GenderType) => {
    setFormData((prev) => ({
      ...prev,
      gender_category: value,
      name: generateCategoryName(value, prev.game_type),
    }));
  };

  const toggleLeague = (leagueId: string) => {
    setFormData((prev) => ({
      ...prev,
      leagueIds: prev.leagueIds.includes(leagueId)
        ? prev.leagueIds.filter((id) => id !== leagueId)
        : [...prev.leagueIds, leagueId],
    }));
  };

  const removeLeague = (leagueId: string) => {
    setFormData((prev) => ({
      ...prev,
      leagueIds: prev.leagueIds.filter((id) => id !== leagueId),
    }));
  };

  // Computed values
  const selectedLeagues = useMemo(() => {
    return leagues.filter((league) => formData.leagueIds.includes(league.id));
  }, [leagues, formData.leagueIds]);
  
  // Filter leagues based on search term
  const filteredLeagues = useMemo(() => {
    return leagues.filter((league) =>
      league.name.toLowerCase().includes(leagueSearchTerm.toLowerCase())
    );
  }, [leagues, leagueSearchTerm]);

  // Fetch category data and leagues on mount
  useEffect(() => {
    if (open && categoryId) {
      setFetching(true);
      
      // Fetch category data
      axiosInstance
        .get(endpoints.categories.getById(categoryId))
        .then((res) => {
          const categoryData = res.data?.data;
          if (categoryData) {
            setCategory(categoryData);
            
            // Map genderRestriction to gender_category
            let mappedGenderCategory: GenderType = "MIXED";
            if (categoryData.genderRestriction === "MALE") {
              mappedGenderCategory = "MEN";
            } else if (categoryData.genderRestriction === "FEMALE") {
              mappedGenderCategory = "WOMEN";
            } else if (categoryData.genderRestriction === "MIXED") {
              mappedGenderCategory = "MIXED";
            } else if (categoryData.genderRestriction === "OPEN") {
              mappedGenderCategory = "MIXED";
            }
            
            setFormData({
              name: categoryData.name || "",
              matchFormat: categoryData.matchFormat || "",
              game_type: categoryData.game_type || "SINGLES",
              gender_category: mappedGenderCategory,
              genderRestriction: categoryData.genderRestriction || "OPEN",
              maxPlayers: categoryData.maxPlayers || null,
              maxTeams: categoryData.maxTeams || null,
              categoryOrder: categoryData.categoryOrder || 0,
              leagueIds: categoryData.leagues?.map((league: any) => league.id) || [],
              isActive: categoryData.isActive ?? true,
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching category:", error);
          setError("Failed to load category data");
        });

      // Fetch leagues
      setLeaguesLoading(true);
      axiosInstance
        .get(endpoints.league.getAll)
        .then((res) => {
          const leaguesData = res.data?.data;
          console.log("Leagues API response:", res.data);
          
          // Handle nested structure: {leagues: Array, totalMembers: number, totalCategories: number}
          if (leaguesData?.leagues && Array.isArray(leaguesData.leagues)) {
            setLeagues(leaguesData.leagues);
          } else if (Array.isArray(leaguesData)) {
            setLeagues(leaguesData);
          } else {
            console.warn("Leagues data is not an array:", leaguesData);
            setLeagues([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching leagues:", error);
          setLeagues([]);
        })
        .finally(() => {
          setLeaguesLoading(false);
          setFetching(false);
        });
    }
  }, [open, categoryId]);

  const resetModal = () => {
    setFormData({
      name: "",
      matchFormat: "",
      game_type: "SINGLES",
      gender_category: "MALE",
      genderRestriction: "OPEN",
      maxPlayers: null,
      maxTeams: null,
      categoryOrder: 0,
      leagueIds: [],
      isActive: true,
    });
    setError("");
    setCategory(null);
  };

  const handleClose = () => {
    resetModal();
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.matchFormat || formData.leagueIds.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Map gender_category back to genderRestriction
      const genderRestriction = 
        formData.gender_category === "MEN" ? "MALE" :
        formData.gender_category === "WOMEN" ? "FEMALE" :
        formData.gender_category === "MIXED" ? "MIXED" : "OPEN";

      const updateData = {
        name: formData.name,
        genderRestriction,
        matchFormat: formData.matchFormat,
        game_type: formData.game_type,
        gender_category: formData.gender_category,
        categoryOrder: formData.categoryOrder,
        leagueIds: formData.leagueIds,
        isActive: formData.isActive,
      };

      const response = await axiosInstance.put(
        endpoints.categories.update(categoryId),
        updateData
      );

      if (response.status === 200) {
        toast.success("Category updated successfully!");
        handleClose();
        if (onCategoryUpdated) {
          await onCategoryUpdated();
        }
      } else {
        throw new Error("Failed to update category");
      }
    } catch (err: any) {
      console.error("Error updating category:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to update category";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Loading</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <IconLoader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading category data...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Update the tournament category with specific settings and league assignments.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="grid gap-6">
          {/* Preview Card */}
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <h3 className="font-semibold text-lg mb-2">
              {formData.name || "Select options below"}
            </h3>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {formData.matchFormat || "Match format will be set automatically"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Gender Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="genderCategory">Gender Category</Label>
              <Select
                value={formData.gender_category}
                onValueChange={handleGenderChange}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select gender category" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Game Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="gameType">Game Type</Label>
              <Select
                value={formData.game_type}
                onValueChange={handleGameTypeChange}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select game type" />
                </SelectTrigger>
                <SelectContent>
                  {GAME_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Match Format *</Label>
            <Input
              value={formData.matchFormat}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  matchFormat: e.target.value,
                }))
              }
              placeholder="e.g., Best of 3 Sets, Pro Sets, etc."
              className="h-11"
            />
            <p className="text-sm text-muted-foreground">
              Specify the match format for this category
            </p>
          </div>

          {/* League Selection */}
          <div className="space-y-2">
            <Label>Select Leagues *</Label>
            <Popover open={leagueSelectOpen} onOpenChange={setLeagueSelectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={leagueSelectOpen}
                  className="w-full justify-between h-11"
                >
                  {selectedLeagues.length > 0
                    ? `${selectedLeagues.length} league(s) selected`
                    : "Select leagues..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" style={{ maxHeight: '400px' }}>
                <div className="p-2">
                  <Input 
                    placeholder="Search leagues..." 
                    className="mb-2"
                    value={leagueSearchTerm}
                    onChange={(e) => setLeagueSearchTerm(e.target.value)}
                  />
                  <div 
                    ref={scrollContainerRef}
                    className="max-h-64 overflow-y-auto overflow-x-hidden"
                    style={{ 
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#d1d5db #f3f4f6',
                      WebkitOverflowScrolling: 'touch'
                    }}
                    onWheel={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (scrollContainerRef.current) {
                        scrollContainerRef.current.scrollTop += e.deltaY;
                      }
                    }}
                  >
                    {leaguesLoading ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        Loading leagues...
                      </div>
                    ) : filteredLeagues.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        {leagueSearchTerm ? "No leagues found matching your search." : "No leagues found."}
                      </div>
                    ) : (
                      filteredLeagues.map((league) => (
                        <div
                          key={league.id}
                          onClick={() => toggleLeague(league.id)}
                          className={cn(
                            "flex items-center justify-between px-2 py-1.5 text-sm cursor-pointer rounded-sm hover:bg-accent hover:text-accent-foreground",
                            formData.leagueIds.includes(league.id) && "bg-accent text-accent-foreground"
                          )}
                        >
                          <div className="flex items-center">
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.leagueIds.includes(league.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <span className="font-medium">{league.name}</span>
                          </div>
                          <Badge 
                            variant={getSportTypeBadgeVariant(league.sportType)} 
                            className="text-xs capitalize"
                          >
                            {league.sportType?.toLowerCase() || "Unknown"}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Selected Leagues */}
            {selectedLeagues.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedLeagues.map((league) => (
                  <Badge key={league.id} variant="secondary" className="flex items-center gap-1">
                    {league.name}
                    <IconX
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeLeague(league.id)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  isActive: checked,
                }))
              }
            />
            <Label htmlFor="isActive">Active Category</Label>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            onClick={handleSubmit}
            disabled={
              loading ||
              !formData.name ||
              !formData.matchFormat ||
              formData.leagueIds.length === 0
            }
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Category"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}