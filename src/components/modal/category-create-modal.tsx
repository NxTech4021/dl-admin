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
import { Check, ChevronsUpDown, Trophy } from "lucide-react";
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
    genderRestriction: "MALE", // Auto-calculated from gender_category
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

  // Auto-calculate gender restriction from gender category
  const getGenderRestriction = (genderCategory: GenderType): GenderRestriction => {
    if (genderCategory === "MIXED") {
      return "MIXED";
    }
    return genderCategory as GenderRestriction;
  };

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
      genderRestriction: getGenderRestriction(value),
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
        genderRestriction: "MALE", // Auto-calculated from gender_category
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
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-3 pr-12">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Trophy className="h-4 w-4 text-primary" />
            Create Category
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="space-y-3">
            {/* Minimal Preview */}
            <div className="border rounded-lg p-3 bg-muted/30">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1.5 truncate">
                    {formData.name || "Category name"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      {GENDER_TYPE_OPTIONS.find(opt => opt.value === formData.gender_category)?.label}
                    </Badge>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      {GAME_TYPE_OPTIONS.find(opt => opt.value === formData.game_type)?.label}
                    </Badge>
                    {formData.matchFormat && (
                      <span className="text-muted-foreground">· {formData.matchFormat}</span>
                    )}
                  </div>
                </div>
                {selectedLeague && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    {selectedLeague.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Category Settings */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="genderCategory" className="text-xs">Gender *</Label>
                <Select
                  value={formData.gender_category}
                  onValueChange={handleGenderChange}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
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

              <div className="space-y-1">
                <Label htmlFor="gameType" className="text-xs">Game Type *</Label>
                <Select
                  value={formData.game_type}
                  onValueChange={handleGameTypeChange}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
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

            <div className="space-y-1">
              <Label htmlFor="matchFormat" className="text-xs">Match Format *</Label>
              <Input
                id="matchFormat"
                value={formData.matchFormat}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    matchFormat: e.target.value,
                  }))
                }
                placeholder="e.g., Best of 3"
                className="h-9"
              />
            </div>

            {/* Max Players and Max Teams */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="maxPlayers" className="text-xs">Max Players</Label>
                <Input
                  id="maxPlayers"
                  type="number"
                  value={formData.maxPlayers || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxPlayers: e.target.value ? parseInt(e.target.value) : null,
                    }))
                  }
                  placeholder="Unlimited"
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="maxTeams" className="text-xs">Max Teams</Label>
                <Input
                  id="maxTeams"
                  type="number"
                  value={formData.maxTeams || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxTeams: e.target.value ? parseInt(e.target.value) : null,
                    }))
                  }
                  placeholder="Unlimited"
                  className="h-9"
                />
              </div>
            </div>

            {/* League Selection */}
            <div className="space-y-1">
              <Label className="text-xs">League *</Label>
              <div className="flex gap-2 items-start">
                <Popover open={leagueSelectOpen} onOpenChange={setLeagueSelectOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={leagueSelectOpen}
                      className="flex-1 justify-between h-9"
                    >
                      {selectedLeague ? selectedLeague.name : "Select league"}
                      <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" style={{ maxHeight: '400px' }}>
                    <div className="p-2">
                      <Input 
                        placeholder="Search..." 
                        className="mb-2 h-8"
                        value={leagueSearchTerm}
                        onChange={(e) => setLeagueSearchTerm(e.target.value)}
                      />
                      <div 
                        ref={scrollContainerRef}
                        className="max-h-56 overflow-y-auto overflow-x-hidden"
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
                          <div className="p-3 text-xs text-muted-foreground text-center">
                            Loading...
                          </div>
                        ) : filteredLeagues.length === 0 ? (
                          <div className="p-3 text-xs text-muted-foreground text-center">
                            {leagueSearchTerm ? "No leagues found" : "No leagues available"}
                          </div>
                        ) : (
                          filteredLeagues.map((league) => (
                            <div
                              key={league.id}
                              onClick={() => selectLeague(league.id)}
                              className={cn(
                                "flex items-center justify-between px-2 py-1.5 text-sm cursor-pointer rounded-sm hover:bg-accent",
                                formData.leagueId === league.id && "bg-accent"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <Check
                                  className={cn(
                                    "h-3.5 w-3.5",
                                    formData.leagueId === league.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <span className="truncate">{league.name}</span>
                              </div>
                              <Badge 
                                variant={getSportTypeBadgeVariant(league.sportType)} 
                                className="text-xs"
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
                {selectedLeague && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1 h-9"
                  >
                    {selectedLeague.name}
                    <IconX
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => setFormData(prev => ({ ...prev, leagueId: null }))}
                    />
                  </Badge>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-2 border rounded-md">
              <Label htmlFor="isActive" className="text-xs font-medium cursor-pointer">
                Active
              </Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: checked,
                  }))
                }
                className="scale-75"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 px-6 pt-4 pb-6 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            size="sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              loading ||
              !formData.name ||
              !formData.matchFormat ||
              !formData.leagueId
            }
            size="sm"
          >
            {loading ? (
              <>
                <IconLoader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Trophy className="mr-1.5 h-3.5 w-3.5" />
                Create
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
