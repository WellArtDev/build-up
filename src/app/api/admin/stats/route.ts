import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { getAuthContext } from '@/lib/auth/middleware';

export async function GET() {
  try {
    await getAuthContext(['super_admin']);

    const [totalTenants, activeTenants, trialTenants] = await Promise.all([
      queryOne<{ count: number }>('SELECT COUNT(*) as count FROM tenants'),
      queryOne<{ count: number }>(
        'SELECT COUNT(*) as count FROM tenants WHERE subscription_status = ?',
        ['active'],
      ),
      queryOne<{ count: number }>(
        'SELECT COUNT(*) as count FROM tenants WHERE subscription_status = ?',
        ['trial'],
      ),
    ]);

    const [totalStudents, monthlyRevenue, tenantCount] = await Promise.all([
      queryOne<{ count: number }>('SELECT COUNT(*) as count FROM students'),
      queryOne<{ sum: number }>(
        `SELECT COALESCE(SUM(amount), 0) as sum FROM financial_transactions
         WHERE type IN ('income', 'spp_payment')
         AND status = 'paid'
         AND MONTH(paid_date) = MONTH(CURRENT_DATE())
         AND YEAR(paid_date) = YEAR(CURRENT_DATE())`,
      ),
      queryOne<{ count: number }>('SELECT COUNT(*) as count FROM tenants'),
    ]);

    const avgStudents = tenantCount?.count && tenantCount.count > 0
      ? Math.round((totalStudents?.count || 0) / tenantCount.count)
      : 0;

    // Last month revenue for growth calc
    const lastMonth = await queryOne<{ sum: number }>(
      `SELECT COALESCE(SUM(amount), 0) as sum FROM financial_transactions
       WHERE type IN ('income', 'spp_payment')
       AND status = 'paid'
       AND MONTH(paid_date) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
       AND YEAR(paid_date) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))`,
    );

    const thisMonth = monthlyRevenue?.sum || 0;
    const prevMonth = lastMonth?.sum || 0;
    const revenueGrowth = prevMonth > 0
      ? Math.round(((thisMonth - prevMonth) / prevMonth) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalTenants: totalTenants?.count || 0,
        activeTenants: activeTenants?.count || 0,
        trialTenants: trialTenants?.count || 0,
        totalStudents: totalStudents?.count || 0,
        monthlyRevenue: thisMonth,
        revenueGrowth,
        avgStudentsPerTenant: avgStudents,
        systemHealth: 'healthy',
      },
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AuthError') {
      const authErr = err as Error & { statusCode: number };
      return NextResponse.json(
        { success: false, error: authErr.message },
        { status: authErr.statusCode },
      );
    }
    console.error('Admin stats error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
