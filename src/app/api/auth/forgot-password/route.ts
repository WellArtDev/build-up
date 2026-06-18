import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

/**
 * Placeholder forgot-password endpoint.
 * In production, integrate with email service (send actual reset link).
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email wajib diisi' },
        { status: 400 },
      );
    }

    const user = await queryOne<{ id: number }>(
      'SELECT id FROM users WHERE email = ? AND is_active = TRUE',
      [email],
    );

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // TODO: Generate reset token, save to DB, send email
    // For Phase 1, just acknowledge

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
