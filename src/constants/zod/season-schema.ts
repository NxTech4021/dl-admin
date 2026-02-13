import { z } from "zod";

export const membershipSchema = z.object({
  id: z.string().optional(),
  odUserId: z.string().nullable().optional(),
  odDivisionAssignmentId: z.string().nullable().optional(),
  userId: z.string().optional(),
  seasonId: z.string().optional(),
  divisionId: z.string().nullable().optional(),
  status: z
    .enum(["PENDING", "ACTIVE", "INACTIVE", "FLAGGED", "REMOVED", "WAITLISTED"])
    .optional(),
  joinedAt: z.coerce.date().optional(),
  withdrawalReason: z.string().nullable().optional(),
  paymentStatus: z.enum(["PENDING", "COMPLETED", "FAILED"]).optional(),
  user: z
    .object({
      id: z.string().optional(),
      name: z.string().nullable().optional(),
      email: z.string().email().optional(),
      image: z.string().nullable().optional(),
      username: z.string().optional(),
      initialRatingResult: z.unknown().nullable().optional(),
      questionnaireResponses: z
        .array(
          z.object({
            id: z.union([z.number(), z.string()]),
            sport: z.string(),
            completedAt: z.coerce.date().nullable(),
            result: z
              .object({
                id: z.union([z.number(), z.string()]),
                singles: z.number().nullable(),
                doubles: z.number().nullable(),
                rd: z.number().nullable(),
                confidence: z.union([z.string(), z.number()]).nullable(),
                source: z.string().nullable().optional(),
                rating: z.number().nullable().optional(),
              })
              .nullable(),
          })
        )
        .optional(),
    })
    .nullable()
    .optional(),
});

export const withdrawalRequestSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  seasonId: z.string().optional(),
  reason: z.string(),
  partnershipId: z.string().nullable().optional(),
  requestDate: z.coerce.date().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  processedByAdminId: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  user: z
    .object({
      id: z.string().optional(),
      name: z.string().nullable().optional(),
      email: z.string().email().optional(),
      image: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  processedByAdmin: z
    .object({
      name: z.string().nullable().optional(),
      role: z.string().optional(),
    })
    .nullable()
    .optional(),
});

// Season schema
export const seasonSchema = z.object({
  id: z.string(),
  name: z.string(),
  sportType: z.string().nullable().optional(),
  seasonType: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  regiDeadline: z.coerce.date().nullable().optional(),
  entryFee: z.coerce.number().nullable().optional(),
  registeredUserCount: z.number().default(0),
  isActive: z.boolean().default(false),
  paymentRequired: z.boolean().default(false),
  promoCodeSupported: z.boolean().default(false),
  withdrawalEnabled: z.boolean().default(false),
  status: z
    .enum(["UPCOMING", "ACTIVE", "FINISHED", "CANCELLED", "WAITLISTED"])
    .default("UPCOMING"),
  current: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  memberships: z.array(membershipSchema).default([]),
  withdrawalRequests: z.array(withdrawalRequestSchema).default([]),
  divisions: z.array(z.record(z.string(), z.unknown())).default([]),
  leagues: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        sportType: z.string().optional(),
        gameType: z.string().optional(),
      })
    )
    .default([]),
  category: z
    .object({
      id: z.string(),
      name: z.string().nullable(),
      genderRestriction: z.string().optional(),
      gender_category: z.string().nullable().optional(),
      genderCategory: z.string().nullable().optional(),
      game_type: z.string().nullable().optional(),
      gameType: z.string().nullable().optional(),
      matchFormat: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  partnerships: z
    .array(
      z.object({
        id: z.string(),
        captainId: z.string().optional(),
        partnerId: z.string().optional(),
        seasonId: z.string().optional(),
        divisionId: z.string().nullable().optional(),
        status: z.string(),
        captain: z.object({
          id: z.string(),
          name: z.string().nullable().optional(),
          email: z.string().optional(),
          username: z.string().optional(),
          displayUsername: z.string().nullable().optional(),
          image: z.string().nullable().optional(),
        }),
        partner: z.object({
          id: z.string(),
          name: z.string().nullable().optional(),
          email: z.string().optional(),
          username: z.string().optional(),
          displayUsername: z.string().nullable().optional(),
          image: z.string().nullable().optional(),
        }),
      })
    )
    .optional()
    .default([]),
});

export type Season = z.infer<typeof seasonSchema>;
export type Membership = z.infer<typeof membershipSchema>;
export type WithdrawalRequest = z.infer<typeof withdrawalRequestSchema>;

// Grouped season type for displaying seasons with the same name but different categories
export interface GroupedSeason {
  groupKey: string; // Season name used for grouping
  name: string; // Display name
  seasons: Season[]; // All seasons in this group
  aggregated: {
    totalPlayers: number; // Sum of registeredUserCount
    entryFeeDisplay: string; // "RM 20.00" | "RM 20 - 40" | "Free"
    statuses: string[]; // Unique statuses
    categories: { id: string; name: string | null; seasonId: string }[];
    leagues: { id: string; name: string; sportType?: string }[];
    earliestDeadline: Date | null;
    dateRange: { start: Date | null; end: Date | null };
    sportType: string | null; // Primary sport type from first season
  };
}
