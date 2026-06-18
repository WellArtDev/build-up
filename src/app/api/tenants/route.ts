import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthContext } from '@/lib/auth/middleware';
import { handleApiError } from '@/lib/api/handleError';

export async function GET(req: NextRequest) {
  try {
    await getAuthContext(['super_admin']);
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const sport = url.searchParams.get('sport') || '';
    const location = url.searchParams.get('location') || '';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    let sql = `
      SELECT t.*,
        (SELECT COUNT(*) FROM students WHERE tenant_id = t.id) as student_count,
        (SELECT COUNT(*) FROM users WHERE tenant_id = t.id AND is_active = TRUE) as user_count
      FROM tenants t WHERE 1=1`;
    const params: unknown[] = [];

    if (search) {
      sql += ' AND (t.name LIKE ? OR t.slug LIKE ? OR t.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      sql += ' AND t.subscription_status = ?';
      params.push(status);
    }

    if (sport) {
      sql += ' AND t.sport_type = ?';
      params.push(sport);
    }

    if (location) {
      sql += ' AND t.address LIKE ?';
      params.push(`%${location}%`);
    }

    const countResult = await query<{ total: number }[]>(
      `SELECT COUNT(*) as total FROM (${sql}) AS filtered`,
      params,
    );

    sql += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const tenants = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: tenants,
      meta: {
        total: countResult[0]?.total || 0,
        page,
        limit,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
