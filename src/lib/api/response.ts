import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * Standardized API response builder.
 * Every API route should use these instead of raw NextResponse.json().
 */

interface ApiErrorResponse {
  success: false;
  error: string;
  requestId: string;
}

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  requestId: string;
  meta?: { total: number; page: number; limit: number };
}

export function apiSuccess<T>(data: T, meta?: { total: number; page: number; limit: number }, status = 200): NextResponse {
  return NextResponse.json(
    { success: true, data, requestId: uuidv4(), ...(meta ? { meta } : {}) } satisfies ApiSuccessResponse<T>,
    { status },
  );
}

export function apiError(error: string, status = 400): NextResponse {
  return NextResponse.json(
    { success: false, error, requestId: uuidv4() } satisfies ApiErrorResponse,
    { status },
  );
}

export function apiUnauthorized(message = 'Authentication required'): NextResponse {
  return apiError(message, 401);
}

export function apiForbidden(message = 'Insufficient permissions'): NextResponse {
  return apiError(message, 403);
}

export function apiNotFound(message = 'Resource not found'): NextResponse {
  return apiError(message, 404);
}

export function apiConflict(message: string): NextResponse {
  return apiError(message, 409);
}

export function apiValidationError(message: string): NextResponse {
  return apiError(message, 422);
}

export function apiServerError(message = 'Internal server error'): NextResponse {
  return apiError(message, 500);
}
