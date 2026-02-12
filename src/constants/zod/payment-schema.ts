import { z } from "zod";

// Payment status enum
export const paymentStatusEnum = z.enum(["PENDING", "COMPLETED", "FAILED", "CANCELLED", "REFUNDED"]);
export type PaymentStatus = z.infer<typeof paymentStatusEnum>;

// Membership status enum
export const membershipStatusEnum = z.enum([
  "PENDING",
  "ACTIVE",
  "INACTIVE",
  "FLAGGED",
  "REMOVED",
  "WAITLISTED",
]);
export type MembershipStatus = z.infer<typeof membershipStatusEnum>;

// User info within payment record
export const paymentUserSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email(),
  username: z.string(),
  displayUsername: z.string().nullable().optional(),
  image: z.string().nullable(),
});
export type PaymentUser = z.infer<typeof paymentUserSchema>;

// Season info within payment record
export const paymentSeasonSchema = z.object({
  id: z.string(),
  name: z.string(),
  entryFee: z.coerce.number().nullable(),
  paymentRequired: z.boolean(),
  status: z.string(),
  sportType: z.string().nullable().optional(),
});
export type PaymentSeason = z.infer<typeof paymentSeasonSchema>;

// Full payment record (from SeasonMembership with joins)
export const paymentRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  seasonId: z.string(),
  divisionId: z.string().nullable(),
  status: membershipStatusEnum,
  joinedAt: z.coerce.date(),
  paymentStatus: paymentStatusEnum,
  withdrawalReason: z.string().nullable().optional(),
  user: paymentUserSchema,
  season: paymentSeasonSchema,
});
export type PaymentRecord = z.infer<typeof paymentRecordSchema>;

// Payment statistics
export const paymentStatsSchema = z.object({
  total: z.number(),
  completed: z.number(),
  pending: z.number(),
  failed: z.number(),
  totalRevenue: z.number(),
  outstandingAmount: z.number(),
});
export type PaymentStats = z.infer<typeof paymentStatsSchema>;

// Paginated response
export const paginatedPaymentsSchema = z.object({
  data: z.array(paymentRecordSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export type PaginatedPayments = z.infer<typeof paginatedPaymentsSchema>;

// Filter params
export const paymentFiltersSchema = z.object({
  search: z.string().optional(),
  seasonId: z.string().optional(),
  status: paymentStatusEnum.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
  sortBy: z.enum(["joinedAt", "user.name", "season.name", "season.entryFee"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
export type PaymentFilters = z.infer<typeof paymentFiltersSchema>;

// Update payment status request
export const updatePaymentStatusSchema = z.object({
  paymentStatus: paymentStatusEnum,
  notes: z.string().optional(),
});
export type UpdatePaymentStatusRequest = z.infer<typeof updatePaymentStatusSchema>;

// Bulk update request
export const bulkUpdatePaymentStatusSchema = z.object({
  membershipIds: z.array(z.string()).min(1),
  paymentStatus: paymentStatusEnum,
  notes: z.string().optional(),
});
export type BulkUpdatePaymentStatusRequest = z.infer<typeof bulkUpdatePaymentStatusSchema>;
