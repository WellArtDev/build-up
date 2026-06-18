import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthContext } from '@/lib/auth/middleware';
import { validateTenantAccess } from '@/lib/api/validateTenant';
import { handleApiError } from '@/lib/api/handleError';

export async function GET(
  _req: NextRequest,
  routeParams: { params: { tenantId: string } },
) {
  try {
    const ctx = await getAuthContext();
    const tenantId = parseInt(routeParams.params.tenantId, 10);
    await validateTenantAccess(tenantId, ctx.userId, ctx.role);

    const rows = await query(
      `SELECT a.*, s.name as student_name, t.name as tournament_name
       FROM achievements a
       LEFT JOIN students s ON a.student_id = s.id
       LEFT JOIN tournaments t ON a.tournament_id = t.id
       WHERE a.tenant_id = ?
       ORDER BY a.date_achieved DESC LIMIT 50`,
      [tenantId],
    );

    return NextResponse.json({ success: true, data: rows });
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
    const { achievement_type, title, description, rank_position, date_achieved, student_id, tournament_id } = body;

    if (!title || !date_achieved) {
      return NextResponse.json({ success: false, error: 'Judul dan tanggal wajib diisi' }, { status: 400 });
    }

    await query(
      `INSERT INTO achievements (tenant_id, achievement_type, title, description, rank_position, date_achieved, student_id, tournament_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, achievement_type || 'individual', title, description || '', rank_position || 1, date_achieved, student_id || null, tournament_id || null],
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
