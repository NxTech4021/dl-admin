import axios from 'axios';
import { getErrorMessage } from '@/lib/api-error';
import { logger } from '@/lib/logger';

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  timeout: 30000,
});

/**
 * Response normalizer interceptor.
 *
 * Guarantees every successful response has the shape:
 *   { success: true, data: T, message?: string, pagination?: {...} }
 *
 * Handles all legacy backend patterns:
 *   - ApiResponse class: { success, status, data, message }
 *   - Triple-nesting: { success, data: { data: [...], pagination }, message }
 *   - Manual envelope: { success, data, message }
 *   - Raw Prisma objects: { id, name, ... }
 *   - Named paginated: { matches, pagination } or { players, pagination }
 */
apiClient.interceptors.response.use(
  (response) => {
    const body = response.data;

    // Non-object or null — pass through
    if (!body || typeof body !== 'object') return response;

    // Array at top level — wrap it
    if (Array.isArray(body)) {
      response.data = { success: true, data: body };
      return response;
    }

    // Has success + data — standard or ApiResponse envelope
    if ('success' in body && 'data' in body) {
      // Detect triple-nesting: data contains both `data` (array) and `pagination`
      if (
        body.data &&
        typeof body.data === 'object' &&
        !Array.isArray(body.data) &&
        'data' in body.data &&
        'pagination' in body.data
      ) {
        const { data: nestedData, pagination, ...rest } = body.data;
        response.data = {
          success: body.success,
          data: nestedData,
          pagination,
          ...rest,
          ...(body.message && { message: body.message }),
        };
        return response;
      }

      // Strip legacy `status` number field from ApiResponse
      if ('status' in body && typeof body.status === 'number') {
        const { status: _status, ...rest } = body;
        response.data = rest;
      }

      return response;
    }

    // No `success` field — raw Prisma object or legacy format

    // Check for named paginated shape: { someArray, pagination }
    if ('pagination' in body) {
      const { pagination, ...rest } = body;
      const arrayKey = Object.keys(rest).find((k) => Array.isArray(rest[k]));
      if (arrayKey) {
        const { [arrayKey]: items, ...otherMeta } = rest;
        response.data = { success: true, data: items, pagination, ...otherMeta };
        return response;
      }
    }

    // Check for inline pagination: { someArray, total, page, limit, totalPages }
    const keys = Object.keys(body);
    const arrayKey = keys.find((k) => Array.isArray(body[k]));
    if (arrayKey && ('total' in body || 'totalPages' in body)) {
      const { [arrayKey]: items, page, limit, total, totalPages, ...otherMeta } = body;
      response.data = {
        success: true,
        data: items,
        pagination: {
          page: page || 1,
          limit: limit || items.length,
          total: total || items.length,
          totalPages: totalPages || 1,
        },
        ...otherMeta,
      };
      return response;
    }

    // Plain object — wrap it
    response.data = { success: true, data: body };
    return response;
  },
  (error) => {
    // Normalize error response to standard shape
    if (error.response?.data) {
      const d = error.response.data;
      // Ensure `message` field exists (some endpoints use `error` key instead)
      if (d.error && !d.message) {
        d.message = d.error;
      }
      if (!('data' in d)) {
        d.data = null;
      }
      if (!('success' in d)) {
        d.success = false;
      }
    }
    // Don't log canceled requests — these are intentional AbortController cleanups from React effects
    if (import.meta.env.DEV && !axios.isCancel(error)) {
      logger.error(
        `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`,
        getErrorMessage(error)
      );
    }
    return Promise.reject(error);
  }
);
