import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { getAuthContext } from '@/lib/auth/middleware';
import { handleApiError } from '@/lib/api/handleError';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthContext();
    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ success: false, error: 'Password lama dan baru wajib diisi' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'Password baru minimal 6 karakter' }, { status: 400 });
    }

    const user = await queryOne<{ password_hash: string }>(
      'SELECT password_hash FROM users WHERE id = ?',
      [ctx.userId],
    );

    if (!user) {
      return NextResponse.json({ success: false, error: 'User tidak ditemukan' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Password lama salah' }, { status: 400 });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await queryOne('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, ctx.userId]);

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
