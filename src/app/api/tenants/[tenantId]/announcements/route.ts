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
      `SELECT a.*, u.name as created_by_name
       FROM announcements a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.tenant_id = ?
       ORDER BY a.priority = 'urgent' DESC, a.priority = 'high' DESC, a.created_at DESC
       LIMIT 50`,
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
    const { title, content, target_audience, priority } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Judul dan konten wajib diisi' }, { status: 400 });
    }

    await query(
      `INSERT INTO announcements (tenant_id, title, content, target_audience, priority, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [tenantId, title, content, target_audience || 'all', priority || 'normal', ctx.userId],
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
