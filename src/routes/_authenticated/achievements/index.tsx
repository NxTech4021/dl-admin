import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  IconTrophy,
  IconPlus,
  IconEdit,
  IconTrash,
  IconGift,
  IconLock,
  IconStar,
  IconUsers,
} from "@tabler/icons-react";
import {
  useAchievements,
  useAchievementEvaluators,
  useCreateAchievement,
  useUpdateAchievement,
  useDeleteAchievement,
  useGrantAchievement,
} from "@/hooks/queries";
import type { Achievement, AchievementCategory, AchievementTier, AchievementScope } from "@/constants/zod/achievement-schema";
import { AnimatedContainer, AnimatedFilterBar } from "@/components/ui/animated-container";
import {
  statsGridContainer,
  statsCardVariants,
  defaultTransition,
} from "@/lib/animation-variants";

export const Route = createFileRoute("/_authenticated/achievements/")({
  component: AchievementsPage,
});

// Tier badge colors
const TIER_COLORS: Record<string, string> = {
  NONE: "#6B7280",
  BRONZE: "#CD7F32",
  SILVER: "#C0C0C0",
  GOLD: "#FFD700",
  PLATINUM: "#FE9F4D",
};

// Category badge colors
const CATEGORY_COLORS: Record<string, string> = {
  MATCH_COUNTER: "#3B82F6",
  LEAGUE_SEASON: "#10B981",
  WINNING: "#F59E0B",
  MULTI_SPORT: "#8B5CF6",
  MATCH_STREAK: "#EF4444",
};

const CATEGORY_OPTIONS = [
  { value: "MATCH_COUNTER", label: "Match Counter" },
  { value: "LEAGUE_SEASON", label: "League & Season" },
  { value: "WINNING", label: "Winning" },
  { value: "MULTI_SPORT", label: "Multi-Sport" },
  { value: "MATCH_STREAK", label: "Match Streak" },
];

const TIER_OPTIONS = [
  { value: "NONE", label: "None" },
  { value: "BRONZE", label: "Bronze" },
  { value: "SILVER", label: "Silver" },
  { value: "GOLD", label: "Gold" },
  { value: "PLATINUM", label: "Platinum" },
];

const SCOPE_OPTIONS = [
  { value: "MATCH", label: "Match" },
  { value: "SEASON", label: "Season" },
  { value: "LIFETIME", label: "Lifetime" },
];

const SPORT_OPTIONS = [
  { value: "TENNIS", label: "Tennis" },
  { value: "PICKLEBALL", label: "Pickleball" },
  { value: "PADEL", label: "Padel" },
];

const GAME_TYPE_OPTIONS = [
  { value: "SINGLES", label: "Singles" },
  { value: "DOUBLES", label: "Doubles" },
];

type AchievementFormData = {
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  tier: AchievementTier;
  scope: AchievementScope;
  evaluatorKey: string;
  threshold: number;
  points: number;
  sortOrder: number;
  isHidden: boolean;
  isActive: boolean;
  sportFilter: string;
  gameTypeFilter: string;
};

const DEFAULT_FORM: AchievementFormData = {
  title: "",
  description: "",
  icon: "trophy-outline",
  category: "MATCH_COUNTER",
  tier: "BRONZE",
  scope: "LIFETIME",
  evaluatorKey: "",
  threshold: 1,
  points: 10,
  sortOrder: 0,
  isHidden: false,
  isActive: true,
  sportFilter: "",
  gameTypeFilter: "",
};

function AchievementsPage() {
  // Filter state
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string | undefined>();
  const [tierFilter, setTierFilter] = React.useState<string | undefined>();
  const [showInactive, setShowInactive] = React.useState(false);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Modal states
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingAchievement, setEditingAchievement] = React.useState<Achievement | null>(null);
  const [isGrantOpen, setIsGrantOpen] = React.useState(false);
  const [grantAchievement, setGrantAchievement] = React.useState<Achievement | null>(null);
  const [grantUserId, setGrantUserId] = React.useState("");
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [deletingAchievement, setDeletingAchievement] = React.useState<Achievement | null>(null);

  // Form state
  const [form, setForm] = React.useState<AchievementFormData>(DEFAULT_FORM);

  // Queries
  const { data: achievements, isLoading } = useAchievements({
    category: categoryFilter,
    tier: tierFilter,
    search: debouncedSearch || undefined,
  });
  const { data: evaluators } = useAchievementEvaluators();

  // Mutations
  const createMutation = useCreateAchievement();
  const updateMutation = useUpdateAchievement();
  const deleteMutation = useDeleteAchievement();
  const grantMutation = useGrantAchievement();

  // Filter achievements locally for active/inactive toggle and search
  const filteredAchievements = React.useMemo(() => {
    if (!achievements) return [];
    let filtered = achievements;
    if (!showInactive) {
      filtered = filtered.filter((a) => a.isActive);
    }
    return filtered;
  }, [achievements, showInactive]);

  // Computed stats
  const stats = React.useMemo(() => {
    if (!achievements) return { total: 0, totalUnlocks: 0, mostCommon: "-", rarest: "-" };

    const active = achievements.filter((a) => a.isActive);
    const totalUnlocks = achievements.reduce((sum, a) => sum + (a.unlockCount ?? 0), 0);

    const withUnlocks = achievements.filter((a) => (a.unlockCount ?? 0) > 0);
    const mostCommon = withUnlocks.length > 0
      ? withUnlocks.reduce((max, a) => (a.unlockCount ?? 0) > (max.unlockCount ?? 0) ? a : max).title
      : "-";
    const rarest = withUnlocks.length > 0
      ? withUnlocks.reduce((min, a) => (a.unlockCount ?? 0) < (min.unlockCount ?? 0) ? a : min).title
      : "-";

    return { total: active.length, totalUnlocks, mostCommon, rarest };
  }, [achievements]);

  // Open create dialog
  const handleCreate = React.useCallback(() => {
    setEditingAchievement(null);
    setForm(DEFAULT_FORM);
    setIsFormOpen(true);
  }, []);

  // Open edit dialog
  const handleEdit = React.useCallback((achievement: Achievement) => {
    setEditingAchievement(achievement);
    setForm({
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      category: achievement.category,
      tier: achievement.tier,
      scope: achievement.scope,
      evaluatorKey: achievement.evaluatorKey,
      threshold: achievement.threshold,
      points: achievement.points,
      sortOrder: achievement.sortOrder,
      isHidden: achievement.isHidden,
      isActive: achievement.isActive,
      sportFilter: achievement.sportFilter ?? "",
      gameTypeFilter: achievement.gameTypeFilter ?? "",
    });
    setIsFormOpen(true);
  }, []);

  // Open grant dialog
  const handleOpenGrant = React.useCallback((achievement: Achievement) => {
    setGrantAchievement(achievement);
    setGrantUserId("");
    setIsGrantOpen(true);
  }, []);

  // Open delete confirmation
  const handleOpenDelete = React.useCallback((achievement: Achievement) => {
    setDeletingAchievement(achievement);
    setIsDeleteOpen(true);
  }, []);

  // Submit create/edit form
  const handleSubmitForm = React.useCallback(async () => {
    const payload = {
      ...form,
      sportFilter: form.sportFilter || null,
      gameTypeFilter: form.gameTypeFilter || null,
    };

    try {
      if (editingAchievement) {
        await updateMutation.mutateAsync({ id: editingAchievement.id, data: payload });
        toast.success("Achievement updated successfully");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Achievement created successfully");
      }
      setIsFormOpen(false);
    } catch {
      toast.error(editingAchievement ? "Failed to update achievement" : "Failed to create achievement");
    }
  }, [form, editingAchievement, updateMutation, createMutation]);

  // Confirm delete
  const handleConfirmDelete = React.useCallback(async () => {
    if (!deletingAchievement) return;
    try {
      await deleteMutation.mutateAsync(deletingAchievement.id);
      toast.success("Achievement deactivated successfully");
      setIsDeleteOpen(false);
      setDeletingAchievement(null);
    } catch {
      toast.error("Failed to deactivate achievement");
    }
  }, [deletingAchievement, deleteMutation]);

  // Reactivate achievement
  const handleReactivate = React.useCallback(async (achievement: Achievement) => {
    try {
      await updateMutation.mutateAsync({ id: achievement.id, data: { isActive: true } });
      toast.success(`"${achievement.title}" reactivated successfully`);
    } catch {
      toast.error("Failed to reactivate achievement");
    }
  }, [updateMutation]);

  // Confirm grant
  const handleConfirmGrant = React.useCallback(async () => {
    if (!grantAchievement || !grantUserId.trim()) return;
    try {
      await grantMutation.mutateAsync({ id: grantAchievement.id, userId: grantUserId.trim() });
      toast.success("Achievement granted successfully");
      setIsGrantOpen(false);
      setGrantAchievement(null);
      setGrantUserId("");
    } catch {
      toast.error("Failed to grant achievement");
    }
  }, [grantAchievement, grantUserId, grantMutation]);

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-6">
            {/* Page Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="px-4 lg:px-6 py-6">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-center gap-3">
                      <IconTrophy className="size-8 text-primary" />
                      <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                          Achievements
                        </h1>
                        <p className="text-muted-foreground">
                          Manage achievements, badges, and player rewards
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={handleCreate} size="sm">
                        <IconPlus className="size-4 mr-1" />
                        New Achievement
                      </Button>
                    </div>
                  </div>

                  {/* Statistics Cards */}
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={statsGridContainer}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
                  >
                    {/* Total Active */}
                    <motion.div
                      variants={statsCardVariants}
                      transition={defaultTransition}
                      className="rounded-lg border bg-card p-3 sm:p-4"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted">
                          <IconTrophy className="size-4 sm:size-5 text-muted-foreground" />
                        </div>
                        <div>
                          {isLoading ? (
                            <Skeleton className="h-7 w-12" />
                          ) : (
                            <p className="text-xl sm:text-2xl font-bold">
                              {stats.total}
                            </p>
                          )}
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Total Active</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Total Unlocks */}
                    <motion.div
                      variants={statsCardVariants}
                      transition={defaultTransition}
                      className="rounded-lg border bg-card p-3 sm:p-4"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50">
                          <IconLock className="size-4 sm:size-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          {isLoading ? (
                            <Skeleton className="h-7 w-12" />
                          ) : (
                            <p className="text-xl sm:text-2xl font-bold">
                              {stats.totalUnlocks}
                            </p>
                          )}
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Total Unlocks</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Most Common */}
                    <motion.div
                      variants={statsCardVariants}
                      transition={defaultTransition}
                      className="rounded-lg border bg-card p-3 sm:p-4"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-50 dark:bg-amber-950/50">
                          <IconUsers className="size-4 sm:size-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          {isLoading ? (
                            <Skeleton className="h-7 w-20" />
                          ) : (
                            <p className="text-sm sm:text-base font-bold truncate max-w-[120px]" title={stats.mostCommon}>
                              {stats.mostCommon}
                            </p>
                          )}
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Most Common</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Rarest */}
                    <motion.div
                      variants={statsCardVariants}
                      transition={defaultTransition}
                      className="rounded-lg border bg-card p-3 sm:p-4"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-50 dark:bg-purple-950/50">
                          <IconStar className="size-4 sm:size-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          {isLoading ? (
                            <Skeleton className="h-7 w-20" />
                          ) : (
                            <p className="text-sm sm:text-base font-bold truncate max-w-[120px]" title={stats.rarest}>
                              {stats.rarest}
                            </p>
                          )}
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Rarest</p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 lg:px-6 pb-6 space-y-4">
              {/* Filters */}
              <AnimatedFilterBar>
                <div className="flex flex-wrap items-center gap-3">
                  <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search achievements..."
                    className="w-[220px]"
                  />
                  <FilterSelect
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    options={CATEGORY_OPTIONS}
                    placeholder="Category"
                    allLabel="All Categories"
                  />
                  <FilterSelect
                    value={tierFilter}
                    onChange={setTierFilter}
                    options={TIER_OPTIONS}
                    placeholder="Tier"
                    allLabel="All Tiers"
                  />
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={showInactive}
                      onCheckedChange={setShowInactive}
                      id="show-inactive"
                    />
                    <Label htmlFor="show-inactive" className="text-sm text-muted-foreground cursor-pointer">
                      Show Inactive
                    </Label>
                  </div>
                </div>
              </AnimatedFilterBar>

              {/* Data Table */}
              <AnimatedContainer delay={0.1}>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">Icon</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead className="text-right">Threshold</TableHead>
                        <TableHead className="text-right">Unlocks</TableHead>
                        <TableHead className="text-right">Unlock Rate</TableHead>
                        <TableHead className="text-center">Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            {Array.from({ length: 9 }).map((_, j) => (
                              <TableCell key={j}>
                                <Skeleton className="h-5 w-full" />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : filteredAchievements.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                            No achievements found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAchievements.map((achievement) => {
                          const unlockCount = achievement.unlockCount ?? 0;
                          const totalPlayers = achievement.totalPlayers ?? 0;
                          const unlockRate = totalPlayers > 0
                            ? ((unlockCount / totalPlayers) * 100).toFixed(1)
                            : "0.0";

                          return (
                            <TableRow key={achievement.id}>
                              <TableCell>
                                <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                                  {achievement.icon}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <span className="font-medium">{achievement.title}</span>
                                  {achievement.isHidden && (
                                    <Badge variant="outline" className="ml-2 text-[10px]">
                                      Hidden
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {achievement.description}
                                </p>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  style={{
                                    backgroundColor: CATEGORY_COLORS[achievement.category] ?? "#6B7280",
                                    color: "#fff",
                                    borderColor: "transparent",
                                  }}
                                >
                                  {achievement.category}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  style={{
                                    backgroundColor: TIER_COLORS[achievement.tier] ?? "#6B7280",
                                    color: (achievement.tier === "SILVER" || achievement.tier === "NONE") ? "#1a1a1a" : "#fff",
                                    borderColor: "transparent",
                                  }}
                                >
                                  {achievement.tier}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {achievement.threshold}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {unlockCount}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {unlockRate}%
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant={achievement.isActive ? "default" : "secondary"}>
                                  {achievement.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    onClick={() => handleEdit(achievement)}
                                    title="Edit"
                                  >
                                    <IconEdit className="size-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    onClick={() => handleOpenGrant(achievement)}
                                    title="Grant to user"
                                  >
                                    <IconGift className="size-4" />
                                  </Button>
                                  {!achievement.isActive ? (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-8 text-emerald-600 hover:text-emerald-600"
                                      onClick={() => handleReactivate(achievement)}
                                      title="Reactivate"
                                    >
                                      <IconTrophy className="size-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-8 text-destructive hover:text-destructive"
                                      onClick={() => handleOpenDelete(achievement)}
                                      title="Deactivate"
                                    >
                                      <IconTrash className="size-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </AnimatedContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAchievement ? "Edit Achievement" : "Create Achievement"}
            </DialogTitle>
            <DialogDescription>
              {editingAchievement
                ? "Update the achievement details below."
                : "Fill in the details to create a new achievement."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="First Victory"
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Win your first competitive match"
              />
            </div>

            {/* Icon */}
            <div className="grid gap-2">
              <Label htmlFor="icon">Icon (Ionicons name)</Label>
              <Input
                id="icon"
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder="trophy-outline"
              />
            </div>

            {/* Category & Tier */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v as AchievementCategory }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Tier</Label>
                <Select
                  value={form.tier}
                  onValueChange={(v) => setForm((f) => ({ ...f, tier: v as AchievementTier }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Scope & Evaluator Key */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Scope</Label>
                <Select
                  value={form.scope}
                  onValueChange={(v) => setForm((f) => ({ ...f, scope: v as AchievementScope }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCOPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Evaluator Key</Label>
                <Select
                  value={form.evaluatorKey}
                  onValueChange={(v) => setForm((f) => ({ ...f, evaluatorKey: v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select evaluator" />
                  </SelectTrigger>
                  <SelectContent>
                    {(evaluators ?? []).map((key) => (
                      <SelectItem key={key} value={key}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Threshold & Points */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="threshold">Threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  min={0}
                  value={form.threshold}
                  onChange={(e) => setForm((f) => ({ ...f, threshold: Number(e.target.value) }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  min={0}
                  value={form.points}
                  onChange={(e) => setForm((f) => ({ ...f, points: Number(e.target.value) }))}
                />
              </div>
            </div>

            {/* Sort Order */}
            <div className="grid gap-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
              />
            </div>

            {/* Sport Filter & Game Type Filter */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Sport Filter (optional)</Label>
                <Select
                  value={form.sportFilter || "_none"}
                  onValueChange={(v) => setForm((f) => ({ ...f, sportFilter: v === "_none" ? "" : v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="No filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">No filter</SelectItem>
                    {SPORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Game Type Filter (optional)</Label>
                <Select
                  value={form.gameTypeFilter || "_none"}
                  onValueChange={(v) => setForm((f) => ({ ...f, gameTypeFilter: v === "_none" ? "" : v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="No filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">No filter</SelectItem>
                    {GAME_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isHidden"
                  checked={form.isHidden}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, isHidden: checked === true }))
                  }
                />
                <Label htmlFor="isHidden" className="cursor-pointer">Hidden</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isActive"
                  checked={form.isActive}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, isActive: checked === true }))
                  }
                />
                <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitForm}
              disabled={
                !form.title.trim() ||
                !form.evaluatorKey ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : editingAchievement
                  ? "Update"
                  : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grant Dialog */}
      <Dialog open={isGrantOpen} onOpenChange={setIsGrantOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Grant Achievement</DialogTitle>
            <DialogDescription>
              Grant &quot;{grantAchievement?.title}&quot; to a player by entering their user ID.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="grantUserId">Player User ID</Label>
              <Input
                id="grantUserId"
                value={grantUserId}
                onChange={(e) => setGrantUserId(e.target.value)}
                placeholder="e.g. cm3abc123..."
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                You can find user IDs in the Players management page.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGrantOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmGrant}
              disabled={!grantUserId.trim() || grantUserId.trim().length < 10 || grantMutation.isPending}
            >
              {grantMutation.isPending ? "Granting..." : "Grant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Deactivate Achievement</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate &quot;{deletingAchievement?.title}&quot;? This will soft-delete the achievement. It can be reactivated later.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deactivating..." : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
