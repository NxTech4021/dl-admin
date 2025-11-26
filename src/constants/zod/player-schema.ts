import z from "zod";


export const playerSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayUsername: z.string().nullable(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  area: z.string().nullish(),
  gender: z.string().nullable().transform(val => {
    if (!val) return null;
    const lower = val.toLowerCase();
    return lower === "male" || lower === "female" ? lower : null;
  }),
  dateOfBirth: z.coerce.date().nullable(),
  registeredDate: z.coerce.date(),
  lastLoginDate: z.coerce.date().nullish(),
  sports: z.array(z.string()),
  skillRatings: z
    .record(
      z.string(),
      z.object({
        rating: z.number(),
        confidence: z.string(),
        rd: z.number(),
      })
    )
    .nullable(),
  status: z
    .string()
    .nullable()
    .transform((val) => {
      if (!val) return null;
      const lower = val.toLowerCase();
      if (lower === "active" || lower === "inactive" || lower === "suspended") {
        return lower as "active" | "inactive" | "suspended";
      }
      return null;
    }),
  completedOnboarding: z.boolean().default(false),
});

export type Player = z.infer<typeof playerSchema>;