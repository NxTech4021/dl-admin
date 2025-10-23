"use client";

import { useState, useCallback, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
import { Badge } from "@/components/ui/badge";
import { IconLoader2, IconX } from "@tabler/icons-react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import axiosInstance, { endpoints } from "@/lib/endpoints";

type GameType = "SINGLES" | "DOUBLES";
type GenderType = "MEN" | "WOMEN" | "MIXED";

const GAME_TYPE_OPTIONS: { value: GameType; label: string }[] = [
  { value: "SINGLES", label: "Singles" },
  { value: "DOUBLES", label: "Doubles" },
];

const GENDER_OPTIONS: { value: GenderType; label: string }[] = [
  { value: "MEN", label: "Men" },
  { value: "WOMEN", label: "Women" },
  { value: "MIXED", label: "Mixed" },
];

interface League {
  id: string;
  name: string;
}

interface CategoryFormData {
  name: string;
  matchFormat: string;
  game_type: GameType;
  gender_category: GenderType;
  isActive: boolean;
  categoryOrder: number;
  leagueIds: string[];
}

interface CategoryCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated?: () => Promise<void>;
}

export default function CategoryCreateModal({
  open,
  onOpenChange,
  onCategoryCreated,
}: CategoryCreateModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    matchFormat: "",
    game_type: "SINGLES",
    gender_category: "MIXED",
    isActive: true,
    categoryOrder: 0,
    leagueIds: [],
  });
  const [loading, setLoading] = useState(false);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [leaguesLoading, setLeaguesLoading] = useState(false);
  const [leagueSelectOpen, setLeagueSelectOpen] = useState(false);

  // Fetch leagues on mount
  useEffect(() => {
    if (open) {
      setLeaguesLoading(true);
      axiosInstance
        .get(endpoints.league.getAll)
        .then((res) => {
          console.log("Leagues API response:", res.data);
          // The leagues are nested under data.leagues
          const leaguesData = res.data?.data?.leagues || res.data?.leagues || [];
          // Ensure we always set an array
          if (Array.isArray(leaguesData)) {
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
        .finally(() => setLeaguesLoading(false));
    }
  }, [open]);

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

  const selectedLeagues = leagues.filter((league) => formData.leagueIds.includes(league.id));

  const handleSubmit = async () => {
    if (!formData.name || !formData.matchFormat || formData.leagueIds.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Map gender_category to genderRestriction
      const genderRestriction =
        formData.gender_category === "MIXED"
          ? "OPEN"
          : formData.gender_category === "MEN"
          ? "MALE"
          : "FEMALE";

      await axiosInstance.post(endpoints.categories.create, {
        leagueIds: formData.leagueIds,
        name: formData.name,
        genderRestriction,
        matchFormat: formData.matchFormat,
        game_type: formData.game_type,
        gender_category: formData.gender_category,
        isActive: formData.isActive,
        categoryOrder: formData.categoryOrder,
      });

      toast.success("Category created successfully!");
      onOpenChange(false);
      if (onCategoryCreated) {
        await onCategoryCreated();
      }
      
      // Reset form
      setFormData({
        name: "",
        matchFormat: "",
        game_type: "SINGLES",
        gender_category: "MIXED",
        isActive: true,
        categoryOrder: 0,
        leagueIds: [],
      });
    } catch (err: any) {
      console.error("Error creating category:", err);
      toast.error(err.response?.data?.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
          <DialogDescription>
            Create a new tournament category with specific settings and league assignments.
          </DialogDescription>
        </DialogHeader>

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
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search leagues..." />
                  <CommandEmpty>
                    {leaguesLoading ? "Loading leagues..." : "No leagues found."}
                  </CommandEmpty>
                  <CommandGroup>
                    {leagues.map((league) => (
                      <CommandItem
                        key={league.id}
                        value={league.name}
                        onSelect={() => toggleLeague(league.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.leagueIds.includes(league.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {league.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
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
                Creating...
              </>
            ) : (
              "Create Category"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
