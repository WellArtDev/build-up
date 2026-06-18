import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthContext } from '@/lib/auth/middleware';
import { validateTenantAccess } from '@/lib/api/validateTenant';
import { handleApiError } from '@/lib/api/handleError';

/**
 * POST /api/tenants/[id]/import — bulk import students from CSV
 */
export async function POST(
  req: NextRequest,
  routeParams: { params: { tenantId: string } },
) {
  try {
    const ctx = await getAuthContext(['academy_owner', 'academy_admin']);
    const tenantId = parseInt(routeParams.params.tenantId, 10);
    await validateTenantAccess(tenantId, ctx.userId, ctx.role);

    const body = await req.json();
    const rows: Record<string, string>[] = body.rows || [];

    if (!rows.length) {
      return NextResponse.json({ success: false, error: 'Tidak ada data untuk diimport' }, { status: 400 });
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Get last student_code number
    const last = await queryOne<{ student_code: string }>(
      'SELECT student_code FROM students WHERE tenant_id = ? ORDER BY id DESC LIMIT 1',
      [tenantId],
    );
    let lastNum = last ? parseInt(last.student_code.slice(-3), 10) || 0 : 0;

    for (const row of rows) {
      if (!row.name) {
        skipped++;
        errors.push(`Baris tanpa nama dilewati`);
        continue;
      }

      lastNum++;
      const code = `IMP${String(tenantId).padStart(3, '0')}${String(lastNum).padStart(3, '0')}`;

      try {
        await query(
          `INSERT INTO students (tenant_id, student_code, name, nik, nisn, date_of_birth, gender, position, age_group, address, parent_contact, parent_email, previous_clubs, enrollment_date, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 'active')`,
          [
            tenantId, code, row.name,
            row.nik || '', row.nisn || '',
            row.date_of_birth || null,
            row.gender || 'male',
            row.position || '', row.age_group || '',
            row.address || '', row.parent_contact || '',
            row.parent_email || '', row.previous_clubs || '',
          ],
        );
        imported++;
      } catch {
        skipped++;
        errors.push(`Gagal import: ${row.name}`);
      }
    }

    return NextResponse.json({
      success: true,
      data: { imported, skipped, errors: errors.slice(0, 10) },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
