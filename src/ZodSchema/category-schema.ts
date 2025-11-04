import { z } from "zod";

export const categorySchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  genderRestriction: z.enum(["MALE", "FEMALE", "MIXED"]),
  matchFormat: z.string().nullable(),
  game_type: z.enum(["SINGLES", "DOUBLES"]).nullable(),
  gender_category: z.enum(["MALE", "FEMALE", "MIXED"]).nullable(),
  isActive: z.boolean(),
  categoryOrder: z.number(),
   seasons: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        startDate: z.coerce.date().nullable(),
        endDate: z.coerce.date().nullable(),
      })
    )
    .default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Category = z.infer<typeof categorySchema>;

// Schema for creating a new category
export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  genderRestriction: z.enum(["MALE", "FEMALE", "MIXED"]),
  matchFormat: z.string().optional(),
  game_type: z.enum(["SINGLES", "DOUBLES"]).optional(),
  gender_category: z.enum(["MALE", "FEMALE", "MIXED"]).optional(),
  categoryOrder: z.number().min(0, "Category order must be non-negative").default(0),
  seasonId: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type CreateCategoryData = z.infer<typeof createCategorySchema>;

// Schema for updating a category
export const updateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").optional(),
  genderRestriction: z.enum(["MALE", "FEMALE", "MIXED"]).optional(),
  matchFormat: z.string().optional(),
  game_type: z.enum(["SINGLES", "DOUBLES"]).optional(),
  gender_category: z.enum(["MALE", "FEMALE", "MIXED"]).optional(),
  categoryOrder: z.number().min(0, "Category order must be non-negative").optional(),
  seasonId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateCategoryData = z.infer<typeof updateCategorySchema>;
