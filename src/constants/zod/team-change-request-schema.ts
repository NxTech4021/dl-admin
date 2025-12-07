import { z } from "zod";

export const teamChangeRequestStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "DENIED",
  "CANCELLED",
]);

export type TeamChangeRequestStatus = z.infer<typeof teamChangeRequestStatusSchema>;

export const teamChangeRequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  user: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      image: z.string().nullable().optional(),
      username: z.string(),
    })
    .nullable()
    .optional(),
  currentDivisionId: z.string(),
  currentDivision: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable()
    .optional(),
  requestedDivisionId: z.string(),
  requestedDivision: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable()
    .optional(),
  seasonId: z.string(),
  season: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable()
    .optional(),
  reason: z.string().nullable().optional(),
  status: teamChangeRequestStatusSchema,
  reviewedByAdminId: z.string().nullable().optional(),
  reviewedByAdmin: z
    .object({
      id: z.string(),
      user: z
        .object({
          name: z.string(),
        })
        .nullable()
        .optional(),
    })
    .nullable()
    .optional(),
  reviewedAt: z.string().nullable().optional(),
  adminNotes: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TeamChangeRequest = z.infer<typeof teamChangeRequestSchema>;

export const teamChangeRequestsResponseSchema = z.array(teamChangeRequestSchema);

export type TeamChangeRequestsResponse = z.infer<typeof teamChangeRequestsResponseSchema>;

// Helper functions
export const getStatusLabel = (status: TeamChangeRequestStatus): string => {
  const labels: Record<TeamChangeRequestStatus, string> = {
    PENDING: "Pending",
    APPROVED: "Approved",
    DENIED: "Denied",
    CANCELLED: "Cancelled",
  };
  return labels[status] || status;
};

export const getStatusColor = (status: TeamChangeRequestStatus): string => {
  const colors: Record<TeamChangeRequestStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    APPROVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    DENIED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  };
  return colors[status] || "";
};
