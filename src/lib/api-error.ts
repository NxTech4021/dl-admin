/**
 * Shared API error types and utilities for consistent error handling
 */

/** Standard API error response structure */
export interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
    status?: number;
  };
  message?: string;
}

/**
 * Type guard to check if an unknown error is an API error
 */
export function isApiError(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === "object" &&
    error !== null &&
    ("response" in error || "message" in error)
  );
}

/**
 * Extract error message from unknown error
 * @param error - Unknown error object
 * @param fallback - Fallback message if extraction fails
 * @returns Error message string
 */
export function getErrorMessage(
  error: unknown,
  fallback: string = "An unexpected error occurred"
): string {
  if (isApiError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      fallback
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
