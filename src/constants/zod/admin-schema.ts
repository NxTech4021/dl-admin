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