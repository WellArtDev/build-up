import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthContext } from '@/lib/auth/middleware';
import { validateTenantAccess } from '@/lib/api/validateTenant';
import { handleApiError } from '@/lib/api/handleError';
import bcrypt from 'bcryptjs';

export async function GET(
  _req: NextRequest,
  routeParams: { params: { tenantId: string } },
) {
  try {
    const ctx = await getAuthContext();
    const tenantId = parseInt(routeParams.params.tenantId, 10);
    await validateTenantAccess(tenantId, ctx.userId, ctx.role);

    const coaches = await query(
      `SELECT c.*, u.name, u.email, u.phone, u.avatar, u.is_active, u.id as user_id,
        (SELECT COUNT(*) FROM students s JOIN assessments a ON a.student_id = s.id WHERE a.coach_id = c.id AND s.status = 'active') as active_students
       FROM coaches c
       JOIN users u ON c.user_id = u.id
       WHERE c.tenant_id = ?
       ORDER BY c.created_at DESC`,
      [tenantId],
    );

    return NextResponse.json({ success: true, data: coaches });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(
  req: NextRequest,
  routeParams: { params: { tenantId: string } },
) {
  try {
    const ctx = await getAuthContext(['academy_owner', 'academy_admin']);
    const tenantId = parseInt(routeParams.params.tenantId, 10);
    await validateTenantAccess(tenantId, ctx.userId, ctx.role);

    const body = await req.json();
    const { name, email, phone, license_number, specialization, experience_years, bio, password } = body;

    if (!name || !email) {
      return NextResponse.json({ success: false, error: 'Nama dan email wajib diisi' }, { status: 400 });
    }

    // Check existing
    const existing = await queryOne<{ id: number }>('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email sudah terdaftar' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password || 'password123', 12);

    const userResult = await query(
      'INSERT INTO users (tenant_id, email, password_hash, name, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [tenantId, email, passwordHash, name, 'coach', phone || ''],
    );
    const userId = (userResult as { insertId: number }).insertId;

    const coachResult = await query(
      'INSERT INTO coaches (tenant_id, user_id, license_number, specialization, experience_years, bio) VALUES (?, ?, ?, ?, ?, ?)',
      [tenantId, userId, license_number || '', specialization || '', experience_years || 0, bio || ''],
    );

    return NextResponse.json({
      success: true,
      data: { id: (coachResult as { insertId: number }).insertId, user_id: userId },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
