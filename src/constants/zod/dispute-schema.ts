import { z } from "zod";

// ===== ENUMS =====
export const disputeCategoryEnum = z.enum([
  "WRONG_SCORE",
  "NO_SHOW",
  "BEHAVIOR",
  "OTHER",
]);

export const disputeStatusEnum = z.enum([
  "OPEN",
  "UNDER_REVIEW",
  "RESOLVED",
  "REJECTED",
]);

export const disputePriorityEnum = z.enum([
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT",
]);

export const disputeResolutionActionEnum = z.enum([
  "UPHOLD_ORIGINAL",    // Keep the original submitted score
  "UPHOLD_DISPUTER",    // Accept the disputer's claimed score
  "CUSTOM_SCORE",       // Admin sets a custom score
  "VOID_MATCH",         // Void the entire match
  "AWARD_WALKOVER",     // Award walkover to one party
  "REQUEST_MORE_INFO",  // Request additional evidence/information
  "REJECT",             // Dismiss dispute as invalid/spam/insufficient evidence
]);

// ===== USER SCHEMA (minimal for references) =====
const userMinimalSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
});

// ===== ADMIN SCHEMA (minimal for references) =====
const adminMinimalSchema = z.object({
  id: z.string(),
  user: z.object({
    name: z.string(),
    image: z.string().nullable().optional(),
  }),
});

// ===== MATCH PARTICIPANT SCHEMA (for dispute context) =====
const matchParticipantSchema = z.object({
  id: z.string(),
  userId: z.string(),
  team: z.string().nullable().optional(),
  role: z.enum(["CREATOR", "OPPONENT", "PARTNER", "INVITED"]),
  invitationStatus: z.enum(["PENDING", "ACCEPTED", "DECLINED", "EXPIRED", "CANCELLED"]),
  user: userMinimalSchema,
});

// ===== MATCH SCORE SCHEMA =====
const matchScoreSchema = z.object({
  id: z.string(),
  matchId: z.string(),
  setNumber: z.number(),
  player1Games: z.number(),
  player2Games: z.number(),
  hasTiebreak: z.boolean().default(false),
  player1Tiebreak: z.number().nullable().optional(),
  player2Tiebreak: z.number().nullable().optional(),
});

// ===== DIVISION SCHEMA (minimal) =====
const divisionMinimalSchema = z.object({
  id: z.string(),
  name: z.string(),
  season: z.object({
    id: z.string(),
    name: z.string(),
  }).nullable().optional(),
});

// ===== MATCH SCHEMA (for dispute context) =====
const matchContextSchema = z.object({
  id: z.string(),
  sport: z.string(),
  matchType: z.enum(["SINGLES", "DOUBLES"]),
  status: z.enum(["DRAFT", "SCHEDULED", "ONGOING", "COMPLETED", "UNFINISHED", "CANCELLED", "VOID"]),
  matchDate: z.coerce.date(),
  team1Score: z.number().nullable().optional(),
  team2Score: z.number().nullable().optional(),
  outcome: z.string().nullable().optional(),
  isWalkover: z.boolean().default(false),
  division: divisionMinimalSchema.nullable().optional(),
  participants: z.array(matchParticipantSchema).default([]),
  scores: z.array(matchScoreSchema).default([]),
  resultSubmittedBy: userMinimalSchema.nullable().optional(),
});

// ===== DISPUTE ADMIN NOTE SCHEMA =====
export const disputeAdminNoteSchema = z.object({
  id: z.string(),
  disputeId: z.string(),
  adminId: z.string(),
  note: z.string(),
  isInternalOnly: z.boolean().default(true),
  createdAt: z.coerce.date(),
  admin: adminMinimalSchema.optional(),
});

// ===== DISPUTE COMMENT SCHEMA (player/admin communication) =====
export const disputeCommentSchema = z.object({
  id: z.string(),
  disputeId: z.string(),
  senderId: z.string(),
  message: z.string(),
  createdAt: z.coerce.date(),
  sender: userMinimalSchema,
});

// ===== PENALTY SCHEMA (related to dispute) =====
export const disputePenaltySchema = z.object({
  id: z.string(),
  userId: z.string(),
  penaltyType: z.enum(["WARNING", "POINTS_DEDUCTION", "MATCH_BAN", "SEASON_BAN", "PERMANENT_BAN"]),
  severity: z.enum(["MINOR", "MODERATE", "SEVERE", "POINTS_DEDUCTION", "SUSPENSION", "BAN"]),
  status: z.enum(["PENDING", "ACTIVE", "SERVED", "REVOKED", "EXPIRED", "APPEALED"]),
  reason: z.string(),
  pointsDeducted: z.number().nullable().optional(),
  suspensionDays: z.number().nullable().optional(),
  createdAt: z.coerce.date(),
});

// ===== FINAL SCORE SCHEMA (for resolution) =====
export const finalScoreSchema = z.object({
  team1Score: z.number(),
  team2Score: z.number(),
  setScores: z.array(z.object({
    setNumber: z.number(),
    team1Games: z.number(),
    team2Games: z.number(),
  })).optional(),
});

// ===== MAIN DISPUTE SCHEMA =====
export const disputeSchema = z.object({
  // Core fields
  id: z.string(),
  matchId: z.string(),
  disputeCategory: disputeCategoryEnum,
  status: disputeStatusEnum,
  priority: disputePriorityEnum,

  // Disputer info
  raisedById: z.string(),
  raisedByUser: userMinimalSchema,

  // Claimed score (what the disputer says should be the score)
  claimedScore: z.any().nullable().optional(), // JSON field

  // Description and evidence
  description: z.string().nullable().optional(),
  evidenceUrls: z.array(z.string()).default([]),

  // Admin review
  reviewedByAdminId: z.string().nullable().optional(),
  reviewedByAdmin: adminMinimalSchema.nullable().optional(),
  reviewedAt: z.coerce.date().nullable().optional(),

  // Resolution
  resolvedByAdminId: z.string().nullable().optional(),
  resolvedByAdmin: adminMinimalSchema.nullable().optional(),
  resolvedAt: z.coerce.date().nullable().optional(),
  resolutionAction: disputeResolutionActionEnum.nullable().optional(),
  adminResolution: z.string().nullable().optional(),
  finalScore: z.any().nullable().optional(), // JSON field

  // Timestamps
  submittedAt: z.coerce.date(),
  createdAt: z.coerce.date().optional(), // Alias for submittedAt (backwards compat)
  updatedAt: z.coerce.date().optional(),

  // Relations
  match: matchContextSchema,
  adminNotes: z.array(disputeAdminNoteSchema).default([]),
  comments: z.array(disputeCommentSchema).default([]),
  penalties: z.array(disputePenaltySchema).default([]),
});

// ===== TYPES =====
export type Dispute = z.infer<typeof disputeSchema>;
export type DisputeCategory = z.infer<typeof disputeCategoryEnum>;
export type DisputeStatus = z.infer<typeof disputeStatusEnum>;
export type DisputePriority = z.infer<typeof disputePriorityEnum>;
export type DisputeResolutionAction = z.infer<typeof disputeResolutionActionEnum>;
export type DisputeAdminNote = z.infer<typeof disputeAdminNoteSchema>;
export type DisputeComment = z.infer<typeof disputeCommentSchema>;
export type DisputePenalty = z.infer<typeof disputePenaltySchema>;
export type FinalScore = z.infer<typeof finalScoreSchema>;

// ===== LIST RESPONSE SCHEMA =====
export const disputeListResponseSchema = z.object({
  disputes: z.array(disputeSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type DisputeListResponse = z.infer<typeof disputeListResponseSchema>;

// ===== FILTER TYPES =====
export interface DisputeFilters {
  status?: DisputeStatus | DisputeStatus[];
  priority?: DisputePriority;
  category?: DisputeCategory;
  search?: string;
  page?: number;
  limit?: number;
}

// ===== RESOLVE DISPUTE INPUT =====
export interface ResolveDisputeInput {
  disputeId: string;
  action: DisputeResolutionAction;
  finalScore?: FinalScore;
  reason: string;
  notifyPlayers?: boolean;
}

// ===== ADD NOTE INPUT =====
export interface AddDisputeNoteInput {
  disputeId: string;
  note: string;
  isInternalOnly?: boolean;
}

// ===== STATISTICS SCHEMA =====
export const disputeStatsSchema = z.object({
  total: z.number(),
  byStatus: z.object({
    OPEN: z.number(),
    UNDER_REVIEW: z.number(),
    RESOLVED: z.number(),
    REJECTED: z.number(),
  }),
  byPriority: z.object({
    LOW: z.number(),
    NORMAL: z.number(),
    HIGH: z.number(),
    URGENT: z.number(),
  }),
  byCategory: z.object({
    WRONG_SCORE: z.number(),
    NO_SHOW: z.number(),
    BEHAVIOR: z.number(),
    OTHER: z.number(),
  }),
});

export type DisputeStats = z.infer<typeof disputeStatsSchema>;

// ===== HELPER FUNCTIONS =====

export function getStatusColor(status: DisputeStatus): string {
  const colors: Record<DisputeStatus, string> = {
    OPEN: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    UNDER_REVIEW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    RESOLVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    REJECTED: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };
  return colors[status];
}

export function getPriorityColor(priority: DisputePriority): string {
  const colors: Record<DisputePriority, string> = {
    LOW: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    NORMAL: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    URGENT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };
  return colors[priority];
}

export function getCategoryLabel(category: DisputeCategory): string {
  const labels: Record<DisputeCategory, string> = {
    WRONG_SCORE: "Wrong Score",
    NO_SHOW: "No Show",
    BEHAVIOR: "Behavior Issue",
    OTHER: "Other",
  };
  return labels[category];
}

export function getResolutionActionLabel(action: DisputeResolutionAction): string {
  const labels: Record<DisputeResolutionAction, string> = {
    UPHOLD_ORIGINAL: "Uphold Original Score",
    UPHOLD_DISPUTER: "Accept Disputer's Claim",
    CUSTOM_SCORE: "Set Custom Score",
    VOID_MATCH: "Void Match",
    AWARD_WALKOVER: "Award Walkover",
    REQUEST_MORE_INFO: "Request More Information",
    REJECT: "Reject Dispute",
  };
  return labels[action];
}
