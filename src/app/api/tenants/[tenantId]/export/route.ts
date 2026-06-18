import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthContext } from '@/lib/auth/middleware';
import { validateTenantAccess } from '@/lib/api/validateTenant';
import { handleApiError } from '@/lib/api/handleError';

/**
 * GET /api/tenants/[id]/export?type=students|assessments|finances
 * Exports data as CSV (Content-Type: text/csv)
 */
export async function GET(
  req: NextRequest,
  routeParams: { params: { tenantId: string } },
) {
  try {
    const ctx = await getAuthContext(['academy_owner', 'academy_admin']);
    const tenantId = parseInt(routeParams.params.tenantId, 10);
    await validateTenantAccess(tenantId, ctx.userId, ctx.role);

    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'students';

    let rows: Record<string, unknown>[] = [];

    switch (type) {
      case 'students':
        rows = await query('SELECT * FROM students WHERE tenant_id = ? ORDER BY name', [tenantId]);
        break;
      case 'assessments':
        rows = await query(
          `SELECT a.*, s.name as student_name FROM assessments a JOIN students s ON a.student_id = s.id WHERE a.tenant_id = ? ORDER BY a.assessment_date DESC`,
          [tenantId],
        );
        break;
      case 'finances':
        rows = await query(
          `SELECT ft.*, s.name as student_name FROM financial_transactions ft LEFT JOIN students s ON ft.student_id = s.id WHERE ft.tenant_id = ? ORDER BY ft.created_at DESC`,
          [tenantId],
        );
        break;
      default:
        return NextResponse.json({ success: false, error: 'Unknown export type' }, { status: 400 });
    }

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'No data to export' }, { status: 404 });
    }

    // Convert to CSV
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${type}_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
