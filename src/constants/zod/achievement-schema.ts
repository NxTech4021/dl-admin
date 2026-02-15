import { z } from "zod";

export const achievementTierEnum = z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]);
export const achievementCategoryEnum = z.enum(["COMPETITION", "RATING", "SEASON", "SOCIAL"]);
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
  createdAt: z.string(),
  updatedAt: z.string(),
  unlockCount: z.number().default(0),
  totalPlayers: z.number().default(0),
});

export type Achievement = z.infer<typeof achievementSchema>;
export type AchievementTier = z.infer<typeof achievementTierEnum>;
export type AchievementCategory = z.infer<typeof achievementCategoryEnum>;
export type AchievementScope = z.infer<typeof achievementScopeEnum>;
