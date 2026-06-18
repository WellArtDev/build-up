import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
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
    const type = url.searchParams.get('type') || '';
    const status = url.searchParams.get('status') || '';

    let sql = `
      SELECT ft.*, s.name as student_name
      FROM financial_transactions ft
      LEFT JOIN students s ON ft.student_id = s.id
      WHERE ft.tenant_id = ?`;
    const values: unknown[] = [tenantId];

    if (type) { sql += ' AND ft.type = ?'; values.push(type); }
    if (status) { sql += ' AND ft.status = ?'; values.push(status); }

    sql += ' ORDER BY ft.created_at DESC LIMIT 100';

    const [transactions, summary] = await Promise.all([
      query(sql, values),
      queryOne<{ total: number; paid: number; pending: number; overdue: number }>(
        `SELECT
          COALESCE(SUM(amount), 0) as total,
          COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paid,
          COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending,
          COALESCE(SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END), 0) as overdue
        FROM financial_transactions WHERE tenant_id = ?`,
        [tenantId],
      ),
    ]);

    return NextResponse.json({ success: true, data: transactions, summary });
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
    const { student_id, type, amount, description, category, payment_method, due_date } = body;

    if (!type || !amount) {
      return NextResponse.json({ success: false, error: 'Tipe dan jumlah wajib diisi' }, { status: 400 });
    }

    const count = await queryOne<{ c: number }>(
      'SELECT COUNT(*) as c FROM financial_transactions WHERE tenant_id = ?',
      [tenantId],
    );
    const invoice = `INV-${String(tenantId).padStart(3, '0')}-${String((count?.c || 0) + 1).padStart(4, '0')}`;

    await query(
      `INSERT INTO financial_transactions (tenant_id, student_id, type, amount, description, category, payment_method, status, due_date, invoice_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [tenantId, student_id || null, type, amount, description || '', category || '', payment_method || '', due_date || null, invoice],
    );

    return NextResponse.json({ success: true, data: { invoice_number: invoice } });
  } catch (err) {
    return handleApiError(err);
  }
}
