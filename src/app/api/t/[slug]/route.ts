import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';

// Public API — no auth needed
export async function GET(
  _req: NextRequest,
  routeParams: { params: { slug: string } },
) {
  try {
    const slug = routeParams.params.slug;

    const tenant = await queryOne<{
      id: number; name: string; slug: string; sport_type: string;
      address: string; phone: string; email: string;
      subscription_tier: string; subscription_status: string;
      settings: string;
    }>(
      `SELECT id, name, slug, sport_type, address, phone, email, subscription_tier, subscription_status, CAST(settings AS CHAR) as settings
       FROM tenants WHERE slug = ? AND subscription_status IN ('trial', 'active')`,
      [slug],
    );

    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Akademi tidak ditemukan' }, { status: 404 });
    }

    const settings = typeof tenant.settings === 'string' ? JSON.parse(tenant.settings) : (tenant.settings || {});

    const [studentCount, coachCount, achievements, tournaments, announcements] = await Promise.all([
      queryOne<{ c: number }>('SELECT COUNT(*) as c FROM students WHERE tenant_id = ? AND status = ?', [tenant.id, 'active']),
      queryOne<{ c: number }>('SELECT COUNT(*) as c FROM coaches WHERE tenant_id = ?', [tenant.id]),
      query('SELECT title, description, rank_position, date_achieved FROM achievements WHERE tenant_id = ? ORDER BY date_achieved DESC LIMIT 6', [tenant.id]),
      query('SELECT name, start_date, end_date, status FROM tournaments WHERE tenant_id = ? ORDER BY start_date DESC LIMIT 6', [tenant.id]),
      query('SELECT title, content, created_at FROM announcements WHERE tenant_id = ? AND target_audience IN (?, ?) ORDER BY created_at DESC LIMIT 3', [tenant.id, 'all', 'students']),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...tenant,
        settings: settings,
        studentCount: studentCount?.c || 0,
        coachCount: coachCount?.c || 0,
        achievements,
        tournaments,
        announcements,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
