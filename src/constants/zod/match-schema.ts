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

export const matchReportCategoryEnum = z.enum([
  "FAKE_MATCH",
  "RATING_MANIPULATION",
  "INAPPROPRIATE_CONTENT",
  "HARASSMENT",
  "SPAM",
  "OTHER",
]);

export const matchContextEnum = z.enum([
  "league",
  "friendly",
  "all",
]);

// ===== JSON FIELD SCHEMAS =====

/** Set score entry for matches (stored as JSON) */
export const setScoreEntrySchema = z.object({
  setNumber: z.number().optional(),
  team1Games: z.number().optional(),
  team2Games: z.number().optional(),
  // Alternative format from backend
  player1: z.number().optional(),
  player2: z.number().optional(),
});

/** Set scores can come in different formats from backend */
export const setScoresSchema = z.union([
  // Array format
  z.array(setScoreEntrySchema),
  // Object with sets array format
  z.object({
    sets: z.array(z.object({
      player1: z.number(),
      player2: z.number(),
    })),
  }),
  // Object with games array format (pickleball)
  z.object({
    games: z.array(z.object({
      player1: z.number(),
      player2: z.number(),
    })),
  }),
]);

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
  isStarter: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    username: z.string().nullable().optional(),
    displayUsername: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
  }).passthrough(),
}).passthrough();

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
  createdAt: z.coerce.date().optional(),
}).passthrough();

// Dispute resolution action enum
export const disputeResolutionActionEnum = z.enum([
  "UPHOLD_ORIGINAL",
  "UPHOLD_DISPUTER",
  "CUSTOM_SCORE",
  "VOID_MATCH",
  "AWARD_WALKOVER",
  "REQUEST_MORE_INFO",
  "REJECT",
]);

// Dispute schema
export const matchDisputeSchema = z.object({
  id: z.string(),
  matchId: z.string().optional(),
  disputeCategory: z.enum(["WRONG_SCORE", "NO_SHOW", "BEHAVIOR", "OTHER"]).optional(),
  disputeComment: z.string().nullable().optional(),
  disputerScore: z.unknown().nullable().optional(),
  evidenceUrl: z.string().nullable().optional(),
  status: disputeStatusEnum,
  priority: disputePriorityEnum.optional(),
  submittedAt: z.coerce.date().optional(),
  resolvedAt: z.coerce.date().nullable().optional(),
  adminResolution: z.string().nullable().optional(),
  resolutionAction: disputeResolutionActionEnum.nullable().optional(),
  finalScore: z.unknown().nullable().optional(),
  // User relations - support both naming conventions from backend
  raisedByUserId: z.string().optional(),
  raisedByUser: z.object({
    id: z.string(),
    name: z.string().nullable().optional(),
    username: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
  }).passthrough().optional(),
  // Legacy fields for backwards compatibility
  disputedById: z.string().optional(),
  disputedBy: z.object({
    id: z.string(),
    name: z.string(),
    username: z.string().nullable().optional(),
  }).passthrough().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.coerce.date().optional(),
}).passthrough();

// Walkover schema
export const matchWalkoverSchema = z.object({
  id: z.string(),
  matchId: z.string(),
  // Prisma field names
  walkoverReason: walkoverReasonEnum,
  walkoverReasonDetail: z.string().nullable().optional(),
  defaultingPlayerId: z.string(),
  winningPlayerId: z.string(),
  reportedBy: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  // Player relations
  defaultingPlayer: z.object({
    id: z.string(),
    name: z.string(),
    username: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
  }).nullable().optional(),
  winningPlayer: z.object({
    id: z.string(),
    name: z.string(),
    username: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
  }).nullable().optional(),
  reporter: z.object({
    id: z.string(),
    name: z.string(),
    username: z.string().nullable().optional(),
  }).nullable().optional(),
  // Legacy field names (for backwards compatibility)
  reason: walkoverReasonEnum.optional(),
  reasonDetail: z.string().nullable().optional(),
  recordedAt: z.coerce.date().optional(),
  recordedById: z.string().nullable().optional(),
}).passthrough();

// Division schema (minimal - passthrough allows extra fields from backend)
export const matchDivisionSchema = z.object({
  id: z.string(),
  name: z.string(),
  // Backend returns uppercase values
  level: z.string().optional(),
  gameType: z.string().optional(),
  genderCategory: z.string().nullable().optional(),
  season: z.object({
    id: z.string(),
    name: z.string(),
    status: z.enum(["UPCOMING", "ACTIVE", "FINISHED", "CANCELLED"]).optional(),
  }).passthrough().nullable().optional(),
  league: z.object({
    id: z.string(),
    name: z.string(),
    sportType: z.string().optional(),
  }).passthrough().nullable().optional(),
}).passthrough();

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
  setScores: z.unknown().nullable().optional(),
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

  // Friendly match moderation
  isHiddenFromPublic: z.boolean().default(false),
  hiddenAt: z.coerce.date().nullable().optional(),
  hiddenByAdminId: z.string().nullable().optional(),
  hiddenReason: z.string().nullable().optional(),
  isReportedForAbuse: z.boolean().default(false),
  reportedAt: z.coerce.date().nullable().optional(),
  reportedByAdminId: z.string().nullable().optional(),
  reportReason: z.string().nullable().optional(),
  reportCategory: matchReportCategoryEnum.nullable().optional(),

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
  }).passthrough().nullable().optional(),
  resultSubmittedBy: z.object({
    id: z.string(),
    name: z.string(),
    username: z.string().nullable().optional(),
  }).passthrough().nullable().optional(),

  // Additional fields from backend that may vary
  courtBooked: z.boolean().nullable().optional(),
  set3Format: z.string().nullable().optional(),
}).passthrough(); // Allow extra fields from backend

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
export type DisputeResolutionAction = z.infer<typeof disputeResolutionActionEnum>;
export type MatchReportCategory = z.infer<typeof matchReportCategoryEnum>;
export type MatchContext = z.infer<typeof matchContextEnum>;

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
  isWalkover?: boolean;
  requiresAdminReview?: boolean;
  matchContext?: MatchContext;
  showHidden?: boolean;
  showReported?: boolean;
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

// ===== FRIENDLY MATCH MODERATION TYPES =====
export interface HideMatchInput {
  matchId: string;
  reason: string;
}

export interface ReportMatchAbuseInput {
  matchId: string;
  reason: string;
  category: MatchReportCategory;
}
