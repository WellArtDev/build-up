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
      `SELECT t.*,
        (SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = t.id) as participant_count
       FROM tournaments t WHERE t.tenant_id = ? ORDER BY t.start_date DESC LIMIT 50`,
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
    const { name, organizer, start_date, end_date, location, age_category, tournament_type } = body;

    if (!name || !start_date || !end_date) {
      return NextResponse.json({ success: false, error: 'Nama, tanggal mulai dan selesai wajib diisi' }, { status: 400 });
    }

    await query(
      `INSERT INTO tournaments (tenant_id, name, organizer, start_date, end_date, location, age_category, tournament_type, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'upcoming')`,
      [tenantId, name, organizer || '', start_date, end_date, location || '', age_category || '', tournament_type || ''],
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
