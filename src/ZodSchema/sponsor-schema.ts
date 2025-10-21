import { z } from "zod";

export const leagueSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const sponsorSchema = z.object({
  id: z.string(),
  sponsoredName: z.string().nullable(),
  packageTier: z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]),
  contractAmount: z.number().nullable(),
  sponsorRevenue: z.number().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  leagues: z.array(leagueSchema).optional(),
});

export type Sponsor = z.infer<typeof sponsorSchema>;
export type League = z.infer<typeof leagueSchema>;
