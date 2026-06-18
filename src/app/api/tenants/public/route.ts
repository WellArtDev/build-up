import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sanitizeString } from '@/lib/security/sanitize';

// Public API — no auth needed, for discovery page
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const search = sanitizeString(url.searchParams.get('search') || '');
    const sport = sanitizeString(url.searchParams.get('sport') || '');
    const location = sanitizeString(url.searchParams.get('location') || '');
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(20, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    const values: unknown[] = [];
    let sql = `
      SELECT t.id, t.name, t.slug, t.sport_type, t.address, t.subscription_tier,
        (SELECT COUNT(*) FROM students WHERE tenant_id = t.id AND status = 'active') as student_count,
        (SELECT COUNT(*) FROM coaches WHERE tenant_id = t.id) as coach_count
      FROM tenants t
      WHERE t.subscription_status IN ('trial', 'active')`;

    if (search) {
      sql += ' AND (t.name LIKE ? OR t.slug LIKE ?)';
      values.push(`%${search}%`, `%${search}%`);
    }
    if (sport) {
      sql += ' AND t.sport_type = ?';
      values.push(sport);
    }
    if (location) {
      sql += ' AND t.address LIKE ?';
      values.push(`%${location}%`);
    }

    const countResult = await query<{ total: number }[]>(
      `SELECT COUNT(*) as total FROM (${sql}) AS filtered`,
      values,
    );

    sql += ' ORDER BY t.subscription_tier = ? DESC, t.created_at DESC LIMIT ? OFFSET ?';
    values.push('enterprise', limit, offset);

    const tenants = await query(sql, values);

    return NextResponse.json({
      success: true,
      data: tenants,
      meta: { total: countResult[0]?.total || 0, page, limit },
    });
  } catch (err) {
    console.error('Discovery API error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
