import { describe, it, expect } from 'vitest';
import { getErrorMessage, isApiError } from '@/lib/api-error';

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

    it('should extract error field from API error response', () => {
      const error = { response: { data: { error: 'Bad request' } } };
      expect(getErrorMessage(error)).toBe('Bad request');
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
});
