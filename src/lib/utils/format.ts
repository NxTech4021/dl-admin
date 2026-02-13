/**
 * Format Utilities - Centralized formatting functions
 *
 * Industry Standards:
 * - Currency: Malaysian Ringgit (MYR) with no decimals
 * - Numbers: US locale with thousand separators
 * - Percentages: One decimal place precision
 */

/**
 * Format a number value based on the specified format type
 * @param value - The numeric value to format
 * @param format - The format type: "number", "currency", or "percentage"
 * @returns Formatted string representation
 */
export function formatValue(
  value: string | number,
  format: "number" | "currency" | "percentage" = "number"
): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  // Handle invalid numbers
  if (isNaN(numValue)) {
    return format === "currency" ? "RM0" : format === "percentage" ? "0.0%" : "0";
  }

  switch (format) {
    case "currency":
      return new Intl.NumberFormat("en-MY", {
        style: "currency",
        currency: "MYR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numValue);

    case "percentage":
      return `${numValue.toFixed(1)}%`;

    case "number":
    default:
      return new Intl.NumberFormat("en-US").format(numValue);
  }
}

/**
 * Format currency value in Malaysian Ringgit
 * @param value - The numeric value to format as currency
 * @returns Formatted currency string (e.g., "RM1,500")
 */
export function formatCurrency(value: number): string {
  return formatValue(value, "currency");
}

/**
 * Format percentage with one decimal place
 * @param value - The numeric value to format as percentage
 * @returns Formatted percentage string (e.g., "46.5%")
 */
export function formatPercentage(value: number): string {
  return formatValue(value, "percentage");
}

/**
 * Format number with thousand separators
 * @param value - The numeric value to format
 * @returns Formatted number string (e.g., "1,284")
 */
export function formatNumber(value: number): string {
  return formatValue(value, "number");
}

/**
 * Constants for data transformation
 */
export const CHART_CONSTANTS = {
  /** Average weeks per month (4.3) */
  WEEKS_PER_MONTH: 4.3,

  /** Y-axis padding multiplier (10%) */
  Y_AXIS_PADDING: 1.1,

  /** Chart margin values (12px) */
  CHART_MARGIN: 12,

  /** Y-axis domain offset (10 units) */
  Y_AXIS_OFFSET: 10,
} as const;

// ─── Display & Text Formatting ─────────────────────────────────────────────

/**
 * Get display name with fallback for undefined user names.
 * Accepts a user-like object with optional name/username fields.
 * @param user - Object with optional name and username
 * @returns Display name string, falling back to "Unknown"
 */
export function getDisplayName(
  user: { name?: string | null; username?: string | null } | null | undefined
): string {
  return user?.name || user?.username || "Unknown";
}

/**
 * Format duration in minutes to human-readable string (e.g., "45m", "1h 30m", "2h").
 * @param minutes - Duration in minutes
 * @returns Formatted duration string, or null if invalid
 */
export function formatDuration(minutes: number | null | undefined): string | null {
  if (!minutes || minutes <= 0) return null;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Minimal match shape required by calculateMatchDuration.
 * Avoids importing the full Match type into utility code.
 */
interface MatchDurationInput {
  status: string;
  resultSubmittedAt?: Date | string | null;
  actualStartTime?: Date | string | null;
  matchDate: Date | string;
}

/**
 * Calculate match duration from start time to result submission.
 * Only returns a value for completed matches with valid timing data.
 * @param match - Match object with status, dates, and timing information
 * @returns Duration in minutes, or null if not calculable
 */
export function calculateMatchDuration(match: MatchDurationInput): number | null {
  // Only calculate for completed matches with a result submission time
  if (match.status !== "COMPLETED" || !match.resultSubmittedAt) return null;

  // Use actualStartTime if available, otherwise fall back to matchDate
  const startTime = match.actualStartTime || match.matchDate;
  if (!startTime) return null;

  const start = new Date(startTime);
  const end = new Date(match.resultSubmittedAt);

  // Calculate difference in minutes
  const diffMs = end.getTime() - start.getTime();

  // Return null if negative or unreasonably long (over 12 hours = 720 minutes)
  if (diffMs <= 0 || diffMs > 12 * 60 * 60 * 1000) return null;

  return Math.round(diffMs / (1000 * 60));
}

/**
 * Format cancellation reason enum to readable text (e.g., "PLAYER_NO_SHOW" -> "Player No Show").
 * @param reason - Cancellation reason enum string
 * @returns Formatted readable string
 */
export function formatCancellationReason(reason: string | null | undefined): string {
  if (!reason) return "Not specified";
  return reason.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Format dispute category enum to readable text (e.g., "SCORE_DISAGREEMENT" -> "Score Disagreement").
 * @param category - Dispute category enum string
 * @returns Formatted readable string
 */
export function formatDisputeCategory(category: string | undefined): string {
  if (!category) return "Dispute";
  return category.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Format disputer score for display. Handles JSON objects, arrays, and primitives.
 * @param score - The disputer's claimed score (may be JSON string, object, or primitive)
 * @returns Formatted score string
 */
export function formatDisputerScore(score: unknown): string {
  if (!score) return "N/A";
  try {
    const parsed = typeof score === 'string' ? JSON.parse(score) : score;
    if (typeof parsed === 'object' && parsed !== null) {
      if ('team1Score' in parsed && 'team2Score' in parsed) {
        return `${(parsed as {team1Score: number}).team1Score} - ${(parsed as {team2Score: number}).team2Score}`;
      }
      if (Array.isArray(parsed)) {
        return parsed.map((set: Record<string, number>) => {
          const s1 = set.team1Games ?? set.player1 ?? 0;
          const s2 = set.team2Games ?? set.player2 ?? 0;
          return `${s1}-${s2}`;
        }).join(', ');
      }
    }
    return JSON.stringify(parsed);
  } catch {
    return String(score);
  }
}

/**
 * Format date with time for timeline display.
 * Shows "Today at 3:45 PM" for today, "Jan 5 at 3:45 PM" for this year,
 * and "Jan 5, 2023 at 3:45 PM" for other years.
 * @param date - Date value (Date object, ISO string, or null)
 * @returns Formatted timeline date string
 */
export function formatTimelineDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return "";

    const now = new Date();
    const isToday = dateObj.toDateString() === now.toDateString();
    const isThisYear = dateObj.getFullYear() === now.getFullYear();

    const timeStr = dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (isToday) {
      return `Today at ${timeStr}`;
    }

    const dateStr = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      ...(isThisYear ? {} : { year: "numeric" }),
    });

    return `${dateStr} at ${timeStr}`;
  } catch {
    return "";
  }
}
