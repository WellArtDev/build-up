import { NextResponse } from 'next/server';
import { AuthError } from '@/lib/auth/middleware';

export function handleApiError(err: unknown): NextResponse {
  if (err instanceof AuthError) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode },
    );
  }

  console.error('API Error:', err);
  const message = err instanceof Error ? err.message : 'Internal server error';

  return NextResponse.json(
    { success: false, error: message },
    { status: 500 },
  );
}
