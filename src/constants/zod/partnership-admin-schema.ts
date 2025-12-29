import { z } from "zod";

// Status enums
export const withdrawalRequestStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export type WithdrawalRequestStatus = z.infer<typeof withdrawalRequestStatusSchema>;

export const partnershipStatusSchema = z.enum([
  "ACTIVE",
  "INCOMPLETE",
  "DISSOLVED",
  "EXPIRED",
]);

export type PartnershipStatus = z.infer<typeof partnershipStatusSchema>;

// User info schema (reusable)
const userInfoSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().optional(),
  image: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
});

// Minimal user schema for nested relations
const minimalUserSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  image: z.string().nullable().optional(),
});

// Season info schema
const seasonInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
});

// Division info schema
const divisionInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
});

// Successor partnership schema
const successorPartnershipSchema = z.object({
  id: z.string(),
  captainId: z.string(),
  partnerId: z.string().nullable(),
  status: z.string(),
  createdAt: z.string(),
  captain: minimalUserSchema,
  partner: minimalUserSchema.nullable(),
});

// Partnership in withdrawal request
const partnershipInRequestSchema = z.object({
  id: z.string(),
  captainId: z.string(),
  partnerId: z.string().nullable(),
  status: z.string(),
  dissolvedAt: z.string().nullable(),
  pairRating: z.number().nullable(),
  captain: userInfoSchema,
  partner: userInfoSchema.nullable(),
  division: divisionInfoSchema.nullable(),
  successors: z.array(successorPartnershipSchema),
});

// Admin who processed the request
const adminInfoSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  role: z.string(),
});

// Withdrawal request with full details
export const withdrawalRequestAdminSchema = z.object({
  id: z.string(),
  userId: z.string(),
  reason: z.string(),
  requestDate: z.string(),
  status: withdrawalRequestStatusSchema,
  processedByAdminId: z.string().nullable(),
  partnershipId: z.string().nullable(),
  seasonId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  user: userInfoSchema.nullable(),
  processedByAdmin: adminInfoSchema.nullable(),
  season: seasonInfoSchema.nullable(),
  partnership: partnershipInRequestSchema.nullable(),
});

export type WithdrawalRequestAdmin = z.infer<typeof withdrawalRequestAdminSchema>;

// Withdrawal request in dissolved partnership
const withdrawalRequestInPartnershipSchema = z.object({
  id: z.string(),
  userId: z.string(),
  reason: z.string(),
  status: z.string(),
  requestDate: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
  }),
});

// Dissolved partnership with lifecycle info
export const dissolvedPartnershipSchema = z.object({
  id: z.string(),
  captainId: z.string(),
  partnerId: z.string().nullable(),
  seasonId: z.string(),
  divisionId: z.string().nullable(),
  status: z.string(),
  dissolvedAt: z.string().nullable(),
  createdAt: z.string(),
  captain: userInfoSchema,
  partner: userInfoSchema.nullable(),
  season: seasonInfoSchema,
  division: divisionInfoSchema.nullable(),
  withdrawalRequest: withdrawalRequestInPartnershipSchema.nullable(),
  successors: z.array(successorPartnershipSchema),
});

export type DissolvedPartnership = z.infer<typeof dissolvedPartnershipSchema>;

// Stats schema
export const withdrawalRequestStatsSchema = z.object({
  pending: z.number(),
  approved: z.number(),
  rejected: z.number(),
  total: z.number(),
  totalDissolved: z.number(),
});

export type WithdrawalRequestStats = z.infer<typeof withdrawalRequestStatsSchema>;

// Response schemas
export const withdrawalRequestsResponseSchema = z.array(withdrawalRequestAdminSchema);
export const dissolvedPartnershipsResponseSchema = z.array(dissolvedPartnershipSchema);

// Helper functions
export const getWithdrawalStatusLabel = (status: WithdrawalRequestStatus): string => {
  const labels: Record<WithdrawalRequestStatus, string> = {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
  };
  return labels[status] || status;
};

export const getWithdrawalStatusColor = (status: WithdrawalRequestStatus): string => {
  const colors: Record<WithdrawalRequestStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    APPROVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };
  return colors[status] || "";
};

export const getPartnershipStatusLabel = (status: PartnershipStatus): string => {
  const labels: Record<PartnershipStatus, string> = {
    ACTIVE: "Active",
    INCOMPLETE: "Finding Partner",
    DISSOLVED: "Dissolved",
    EXPIRED: "Expired",
  };
  return labels[status] || status;
};

export const getPartnershipStatusColor = (status: PartnershipStatus): string => {
  const colors: Record<PartnershipStatus, string> = {
    ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    INCOMPLETE: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    DISSOLVED: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
    EXPIRED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  };
  return colors[status] || "";
};
