import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthContext } from '@/lib/auth/middleware';
import { validateTenantAccess } from '@/lib/api/validateTenant';
import { handleApiError } from '@/lib/api/handleError';

export async function GET(
  req: NextRequest,
  routeParams: { params: { tenantId: string } },
) {
  try {
    const ctx = await getAuthContext();
    const tenantId = parseInt(routeParams.params.tenantId, 10);
    await validateTenantAccess(tenantId, ctx.userId, ctx.role);

    const url = new URL(req.url);
    const date = url.searchParams.get('date') || '';

    let sql = `
      SELECT s.*, u.name as coach_name, c.id as coach_table_id
      FROM schedules s
      LEFT JOIN coaches c ON s.coach_id = c.id
      LEFT JOIN users u ON c.user_id = u.id
      WHERE s.tenant_id = ?
    `;
    const values: unknown[] = [tenantId];

    if (date) {
      sql += ' AND s.date = ?';
      values.push(date);
    }

    sql += ' ORDER BY s.date ASC, s.start_time ASC LIMIT 50';
    const schedules = await query(sql, values);

    return NextResponse.json({ success: true, data: schedules });
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
    const { title, type, age_group, coach_id, date, start_time, end_time, location, notes } = body;

    if (!title || !date || !start_time || !end_time) {
      return NextResponse.json({ success: false, error: 'Judul, tanggal, dan waktu wajib diisi' }, { status: 400 });
    }

    await query(
      `INSERT INTO schedules (tenant_id, title, type, age_group, coach_id, date, start_time, end_time, location, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, title, type || 'training', age_group || '', coach_id || null, date, start_time, end_time, location || '', notes || ''],
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
