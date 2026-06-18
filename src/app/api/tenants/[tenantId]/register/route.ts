import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { handleApiError } from '@/lib/api/handleError';

// Public endpoint — no auth required for guest registration
export async function POST(
  req: NextRequest,
  routeParams: { params: { tenantId: string } },
) {
  try {
    const tenantId = parseInt(routeParams.params.tenantId, 10);

    // Verify tenant exists
    const tenant = await queryOne<{ id: number; name: string }>(
      'SELECT id, name FROM tenants WHERE id = ?',
      [tenantId],
    );
    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Akademi tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const { name, nik, nisn, date_of_birth, gender, position, age_group, address,
      parent_contact, parent_email, previous_clubs } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Nama siswa wajib diisi' }, { status: 400 });
    }

    // Generate student_code
    const lastStudent = await queryOne<{ student_code: string }>(
      'SELECT student_code FROM students WHERE tenant_id = ? ORDER BY id DESC LIMIT 1',
      [tenantId],
    );
    const lastNum = lastStudent ? parseInt(lastStudent.student_code.slice(-3), 10) || 0 : 0;
    const code = `REG${String(tenantId).padStart(3, '0')}${String(lastNum + 1).padStart(3, '0')}`;

    await query(
      `INSERT INTO students (tenant_id, student_code, name, nik, nisn, date_of_birth, gender, position, age_group, address, parent_contact, parent_email, previous_clubs, enrollment_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 'active')`,
      [tenantId, code, name, nik || '', nisn || '', date_of_birth || null, gender || 'male',
        position || '', age_group || '', address || '', parent_contact || '', parent_email || '', previous_clubs || ''],
    );

    return NextResponse.json({
      success: true,
      data: { student_code: code, academy_name: tenant.name },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
