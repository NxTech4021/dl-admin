import { z } from "zod";

export const divisionLevelEnum = z.enum([
  "beginner",
  "improver",
  "intermediate",
  "upper_intermediate",
  "expert",
  "advanced",
]);

export const gameTypeEnum = z.enum([
  "singles",
  "doubles",
]);

export const genderCategoryEnum = z.enum([
  "male",
  "female", 
  "mixed",
  "open",
]);

// Base Division Schema (for API responses/table data)
export const divisionSchema = z.object({
  id: z.string(),
  seasonId: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  threshold: z.number().nullable().optional(),
  divisionLevel: divisionLevelEnum,
  gameType: gameTypeEnum,
  genderCategory: genderCategoryEnum.nullable().optional(),
  maxSingles: z.number().nullable().optional(),
  maxDoublesTeams: z.number().nullable().optional(),
  autoAssignmentEnabled: z.boolean().optional(),
  isActive: z.boolean(),
  prizePoolTotal: z.number().nullable().optional(),
  sponsoredDivisionName: z.string().nullable().optional(),
  currentSinglesCount: z.number().nullable().optional().default(0),
  currentDoublesCount: z.number().nullable().optional().default(0),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  season: z.object({
    id: z.string(),
    name: z.string(),
    startDate: z.string().or(z.date()).nullable().optional(),
    endDate: z.string().or(z.date()).nullable().optional(),
  }).passthrough().nullable().optional(),
}).passthrough();

export type Division = z.infer<typeof divisionSchema>;

// Form schema for create/edit modal
export const divisionFormSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    seasonId: z.string().min(1, "Select a season"),
    divisionLevel: divisionLevelEnum,
    gameType: gameTypeEnum,
    genderCategory: genderCategoryEnum,
    maxSinglesPlayers: z.number().int().positive().optional().nullable(),
    maxDoublesTeams: z.number().int().positive().optional().nullable(),
    isActive: z.boolean().default(true),
    prizePoolTotal: z.number().int().nonnegative().optional().nullable(),
    description: z.string().optional().nullable(),
    threshold: z.number().int().nonnegative().optional().nullable(),
  })
  .superRefine((val, ctx) => {
    if (val.gameType === "singles" && !val.maxSinglesPlayers) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxSinglesPlayers"],
        message: "Max singles players is required for singles game type",
      });
    }
    if (val.gameType === "doubles" && !val.maxDoublesTeams) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxDoublesTeams"],
        message: "Max doubles teams is required for doubles game type",
      });
    }
  });

export type DivisionFormValues = z.infer<typeof divisionFormSchema>;

// Base type for division props (subset for editing)
export type DivisionBase = Pick<
  Division,
  | "id"
  | "seasonId"
  | "name"
  | "description"
  | "threshold"
  | "divisionLevel"
  | "gameType"
  | "genderCategory"
  | "maxSingles"
  | "maxDoublesTeams"
  | "autoAssignmentEnabled"
  | "isActive"
  | "prizePoolTotal"
  | "sponsoredDivisionName"
>;

// Default form values
export const defaultFormValues: DivisionFormValues = {
  name: "",
  seasonId: "",
  divisionLevel: "beginner",
  gameType: "singles",
  genderCategory: "male",
  maxSinglesPlayers: undefined,
  maxDoublesTeams: undefined,
  isActive: true,
  prizePoolTotal: undefined,
  description: "",
  threshold: undefined,
};

// Display label helpers
export const getDisplayLabels = () => ({
  divisionLevel: {
    beginner: "Beginner",
    improver: "Improver",
    intermediate: "Intermediate",
    upper_intermediate: "Upper Intermediate",
    expert: "Expert",
    advanced: "Advanced"
  },
  gameType: {
    singles: "Singles",
    doubles: "Doubles"
  },
  genderCategory: {
    male: "Male",
    female: "Female",
    mixed: "Mixed"
  }
});

// Transform helpers
export const transformToPayload = (data: DivisionFormValues, adminId?: string) => {
  const toNumberOrNull = (value: unknown) => {
    if (value === undefined || value === null || value === "") return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  return {
    name: data.name,
    seasonId: data.seasonId,
    adminId,
    divisionLevel: data.divisionLevel,
    gameType: data.gameType,
    genderCategory: data.genderCategory,
    isActive: Boolean(data.isActive),
    maxSinglesPlayers: toNumberOrNull(data.maxSinglesPlayers),
    maxDoublesTeams: toNumberOrNull(data.maxDoublesTeams),
    prizePoolTotal: toNumberOrNull(data.prizePoolTotal),
    threshold: toNumberOrNull(data.threshold),
    description: data.description?.trim() || null,
  };
};

export const transformFromDivision = (division: DivisionBase): DivisionFormValues => ({
  name: division.name,
  seasonId: division.seasonId,
  divisionLevel: division.divisionLevel,
  gameType: division.gameType,
  genderCategory: division.genderCategory || "male",
  maxSinglesPlayers: division.maxSingles,
  maxDoublesTeams: division.maxDoublesTeams,
  isActive: division.isActive ?? true,
  prizePoolTotal: division.prizePoolTotal,
  description: division.description || "",
  threshold: division.threshold,
});