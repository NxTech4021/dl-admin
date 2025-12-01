import z from "zod";

/** Lightweight season reference for league context */
const leagueSeasonRefSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string().optional(),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  _count: z
    .object({
      memberships: z.number().optional(),
    })
    .optional(),
});

/** Sponsorship reference for league context */
const leagueSponsorshipRefSchema = z.object({
  id: z.string(),
  sponsoredName: z.string().optional(),
  tier: z.string().optional(),
  packageTier: z.string().optional(),
  amount: z.number().optional(),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
});

/** Membership reference for league context */
const leagueMembershipRefSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
});

/** Division reference for league context */
const leagueDivisionRefSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  level: z.number().optional(),
});

/** Invite reference for league context */
const leagueInviteRefSchema = z.object({
  id: z.string(),
  email: z.string().optional(),
  status: z.string().optional(),
});

export const leagueSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "League name is required"),
  location: z.string().nullable().optional(),
  description: z.string().nullable().optional(),

  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "UPCOMING", "ONGOING", "FINISHED", "CANCELLED"]),
  sportType: z.enum(["PADEL", "PICKLEBALL", "TENNIS"]),
  joinType: z.enum(["OPEN", "INVITE_ONLY", "MANUAL"]).nullable().optional(),
  gameType: z.enum(["SINGLES", "DOUBLES", "MIXED"]),

  createdById: z.string().nullable().optional(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  // Related entities with proper schemas
  seasons: z.array(leagueSeasonRefSchema).optional(),
  sponsorships: z.array(leagueSponsorshipRefSchema).optional(),
  memberships: z.array(leagueMembershipRefSchema).optional(),
  divisions: z.array(leagueDivisionRefSchema).optional(),
  invites: z.array(leagueInviteRefSchema).optional(),

  // Computed fields
  memberCount: z.number().optional(),
  seasonCount: z.number().optional(),
  categoryCount: z.number().optional(),
  divisionCount: z.number().optional(),

  createdBy: z
    .object({
      id: z.string(),
      name: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export type League = z.infer<typeof leagueSchema>;
export type LeagueSeasonRef = z.infer<typeof leagueSeasonRefSchema>;
export type LeagueSponsorshipRef = z.infer<typeof leagueSponsorshipRefSchema>;
export type LeagueMembershipRef = z.infer<typeof leagueMembershipRefSchema>;
export type LeagueDivisionRef = z.infer<typeof leagueDivisionRefSchema>;
export type LeagueInviteRef = z.infer<typeof leagueInviteRefSchema>;