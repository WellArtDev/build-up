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
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const ageGroup = url.searchParams.get('age_group') || '';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM students WHERE tenant_id = ?';
    const values: unknown[] = [tenantId];

    if (search) {
      sql += ' AND (name LIKE ? OR student_code LIKE ? OR nik LIKE ?)';
      values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      sql += ' AND status = ?';
      values.push(status);
    }
    if (ageGroup) {
      sql += ' AND age_group = ?';
      values.push(ageGroup);
    }

    const countResult = await query<{ total: number }[]>(
      `SELECT COUNT(*) as total FROM (${sql}) AS filtered`,
      values,
    );

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    values.push(limit, offset);

    const students = await query(sql, values);

    return NextResponse.json({
      success: true,
      data: students,
      meta: { total: countResult[0]?.total || 0, page, limit },
    });
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
    const { name, nik, nisn, date_of_birth, gender, position, address, parent_contact, parent_email, age_group } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Nama wajib diisi' }, { status: 400 });
    }

    const lastStudent = await queryOne<{ student_code: string }>(
      'SELECT student_code FROM students WHERE tenant_id = ? ORDER BY id DESC LIMIT 1',
      [tenantId],
    );
    const lastNum = lastStudent
      ? parseInt(lastStudent.student_code.slice(-3), 10) || 0
      : 0;
    const code = `SSB${String(tenantId).padStart(3, '0')}${String(lastNum + 1).padStart(3, '0')}`;

    const result = await query(
      `INSERT INTO students (tenant_id, student_code, name, nik, nisn, date_of_birth, gender, position, address, parent_contact, parent_email, age_group, enrollment_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
      [tenantId, code, name, nik || '', nisn || '', date_of_birth || null, gender || 'male', position || '', address || '', parent_contact || '', parent_email || '', age_group || ''],
    );

    return NextResponse.json({
      success: true,
      data: { id: (result as { insertId: number }).insertId, student_code: code },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
