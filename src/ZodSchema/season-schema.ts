import { z } from 'zod';

export const membershipSchema = z.object({
  id: z.string(),
  userId: z.string(),
  seasonId: z.string(),
  divisionId: z.string().optional(),
  status: z.enum(['ACTIVE', 'WAITLISTED', 'PENDING', 'WITHDRAWN']),
  joinedAt: z.coerce.date(),
  user: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
});

export const withdrawalRequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  seasonId: z.string(),
  reason: z.string(),
  requestDate: z.coerce.date().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  processedByAdminId: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  user: z.object({
    name: z.string(),
    email: z.string().email().optional(),
  }),
  processedByAdmin: z.object({
    name: z.string(),
  }).nullable().optional(),
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
  entryFee: z.string().nullable().optional(),
  registeredUserCount: z.number().default(0),
  isActive: z.boolean().default(false),
  paymentRequired: z.boolean().default(false),
  promoCodeSupported: z.boolean().default(false),
  withdrawalEnabled: z.boolean().default(false),
  status: z
    .enum(["UPCOMING", "ACTIVE", "FINISHED", "CANCELLED"])
    .default("UPCOMING"),
  current: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  memberships: z.array(membershipSchema).default([]),
  withdrawalRequests: z.array(withdrawalRequestSchema).default([]),
  divisions: z.array(z.any()).default([]),
  leagues: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })).default([]),
});

export type Season = z.infer<typeof seasonSchema>;
export type Membership = z.infer<typeof membershipSchema>;
export type WithdrawalRequest = z.infer<typeof withdrawalRequestSchema>;
