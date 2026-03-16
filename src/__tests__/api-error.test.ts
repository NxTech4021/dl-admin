import { describe, it, expect } from 'vitest';
import {
  getErrorMessage,
  isApiError,
  isRateLimited,
  getRateLimitRetryAfter,
  shouldRetryQuery,
  shouldRetryMutation,
} from '@/lib/api-error';

describe('API Error Utilities', () => {
  describe('isApiError', () => {
    it('should return true for axios-like errors', () => {
      const axiosError = {
        response: {
          data: { message: 'Error message' },
          status: 400,
        },
        message: 'Request failed',
      };
      expect(isApiError(axiosError)).toBe(true);
    });

    it('should return true for objects with response', () => {
      expect(isApiError({ response: { data: {} } })).toBe(true);
    });

    it('should return true for errors with message property', () => {
      // Note: Regular Error objects have a 'message' property, so isApiError returns true
      // This is intentional - the function checks for objects with 'response' OR 'message'
      const regularError = new Error('Regular error');
      expect(isApiError(regularError)).toBe(true);
    });

    it('should return true for objects with message', () => {
      expect(isApiError({ message: 'error' })).toBe(true);
    });

    it('should return false for objects without response or message', () => {
      const plainObject = { foo: 'bar' };
      expect(isApiError(plainObject)).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isApiError(null)).toBe(false);
      expect(isApiError(undefined)).toBe(false);
    });

    it('should return false for non-objects', () => {
      expect(isApiError('string')).toBe(false);
      expect(isApiError(42)).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should extract message from API error response', () => {
      const apiError = {
        response: {
          data: { message: 'API error message' },
        },
        message: 'Fallback message',
      };
      const result = getErrorMessage(apiError);
      expect(result).toBe('API error message');
    });

    it('should extract message from response.data.message', () => {
      const error = { response: { data: { message: 'Not found' } } };
      expect(getErrorMessage(error)).toBe('Not found');
    });

    it('should fall back when response has no message field', () => {
      const error = { response: { data: {} } };
      expect(getErrorMessage(error)).toBe('An unexpected error occurred');
    });

    it('should use error.message as fallback', () => {
      const error = { message: 'Network error' };
      expect(getErrorMessage(error)).toBe('Network error');
    });

    it('should return error.message for standard errors', () => {
      const error = new Error('Standard error message');
      const result = getErrorMessage(error);
      expect(result).toBe('Standard error message');
    });

    it('should handle Error instances', () => {
      const error = new Error('Something went wrong');
      expect(getErrorMessage(error)).toBe('Something went wrong');
    });

    it('should return fallback for unknown errors', () => {
      expect(getErrorMessage(null)).toBe('An unexpected error occurred');
      expect(getErrorMessage(undefined)).toBe('An unexpected error occurred');
      expect(getErrorMessage('string error')).toBe('An unexpected error occurred');
    });

    it('should use custom fallback', () => {
      expect(getErrorMessage(null, 'Custom fallback')).toBe('Custom fallback');
    });

    it('should use default fallback when not provided', () => {
      const result = getErrorMessage({});
      expect(result).toBe('An unexpected error occurred');
    });
  });

  describe('getErrorMessage with 429', () => {
    it('should append retryAfter to 429 error messages', () => {
      const error = {
        response: { status: 429, data: { message: 'Too many requests', retryAfter: 30 } },
      };
      expect(getErrorMessage(error)).toBe('Too many requests. Try again in 30s.');
    });

    it('should not append for 429 without retryAfter', () => {
      const error = {
        response: { status: 429, data: { message: 'Too many requests' } },
      };
      expect(getErrorMessage(error)).toBe('Too many requests');
    });

    it('should not append retryAfter for non-429', () => {
      const error = {
        response: { status: 500, data: { message: 'Server error', retryAfter: 60 } },
      };
      expect(getErrorMessage(error)).toBe('Server error');
    });

    it('should not append for retryAfter: 0', () => {
      const error = {
        response: { status: 429, data: { message: 'Too many requests', retryAfter: 0 } },
      };
      expect(getErrorMessage(error)).toBe('Too many requests');
    });
  });

  describe('isRateLimited', () => {
    it('should return true for 429 status', () => {
      const error = { response: { status: 429, data: { message: 'Rate limited' } } };
      expect(isRateLimited(error)).toBe(true);
    });

    it('should return false for 500 status', () => {
      const error = { response: { status: 500, data: { message: 'Server error' } } };
      expect(isRateLimited(error)).toBe(false);
    });

    it('should return false for non-API errors', () => {
      const error = new Error('Network error');
      expect(isRateLimited(error)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isRateLimited(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isRateLimited(undefined)).toBe(false);
    });
  });

  describe('getRateLimitRetryAfter', () => {
    it('should extract retryAfter from response data', () => {
      const error = {
        response: { status: 429, data: { message: 'Rate limited', retryAfter: 45 } },
      };
      expect(getRateLimitRetryAfter(error)).toBe(45);
    });

    it('should return undefined when no retryAfter', () => {
      const error = {
        response: { status: 429, data: { message: 'Rate limited' } },
      };
      expect(getRateLimitRetryAfter(error)).toBeUndefined();
    });

    it('should return undefined for non-429 errors', () => {
      const error = {
        response: { status: 500, data: { message: 'Server error', retryAfter: 60 } },
      };
      expect(getRateLimitRetryAfter(error)).toBeUndefined();
    });
  });

  describe('shouldRetryQuery', () => {
    it('should return false for 429', () => {
      const error = { response: { status: 429 } };
      expect(shouldRetryQuery(0, error)).toBe(false);
    });

    it('should return false for 401', () => {
      const error = { response: { status: 401 } };
      expect(shouldRetryQuery(0, error)).toBe(false);
    });

    it('should return false for 403', () => {
      const error = { response: { status: 403 } };
      expect(shouldRetryQuery(0, error)).toBe(false);
    });

    it('should return true for 500 on first attempt (failureCount=0)', () => {
      const error = { response: { status: 500 } };
      expect(shouldRetryQuery(0, error)).toBe(true);
    });

    it('should return true for 500 on second attempt (failureCount=1)', () => {
      const error = { response: { status: 500 } };
      expect(shouldRetryQuery(1, error)).toBe(true);
    });

    it('should return false for 500 on third attempt (failureCount=2, max 2 retries)', () => {
      const error = { response: { status: 500 } };
      expect(shouldRetryQuery(2, error)).toBe(false);
    });

    it('should return true for network error on first attempt', () => {
      const error = new Error('Network Error');
      expect(shouldRetryQuery(0, error)).toBe(true);
    });

    it('should return false for network error after max retries', () => {
      const error = new Error('Network Error');
      expect(shouldRetryQuery(2, error)).toBe(false);
    });
  });

  describe('shouldRetryMutation', () => {
    it('should return false for 429', () => {
      const error = { response: { status: 429 } };
      expect(shouldRetryMutation(0, error)).toBe(false);
    });

    it('should return false for 401', () => {
      const error = { response: { status: 401 } };
      expect(shouldRetryMutation(0, error)).toBe(false);
    });

    it('should return false for 403', () => {
      const error = { response: { status: 403 } };
      expect(shouldRetryMutation(0, error)).toBe(false);
    });

    it('should return true for 500 on first attempt (failureCount=0)', () => {
      const error = { response: { status: 500 } };
      expect(shouldRetryMutation(0, error)).toBe(true);
    });

    it('should return false for 500 on second attempt (failureCount=1, max 1 retry)', () => {
      const error = { response: { status: 500 } };
      expect(shouldRetryMutation(1, error)).toBe(false);
    });
  });
});
