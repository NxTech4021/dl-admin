import z from "zod";


export const leagueSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string().nullable().optional(),
  description: z.string().nullable().optional(),

  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "UPCOMING", "ONGOING", "FINISHED", "CANCELLED"]),
  sportType: z.enum(["PADEL", "PICKLEBALL", "TENNIS"]),
  joinType: z.enum(["OPEN", "INVITE_ONLY", "MANUAL"]).nullable().optional(),
  gameType: z.enum(["SINGLES", "DOUBLES"]),

  createdById: z.string().nullable().optional(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  // ✅ Optional related/computed fields
  seasons: z.array(z.any()).optional(),
  sponsorships: z.array(z.any()).optional(),
  memberships: z.array(z.any()).optional(),
  divisions: z.array(z.any()).optional(),
  invites: z.array(z.any()).optional(),
  
  // Computed fields
  memberCount: z.number().optional(),
  seasonCount: z.number().optional(),

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