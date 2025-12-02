import { z } from "zod";

// ===== ENUMS =====
export const matchStatusEnum = z.enum([
  "DRAFT",        // Match created but invitations expired/declined
  "SCHEDULED",    // Match confirmed and scheduled
  "ONGOING",      // Match currently in progress
  "COMPLETED",    // Match finished with result
  "UNFINISHED",   // Match started but not completed
  "CANCELLED",    // Match cancelled by user
  "VOID",         // Match voided by admin
]);

export const matchTypeEnum = z.enum(["SINGLES", "DOUBLES"]);

export const matchFormatEnum = z.enum(["STANDARD", "ONE_SET"]);

export const invitationStatusEnum = z.enum([
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "EXPIRED",
  "CANCELLED",
]);

export const cancellationReasonEnum = z.enum([
  "PERSONAL_EMERGENCY",
  "INJURY",
  "WEATHER",
  "SCHEDULING_CONFLICT",
  "ILLNESS",
  "WORK_COMMITMENT",
  "FAMILY_EMERGENCY",
  "OTHER",
]);

export const walkoverReasonEnum = z.enum([
  "NO_SHOW",
  "LATE_CANCELLATION",
  "INJURY",
  "PERSONAL_EMERGENCY",
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

// ===== JSON FIELD SCHEMAS =====

/** Set score entry for matches (stored as JSON) */
export const setScoreEntrySchema = z.object({
  setNumber: z.number(),
  team1Games: z.number(),
  team2Games: z.number(),
});

/** Proposed times array (stored as JSON - array of date strings or dates) */
export const proposedTimesSchema = z.array(
  z.union([z.string(), z.coerce.date()])
);

/** Tennis/Padel walkover score set */
export const walkoverSetScoreSchema = z.object({
  setNumber: z.number(),
  winner: z.number(),
  loser: z.number(),
});

/** Pickleball walkover score game */
export const walkoverGameScoreSchema = z.object({
  gameNumber: z.number(),
  winner: z.number(),
  loser: z.number(),
});

/** Walkover score (stored as JSON - sport-specific format) */
export const walkoverScoreSchema = z.union([
  // Tennis/Padel format
  z.object({
    sets: z.array(walkoverSetScoreSchema),
  }),
  // Pickleball format
  z.object({
    games: z.array(walkoverGameScoreSchema),
  }),
]);

// ===== NESTED SCHEMAS =====

// Participant schema
export const matchParticipantSchema = z.object({
  id: z.string(),
  userId: z.string(),
  matchId: z.string(),
  team: z.string().nullable().optional(),
  role: z.enum(["CREATOR", "OPPONENT", "PARTNER", "INVITED"]),
  invitationStatus: invitationStatusEnum,
  acceptedAt: z.coerce.date().nullable().optional(),
  didAttend: z.boolean().nullable().optional(),
  arrivedAt: z.coerce.date().nullable().optional(),
  wasLate: z.boolean().default(false),
  user: z.object({
    id: z.string(),
    name: z.string(),
    username: z.string().nullable().optional(),
    displayUsername: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
  }),
});

// Score schema
export const matchScoreSchema = z.object({
  id: z.string(),
  matchId: z.string(),
  setNumber: z.number(),
  player1Games: z.number(),
  player2Games: z.number(),
  hasTiebreak: z.boolean().default(false),
  player1Tiebreak: z.number().nullable().optional(),
  player2Tiebreak: z.number().nullable().optional(),
  tiebreakType: z.enum(["STANDARD_7PT", "MATCH_10PT"]).nullable().optional(),
});

// Dispute schema
export const matchDisputeSchema = z.object({
  id: z.string(),
  matchId: z.string(),
  disputeCategory: z.enum(["WRONG_SCORE", "NO_SHOW", "BEHAVIOR", "OTHER"]),
  status: disputeStatusEnum,
  priority: disputePriorityEnum,
  disputedById: z.string(),
  notes: z.string().nullable().optional(),
  evidenceUrl: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  resolvedAt: z.coerce.date().nullable().optional(),
  disputedBy: z.object({
    id: z.string(),
    name: z.string(),
    username: z.string().nullable().optional(),
  }),
});

// Walkover schema
export const matchWalkoverSchema = z.object({
  id: z.string(),
  matchId: z.string(),
  reason: walkoverReasonEnum,
  defaultingPlayerId: z.string(),
  winningPlayerId: z.string(),
  recordedAt: z.coerce.date(),
  recordedById: z.string().nullable().optional(),
});

// Division schema (minimal)
export const matchDivisionSchema = z.object({
  id: z.string(),
  name: z.string(),
  divisionLevel: z.enum(["beginner", "intermediate", "advanced"]),
  gameType: z.enum(["singles", "doubles"]),
  genderCategory: z.enum(["male", "female", "mixed"]).nullable().optional(),
  season: z.object({
    id: z.string(),
    name: z.string(),
    status: z.enum(["UPCOMING", "ACTIVE", "FINISHED", "CANCELLED"]).optional(),
  }).nullable().optional(),
  league: z.object({
    id: z.string(),
    name: z.string(),
    sportType: z.string().optional(),
  }).nullable().optional(),
});

// ===== MAIN MATCH SCHEMA =====
export const matchSchema = z.object({
  // Core fields
  id: z.string(),
  sport: z.string(),
  matchType: matchTypeEnum,
  format: matchFormatEnum,
  isOneSet: z.boolean().default(false),
  status: matchStatusEnum,

  // Identifiers
  divisionId: z.string().nullable().optional(),
  leagueId: z.string().nullable().optional(),
  seasonId: z.string().nullable().optional(),
  createdById: z.string().nullable().optional(),

  // Scheduling
  matchDate: z.coerce.date(),
  scheduledTime: z.coerce.date().nullable().optional(),
  scheduledStartTime: z.coerce.date().nullable().optional(),
  actualStartTime: z.coerce.date().nullable().optional(),
  proposedTimes: proposedTimesSchema.nullable().optional(),

  // Location
  location: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),

  // Scoring
  playerScore: z.number().nullable().optional(),
  opponentScore: z.number().nullable().optional(),
  team1Score: z.number().nullable().optional(),
  team2Score: z.number().nullable().optional(),
  outcome: z.string().nullable().optional(),
  setScores: z.array(setScoreEntrySchema).nullable().optional(),
  duration: z.number().nullable().optional(),

  // Result submission
  resultSubmittedById: z.string().nullable().optional(),
  resultSubmittedAt: z.coerce.date().nullable().optional(),
  resultConfirmedById: z.string().nullable().optional(),
  resultConfirmedAt: z.coerce.date().nullable().optional(),
  resultComment: z.string().nullable().optional(),
  resultEvidence: z.string().nullable().optional(),
  isAutoApproved: z.boolean().default(false),

  // Flags
  isWalkover: z.boolean().default(false),
  isDisputed: z.boolean().default(false),
  requiresAdminReview: z.boolean().default(false),

  // Cancellation
  cancellationRequestedAt: z.coerce.date().nullable().optional(),
  isLateCancellation: z.boolean().default(false),
  cancellationReason: cancellationReasonEnum.nullable().optional(),
  cancelledById: z.string().nullable().optional(),
  cancelledAt: z.coerce.date().nullable().optional(),
  cancellationComment: z.string().nullable().optional(),

  // Walkover
  walkoverReason: walkoverReasonEnum.nullable().optional(),
  walkoverRecordedById: z.string().nullable().optional(),
  walkoverScore: walkoverScoreSchema.nullable().optional(),

  // Admin
  adminNotes: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),

  // Reschedule
  rescheduledFromId: z.string().nullable().optional(),
  rescheduleCount: z.number().default(0),

  // Timestamps
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  // Relations
  division: matchDivisionSchema.nullable().optional(),
  participants: z.array(matchParticipantSchema).default([]),
  scores: z.array(matchScoreSchema).default([]),
  disputes: z.array(matchDisputeSchema).default([]),
  walkover: matchWalkoverSchema.nullable().optional(),
  createdBy: z.object({
    id: z.string(),
    name: z.string(),
    username: z.string().nullable().optional(),
  }).nullable().optional(),
  resultSubmittedBy: z.object({
    id: z.string(),
    name: z.string(),
    username: z.string().nullable().optional(),
  }).nullable().optional(),
});

// ===== TYPES =====
export type Match = z.infer<typeof matchSchema>;
export type MatchStatus = z.infer<typeof matchStatusEnum>;
export type MatchType = z.infer<typeof matchTypeEnum>;
export type MatchFormat = z.infer<typeof matchFormatEnum>;
export type MatchParticipant = z.infer<typeof matchParticipantSchema>;
export type MatchScore = z.infer<typeof matchScoreSchema>;
export type MatchDispute = z.infer<typeof matchDisputeSchema>;
export type MatchWalkover = z.infer<typeof matchWalkoverSchema>;
export type InvitationStatus = z.infer<typeof invitationStatusEnum>;
export type CancellationReason = z.infer<typeof cancellationReasonEnum>;
export type WalkoverReason = z.infer<typeof walkoverReasonEnum>;
export type DisputeStatus = z.infer<typeof disputeStatusEnum>;
export type DisputePriority = z.infer<typeof disputePriorityEnum>;

// JSON field types
export type SetScoreEntry = z.infer<typeof setScoreEntrySchema>;
export type ProposedTimes = z.infer<typeof proposedTimesSchema>;
export type WalkoverScoreData = z.infer<typeof walkoverScoreSchema>;

// ===== STATISTICS SCHEMA =====
export const matchStatsSchema = z.object({
  totalMatches: z.number(),
  byStatus: z.object({
    DRAFT: z.number(),
    SCHEDULED: z.number(),
    ONGOING: z.number(),
    COMPLETED: z.number(),
    UNFINISHED: z.number(),
    CANCELLED: z.number(),
    VOID: z.number(),
  }),
  disputed: z.number(),
  pendingConfirmation: z.number(),
  lateCancellations: z.number(),
  walkovers: z.number(),
  requiresAdminReview: z.number(),
});

export type MatchStats = z.infer<typeof matchStatsSchema>;

// ===== FILTER TYPES =====
export interface MatchFilters {
  leagueId?: string;
  seasonId?: string;
  divisionId?: string;
  status?: MatchStatus | MatchStatus[];
  startDate?: Date;
  endDate?: Date;
  search?: string;
  isDisputed?: boolean;
  hasLateCancellation?: boolean;
  page?: number;
  limit?: number;
}

// ===== QUICK ACTION TYPES =====
export interface VoidMatchInput {
  matchId: string;
  reason: string;
  notifyParticipants?: boolean;
}

export interface ConvertToWalkoverInput {
  matchId: string;
  reason: WalkoverReason;
  defaultingPlayerId: string;
  winningPlayerId: string;
  notifyParticipants?: boolean;
}

export interface MessageParticipantsInput {
  matchId: string;
  subject: string;
  message: string;
  sendEmail?: boolean;
  sendPush?: boolean;
}

export interface EditMatchResultInput {
  matchId: string;
  team1Score?: number;
  team2Score?: number;
  setScores?: { setNumber: number; team1Games: number; team2Games: number }[];
  outcome?: string;
  reason: string;
}
