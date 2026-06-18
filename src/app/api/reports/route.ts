import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthContext } from '@/lib/auth/middleware';
import { handleApiError } from '@/lib/api/handleError';

export async function GET(req: NextRequest) {
  try {
    const ctx = await getAuthContext();
    const url = new URL(req.url);
    const report = url.searchParams.get('report') || ''; // student_progress, financial, attendance
    const tenantIdParam = url.searchParams.get('tenant_id');
    const format = url.searchParams.get('format') || 'json';

    // Validate tenant access
    if (tenantIdParam) {
      const { validateTenantAccess } = await import('@/lib/api/validateTenant');
      await validateTenantAccess(parseInt(tenantIdParam, 10), ctx.userId, ctx.role);
    }

    const tenantId = tenantIdParam ? parseInt(tenantIdParam, 10) : ctx.tenantId;
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'tenant_id required' }, { status: 400 });
    }

    switch (report) {
      case 'student_progress': {
        const studentId = url.searchParams.get('student_id');
        let sql = `
          SELECT a.*, s.name as student_name, s.age_group
          FROM assessments a JOIN students s ON a.student_id = s.id
          WHERE a.tenant_id = ?`;
        const params: unknown[] = [tenantId];
        if (studentId) { sql += ' AND a.student_id = ?'; params.push(studentId); }
        sql += ' ORDER BY a.assessment_date DESC LIMIT 100';
        const data = await query(sql, params);
        return NextResponse.json({ success: true, data, meta: { total: (data as unknown[]).length } });
      }

      case 'financial': {
        const monthlyRevenue = await query(
          `SELECT DATE_FORMAT(paid_date, '%Y-%m') as month, SUM(amount) as total
           FROM financial_transactions
           WHERE tenant_id = ? AND status = 'paid' AND paid_date IS NOT NULL
           GROUP BY month ORDER BY month DESC LIMIT 12`,
          [tenantId],
        );
        const byCategory = await query(
          `SELECT category, SUM(amount) as total, COUNT(*) as count
           FROM financial_transactions WHERE tenant_id = ?
           GROUP BY category ORDER BY total DESC`,
          [tenantId],
        );
        return NextResponse.json({ success: true, data: { monthlyRevenue, byCategory } });
      }

      case 'attendance': {
        const monthly = await query(
          `SELECT DATE_FORMAT(a.created_at, '%Y-%m') as month, a.status, COUNT(*) as count
           FROM attendance a WHERE a.tenant_id = ?
           GROUP BY month, a.status ORDER BY month DESC LIMIT 24`,
          [tenantId],
        );
        return NextResponse.json({ success: true, data: { monthly } });
      }

      default:
        return NextResponse.json({
          success: true,
          data: {
            available: ['student_progress', 'financial', 'attendance'],
            format: format || 'json',
          },
        });
    }
  } catch (err) {
    return handleApiError(err);
  }
}
