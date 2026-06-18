import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { getAuthContext } from '@/lib/auth/middleware';
import { validateTenantAccess } from '@/lib/api/validateTenant';
import { handleApiError } from '@/lib/api/handleError';

export async function GET(
  _req: NextRequest,
  { params }: { params: { tenantId: string } },
) {
  try {
    // Allow public requests (no auth) - used by discovery page
    let ctx;
    try {
      ctx = await getAuthContext();
    } catch {
      ctx = null;
    }

    const tenantSlug = params.tenantId;

    // Try as numeric ID first, then as slug
    let tenant;
    const numericId = parseInt(tenantSlug, 10);

    if (!isNaN(numericId)) {
      if (!ctx) return NextResponse.json({ success: false, error: 'Auth required for ID lookup' }, { status: 401 });
      const userId = ctx.userId;
      const role = ctx.role;
      tenant = await validateTenantAccess(numericId, userId, role);
    } else {
      // Public access by slug
      tenant = await queryOne<{ id: number; name: string; slug: string }>(
        'SELECT id, name, slug FROM tenants WHERE slug = ?',
        [tenantSlug],
      );
      if (!tenant) return NextResponse.json({ success: false, error: 'Tenant tidak ditemukan' }, { status: 404 });
    }

    const tenantId = tenant.id;

    // Fetch extended tenant data
    const [
      studentCount,
      coachCount,
      activeStudents,
      monthlyRevenue,
    ] = await Promise.all([
      queryOne<{ count: number }>('SELECT COUNT(*) as count FROM students WHERE tenant_id = ?', [tenantId]),
      queryOne<{ count: number }>('SELECT COUNT(*) as count FROM coaches WHERE tenant_id = ?', [tenantId]),
      queryOne<{ count: number }>('SELECT COUNT(*) as count FROM students WHERE tenant_id = ? AND status = ?', [tenantId, 'active']),
      queryOne<{ sum: number }>(
        `SELECT COALESCE(SUM(amount), 0) as sum FROM financial_transactions
         WHERE tenant_id = ? AND type IN ('income', 'spp_payment')
         AND status = 'paid' AND MONTH(paid_date) = MONTH(CURRENT_DATE())`,
        [tenantId],
      ),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...tenant,
        studentCount: studentCount?.count || 0,
        coachCount: coachCount?.count || 0,
        activeStudents: activeStudents?.count || 0,
        monthlyRevenue: monthlyRevenue?.sum || 0,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { tenantId: string } },
) {
  try {
    const ctx = await getAuthContext(['super_admin', 'academy_owner']);
    const tenantId = parseInt(params.tenantId, 10);
    if (isNaN(tenantId)) {
      return NextResponse.json({ success: false, error: 'Invalid tenant ID' }, { status: 400 });
    }

    await validateTenantAccess(tenantId, ctx.userId, ctx.role);
    const body = await req.json();

    const allowedFields = ['name', 'address', 'phone', 'email', 'settings'];
    const updates: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(key === 'settings' ? JSON.stringify(value) : value);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 });
    }

    values.push(tenantId);
    await query(
      `UPDATE tenants SET ${updates.join(', ')} WHERE id = ?`,
      values,
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
