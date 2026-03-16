/**
 * Shared API error types and utilities for consistent error handling
 */

/** Standard API error response structure */
export interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
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
 * Check if an error is a 429 rate limit response
 */
export function isRateLimited(error: unknown): boolean {
  if (typeof error === "object" && error !== null && "response" in error) {
    return (error as ApiErrorResponse).response?.status === 429;
  }
  return false;
}

/**
 * Extract retryAfter seconds from a 429 error, if present
 */
export function getRateLimitRetryAfter(error: unknown): number | undefined {
  if (!isRateLimited(error)) return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (error as any).response?.data?.retryAfter;
}

/**
 * Extract error message from unknown error.
 * Enriches 429 messages with retryAfter when available.
 */
export function getErrorMessage(
  error: unknown,
  fallback: string = "An unexpected error occurred"
): string {
  let message = fallback;
  if (isApiError(error)) {
    message = error.response?.data?.message || error.message || fallback;
  } else if (error instanceof Error) {
    message = error.message;
  }

  const retryAfter = getRateLimitRetryAfter(error);
  if (retryAfter) {
    message += `. Try again in ${retryAfter}s.`;
  }

  return message;
}

const NON_RETRYABLE_STATUS_CODES = [429, 401, 403];

function isNonRetryable(error: unknown): boolean {
  if (typeof error === "object" && error !== null && "response" in error) {
    const status = (error as ApiErrorResponse).response?.status;
    return status !== undefined && NON_RETRYABLE_STATUS_CODES.includes(status);
  }
  return false;
}

/** For React Query queries — max 2 retries, skip 429/401/403 */
export function shouldRetryQuery(
  failureCount: number,
  error: unknown
): boolean {
  if (isNonRetryable(error)) return false;
  return failureCount < 2;
}

/** For React Query mutations — max 1 retry, skip 429/401/403 */
export function shouldRetryMutation(
  failureCount: number,
  error: unknown
): boolean {
  if (isNonRetryable(error)) return false;
  return failureCount < 1;
}
