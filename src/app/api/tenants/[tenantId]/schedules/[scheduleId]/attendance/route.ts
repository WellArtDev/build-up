import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthContext } from '@/lib/auth/middleware';
import { validateTenantAccess } from '@/lib/api/validateTenant';
import { handleApiError } from '@/lib/api/handleError';

export async function GET(
  _req: NextRequest,
  routeParams: { params: { tenantId: string; scheduleId: string } },
) {
  try {
    const ctx = await getAuthContext();
    const tenantId = parseInt(routeParams.params.tenantId, 10);
    const scheduleId = parseInt(routeParams.params.scheduleId, 10);
    await validateTenantAccess(tenantId, ctx.userId, ctx.role);

    const rows = await query(
      `SELECT a.*, s.name as student_name, s.student_code, s.age_group
       FROM attendance a
       JOIN students s ON a.student_id = s.id
       WHERE a.tenant_id = ? AND a.schedule_id = ?
       ORDER BY s.name`,
      [tenantId, scheduleId],
    );

    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(
  req: NextRequest,
  routeParams: { params: { tenantId: string; scheduleId: string } },
) {
  try {
    const ctx = await getAuthContext(['academy_owner', 'academy_admin', 'coach']);
    const tenantId = parseInt(routeParams.params.tenantId, 10);
    const scheduleId = parseInt(routeParams.params.scheduleId, 10);
    await validateTenantAccess(tenantId, ctx.userId, ctx.role);

    const body = await req.json();
    const records: { student_id: number; status: string; notes?: string }[] = body.records || [];

    for (const r of records) {
      await query(
        `INSERT INTO attendance (tenant_id, schedule_id, student_id, status, check_in_time, notes)
         VALUES (?, ?, ?, ?, NOW(), ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status), check_in_time = IF(VALUES(status) = 'present', NOW(), check_in_time), notes = VALUES(notes)`,
        [tenantId, scheduleId, r.student_id, r.status, r.notes || ''],
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
