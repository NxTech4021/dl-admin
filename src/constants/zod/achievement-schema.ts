import { z } from "zod";

export const achievementTierEnum = z.enum(["NONE", "BRONZE", "SILVER", "GOLD", "PLATINUM"]);
export const achievementCategoryEnum = z.enum(["MATCH_COUNTER", "LEAGUE_SEASON", "WINNING", "MULTI_SPORT", "MATCH_STREAK"]);
export const achievementScopeEnum = z.enum(["MATCH", "SEASON", "LIFETIME"]);

export const achievementSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  category: achievementCategoryEnum,
  tier: achievementTierEnum,
  scope: achievementScopeEnum,
  evaluatorKey: z.string(),
  threshold: z.number(),
  sportFilter: z.string().nullable(),
  gameTypeFilter: z.string().nullable(),
  sortOrder: z.number(),
  isHidden: z.boolean(),
  points: z.number(),
  isActive: z.boolean(),
  isRevocable: z.boolean().default(false),
  badgeGroup: z.string().nullable().optional(),
  createdAt: z.coerce.string(),
  updatedAt: z.coerce.string(),
  unlockCount: z.number().default(0),
  totalPlayers: z.number().default(0),
});

export type Achievement = z.infer<typeof achievementSchema>;
export type AchievementTier = z.infer<typeof achievementTierEnum>;
export type AchievementCategory = z.infer<typeof achievementCategoryEnum>;
export type AchievementScope = z.infer<typeof achievementScopeEnum>;
