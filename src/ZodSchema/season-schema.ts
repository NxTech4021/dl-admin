import { z } from "zod";

export const membershipSchema = z.object({
  id: z.string().optional(),
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
      name: z.string().optional(),
      email: z.string().email().optional(),
      initialRatingResult: z.any(),
      questionnaireResponses: z
        .array(
          z.object({
            id: z.number(),
            sport: z.string(),
            completedAt: z.coerce.date().nullable(),
            result: z
              .object({
                id: z.number(),
                singles: z.number().nullable(),
                doubles: z.number().nullable(),
                rd: z.number().nullable(),
                confidence: z.string().nullable(),
                source: z.string(),
              })
              .nullable(),
          })
        )
        .optional(),
    })
    .optional(),
});

export const withdrawalRequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  seasonId: z.string(),
  reason: z.string(),
  requestDate: z.coerce.date().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  processedByAdminId: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  user: z.object({
    name: z.string(),
    email: z.string().email().optional(),
  }),
  processedByAdmin: z
    .object({
      name: z.string(),
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
  divisions: z.array(z.any()).default([]),
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
  categories: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().nullable(),
        genderRestriction: z.string().optional(),
        matchFormat: z.string().nullable().optional(),
      })
    )
    .default([]),
  category: z
    .object({
      id: z.string(),
      name: z.string().nullable(),
      genderRestriction: z.string().optional(),
      matchFormat: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export type Season = z.infer<typeof seasonSchema>;
export type Membership = z.infer<typeof membershipSchema>;
export type WithdrawalRequest = z.infer<typeof withdrawalRequestSchema>;
