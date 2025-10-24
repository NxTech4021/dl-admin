"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  leagueId: string | null;
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
    gender_category: "MALE",
    genderRestriction: "OPEN",
    maxPlayers: null,
    maxTeams: null,
    isActive: true,
    categoryOrder: 0,
    leagueId: null,
  });
  const [loading, setLoading] = useState(false);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [leaguesLoading, setLeaguesLoading] = useState(false);
  const [leagueSelectOpen, setLeagueSelectOpen] = useState(false);
  const [leagueSearchTerm, setLeagueSearchTerm] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const selectLeague = (leagueId: string) => {
    setFormData((prev) => ({
      ...prev,
      leagueId: prev.leagueId === leagueId ? null : leagueId,
    }));
  };

  const selectedLeague = leagues.find((league) => league.id === formData.leagueId);
  
  // Filter leagues based on search term
  const filteredLeagues = leagues.filter((league) =>
    league.name.toLowerCase().includes(leagueSearchTerm.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!formData.name || !formData.matchFormat || !formData.leagueId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(endpoints.categories.create, {
        leagueId: formData.leagueId,
        name: formData.name,
        genderRestriction: formData.genderRestriction,
        matchFormat: formData.matchFormat,
        game_type: formData.game_type,
        gender_category: formData.gender_category,
        maxPlayers: formData.maxPlayers,
        maxTeams: formData.maxTeams,
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
        gender_category: "MALE",
        genderRestriction: "OPEN",
        maxPlayers: null,
        maxTeams: null,
        isActive: true,
        categoryOrder: 0,
        leagueId: null,
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
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  {GENDER_TYPE_OPTIONS.find(opt => opt.value === formData.gender_category)?.label || "Gender"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {GAME_TYPE_OPTIONS.find(opt => opt.value === formData.game_type)?.label || "Game Type"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {GENDER_RESTRICTION_OPTIONS.find(opt => opt.value === formData.genderRestriction)?.label || "Restriction"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {formData.matchFormat || "Match format will be set automatically"}
              </p>
              {(formData.maxPlayers || formData.maxTeams) && (
                <p className="text-sm text-muted-foreground">
                  Max: {formData.maxPlayers ? `${formData.maxPlayers} players` : ""} 
                  {formData.maxPlayers && formData.maxTeams ? ", " : ""}
                  {formData.maxTeams ? `${formData.maxTeams} teams` : ""}
                </p>
              )}
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
                  {GENDER_TYPE_OPTIONS.map((option) => (
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

          {/* Gender Restriction */}
          <div className="space-y-2">
            <Label htmlFor="genderRestriction">Gender Restriction</Label>
            <Select
              value={formData.genderRestriction}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  genderRestriction: value as GenderRestriction,
                }))
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select gender restriction" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_RESTRICTION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Restrict participation based on gender
            </p>
          </div>

          {/* Max Players and Max Teams */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxPlayers">Max Players</Label>
              <Input
                type="number"
                value={formData.maxPlayers || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxPlayers: e.target.value ? parseInt(e.target.value) : null,
                  }))
                }
                placeholder="0 for unlimited"
                className="h-11"
              />
              <p className="text-sm text-muted-foreground">
                Maximum number of players (for singles)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxTeams">Max Teams</Label>
              <Input
                type="number"
                value={formData.maxTeams || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxTeams: e.target.value ? parseInt(e.target.value) : null,
                  }))
                }
                placeholder="0 for unlimited"
                className="h-11"
              />
              <p className="text-sm text-muted-foreground">
                Maximum number of teams (for doubles)
              </p>
            </div>
          </div>

          {/* League Selection */}
          <div className="space-y-2">
            <Label>Select League *</Label>
            <Popover open={leagueSelectOpen} onOpenChange={setLeagueSelectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={leagueSelectOpen}
                  className="w-full justify-between h-11"
                >
                  {selectedLeague
                    ? selectedLeague.name
                    : "Select a league..."}
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
                          onClick={() => selectLeague(league.id)}
                          className={cn(
                            "flex items-center justify-between px-2 py-1.5 text-sm cursor-pointer rounded-sm hover:bg-accent hover:text-accent-foreground",
                            formData.leagueId === league.id && "bg-accent text-accent-foreground"
                          )}
                        >
                          <div className="flex items-center">
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.leagueId === league.id
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

            {/* Selected League */}
            {selectedLeague && (
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  {selectedLeague.name}
                  <Badge 
                    variant={getSportTypeBadgeVariant(selectedLeague.sportType)} 
                    className="text-xs capitalize ml-1"
                  >
                    {selectedLeague.sportType?.toLowerCase() || "Unknown"}
                  </Badge>
                  <IconX
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setFormData(prev => ({ ...prev, leagueId: null }))}
                  />
                </Badge>
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
              !formData.leagueId
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
