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
