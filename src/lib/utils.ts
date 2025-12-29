import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format division level enum to human-readable label
 * Handles both underscore-separated and regular enum values
 * Examples:
 *  - "UPPER_INTERMEDIATE" → "Upper Intermediate"
 *  - "beginner" → "Beginner"
 *  - "ADVANCED" → "Advanced"
 */
export function formatDivisionLevel(level: string | null | undefined): string {
  if (!level) return "Unknown";

  return level
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
