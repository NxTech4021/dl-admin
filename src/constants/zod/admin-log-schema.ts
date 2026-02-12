import { z } from "zod";

// ========================================
// Admin Log Schemas
// ========================================

// Admin user within a log entry
export const adminLogAdminSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullable(),
});
export type AdminLogAdmin = z.infer<typeof adminLogAdminSchema>;

// Single admin log entry
export const adminLogEntrySchema = z.object({
  id: z.string(),
  actionType: z.string(),
  targetType: z.string(),
  targetId: z.string().nullable(),
  description: z.string(),
  oldValue: z.record(z.string(), z.unknown()).nullable(),
  newValue: z.record(z.string(), z.unknown()).nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.string(),
  admin: adminLogAdminSchema.nullable(),
});
export type AdminLogEntry = z.infer<typeof adminLogEntrySchema>;

// Paginated admin logs response
export const paginatedAdminLogsSchema = z.object({
  data: z.array(adminLogEntrySchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export type PaginatedAdminLogs = z.infer<typeof paginatedAdminLogsSchema>;

// Filter option (for action types / target types dropdowns)
export const filterOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});
export type FilterOption = z.infer<typeof filterOptionSchema>;

// Admin log query filters
export const adminLogFiltersSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  actionType: z.string().optional(),
  targetType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
export type AdminLogFilters = z.infer<typeof adminLogFiltersSchema>;

// Activity summary (from getSummary endpoint)
export const activitySummarySchema = z.object({
  totalActions: z.number(),
  byActionType: z.array(z.object({ actionType: z.string(), count: z.number() })),
  byTargetType: z.array(z.object({ targetType: z.string(), count: z.number() })),
  dailyCounts: z.array(z.object({ date: z.string(), count: z.number() })),
  period: z.string(),
});
export type ActivitySummary = z.infer<typeof activitySummarySchema>;

// ========================================
// User Activity Log Schemas
// ========================================

// User within an activity log entry
export const activityLogUserSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string(),
  image: z.string().nullable(),
  username: z.string().optional(),
});
export type ActivityLogUser = z.infer<typeof activityLogUserSchema>;

// Single user activity log entry
export const userActivityLogEntrySchema = z.object({
  id: z.number(),
  userId: z.string(),
  actionType: z.string(),
  targetType: z.string(),
  targetId: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  ipAddress: z.string().nullable(),
  createdAt: z.string(),
  user: activityLogUserSchema,
});
export type UserActivityLogEntry = z.infer<typeof userActivityLogEntrySchema>;

// Paginated user activity logs response
export const paginatedUserActivityLogsSchema = z.object({
  data: z.array(userActivityLogEntrySchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export type PaginatedUserActivityLogs = z.infer<typeof paginatedUserActivityLogsSchema>;

// User activity query filters
export const userActivityFiltersSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  userId: z.string().optional(),
  actionType: z.string().optional(),
  targetType: z.string().optional(),
  targetId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
export type UserActivityFilters = z.infer<typeof userActivityFiltersSchema>;
