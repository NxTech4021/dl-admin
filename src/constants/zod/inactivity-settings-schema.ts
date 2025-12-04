import { z } from "zod";

// ===== INACTIVITY SETTINGS SCHEMA =====

/** Schema for inactivity settings from backend */
export const inactivitySettingsSchema = z.object({
  // ID is optional - defaults don't have an ID
  id: z.string().optional(),

  // Scope - Can be global, league-specific, or season-specific
  leagueId: z.string().nullable().optional(),
  seasonId: z.string().nullable().optional(),

  // Configuration
  inactivityThresholdDays: z.number().min(1).max(365),
  warningThresholdDays: z.number().nullable().optional(),

  // Behavior
  autoMarkInactive: z.boolean().default(true),
  excludeFromPairing: z.boolean().default(true),
  sendReminderEmail: z.boolean().default(true),
  reminderDaysBefore: z.number().nullable().optional(),

  // Flag to indicate if these are default values (no saved settings)
  isDefault: z.boolean().optional(),

  // Audit (optional - defaults don't have these)
  updatedByAdminId: z.string().optional(),
  updatedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date().optional(),

  // Relations (optional - may not always be included)
  league: z.object({
    id: z.string(),
    name: z.string(),
  }).nullable().optional(),
  season: z.object({
    id: z.string(),
    name: z.string(),
  }).nullable().optional(),
  updatedBy: z.object({
    id: z.string(),
    userId: z.string(),
    user: z.object({
      name: z.string(),
    }).optional(),
  }).optional(),
}).passthrough();

/** Schema for inactivity stats from backend */
export const inactivityStatsSchema = z.object({
  // Backend returns: active, inactive, atRisk, total
  total: z.number(),
  active: z.number(),
  inactive: z.number(),
  atRisk: z.number().optional(),
}).passthrough().transform((data) => ({
  // Transform to expected frontend field names
  totalUsers: data.total,
  activeUsers: data.active,
  inactiveUsers: data.inactive,
  warningUsers: data.atRisk ?? 0,
}));

/** Schema for creating/updating inactivity settings */
export const inactivitySettingsInputSchema = z.object({
  // Scope (optional - omit for global settings)
  leagueId: z.string().optional(),
  seasonId: z.string().optional(),

  // Required field
  inactivityThresholdDays: z.number()
    .min(1, "Threshold must be at least 1 day")
    .max(365, "Threshold cannot exceed 365 days"),

  // Optional fields
  warningThresholdDays: z.number()
    .min(1, "Warning threshold must be at least 1 day")
    .optional(),

  autoMarkInactive: z.boolean().optional(),
  excludeFromPairing: z.boolean().optional(),
  sendReminderEmail: z.boolean().optional(),
  reminderDaysBefore: z.number().min(1).optional(),
}).refine(
  (data) => {
    // Warning threshold must be less than inactivity threshold
    if (data.warningThresholdDays && data.inactivityThresholdDays) {
      return data.warningThresholdDays < data.inactivityThresholdDays;
    }
    return true;
  },
  {
    message: "Warning threshold must be less than inactivity threshold",
    path: ["warningThresholdDays"],
  }
);

// ===== TYPES =====
export type InactivitySettings = z.infer<typeof inactivitySettingsSchema>;
export type InactivityStats = z.infer<typeof inactivityStatsSchema>;
export type InactivitySettingsInput = z.infer<typeof inactivitySettingsInputSchema>;

// ===== FORM SCHEMA (for react-hook-form) =====
export const inactivitySettingsFormSchema = z.object({
  inactivityThresholdDays: z.number()
    .min(1, "Threshold must be at least 1 day")
    .max(365, "Threshold cannot exceed 365 days"),

  warningThresholdDays: z.number()
    .min(1, "Warning threshold must be at least 1 day")
    .nullable()
    .optional(),

  autoMarkInactive: z.boolean(),
  excludeFromPairing: z.boolean(),
  sendReminderEmail: z.boolean(),
  reminderDaysBefore: z.number().min(1).nullable().optional(),
});

export type InactivitySettingsFormValues = z.infer<typeof inactivitySettingsFormSchema>;
