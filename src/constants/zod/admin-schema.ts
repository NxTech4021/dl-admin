import z from "zod";

export const adminSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.string().optional(),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED"]),
  createdAt: z.string(),
  image: z.string().nullable().optional(),
  updatedAt: z.string().optional(),
  expiresAt: z.string().optional(),
});

export type Admin = z.infer<typeof adminSchema>;

export type AdminStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

export const adminDetailSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED"]),
  invitedBy: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  user: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
      username: z.string().nullable(),
      displayUsername: z.string().nullable().optional(),
      image: z.string().nullable(),
      gender: z.string().nullable(),
      area: z.string().nullable(),
      role: z.string(),
      lastLogin: z.string().nullable(),
      createdAt: z.string(),
      updatedAt: z.string(),
      accounts: z.array(
        z.object({
          providerId: z.string(),
          createdAt: z.string(),
        })
      ),
      sessions: z.array(
        z.object({
          ipAddress: z.string().nullable(),
          userAgent: z.string().nullable(),
          expiresAt: z.string(),
          createdAt: z.string(),
        })
      ),
    })
    .nullable(),
  invite: z
    .object({
      email: z.string(),
      createdAt: z.string(),
      expiresAt: z.string(),
    })
    .nullable()
    .optional(),
  leagues: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      sportType: z.string(),
      status: z.string(),
      createdAt: z.string(),
    })
  ),
  _count: z.object({
    leagues: z.number(),
    reviewedDisputes: z.number(),
    resolvedDisputes: z.number(),
    adminMatchActions: z.number(),
    statusChanges: z.number(),
  }),
});

export type AdminDetail = z.infer<typeof adminDetailSchema>;

export interface AdminStatusHistoryItem {
  id: string;
  previousStatus: AdminStatus;
  newStatus: AdminStatus;
  reason: string;
  notes: string | null;
  createdAt: string;
  triggeredBy: {
    name: string;
    email: string;
  } | null;
}
