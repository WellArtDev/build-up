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
    const studentId = url.searchParams.get('student_id');

    let sql = `
      SELECT a.*, s.name as student_name, u.name as coach_name
      FROM assessments a
      JOIN students s ON a.student_id = s.id
      LEFT JOIN coaches c ON a.coach_id = c.id
      LEFT JOIN users u ON c.user_id = u.id
      WHERE a.tenant_id = ?`;
    const values: unknown[] = [tenantId];

    if (studentId) {
      sql += ' AND a.student_id = ?';
      values.push(studentId);
    }

    sql += ' ORDER BY a.assessment_date DESC LIMIT 50';

    const assessments = await query(sql, values);
    return NextResponse.json({ success: true, data: assessments });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(
  req: NextRequest,
  routeParams: { params: { tenantId: string } },
) {
  try {
    const ctx = await getAuthContext(['academy_owner', 'academy_admin', 'coach']);
    const tenantId = parseInt(routeParams.params.tenantId, 10);
    await validateTenantAccess(tenantId, ctx.userId, ctx.role);

    const body = await req.json();
    const {
      student_id, assessment_date, assessment_period,
      technical_first_touch, technical_passing, technical_dribbling, technical_shooting,
      tactical_positioning, tactical_decision_making,
      physical_stamina, physical_speed_agility, physical_strength,
      mental_discipline, mental_teamwork, mental_fighting_spirit,
      coach_notes,
    } = body;

    if (!student_id || !assessment_date) {
      return NextResponse.json({ success: false, error: 'Siswa dan tanggal wajib diisi' }, { status: 400 });
    }

    // Get coach_id from user
    const coach = await queryOne<{ id: number }>(
      'SELECT id FROM coaches WHERE tenant_id = ? AND user_id = ?',
      [tenantId, ctx.userId],
    );

    const result = await query(
      `INSERT INTO assessments (tenant_id, student_id, coach_id, assessment_date, assessment_period,
       technical_first_touch, technical_passing, technical_dribbling, technical_shooting,
       tactical_positioning, tactical_decision_making,
       physical_stamina, physical_speed_agility, physical_strength,
       mental_discipline, mental_teamwork, mental_fighting_spirit,
       coach_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tenantId, student_id, coach?.id || 1, assessment_date, assessment_period || '',
        technical_first_touch, technical_passing, technical_dribbling, technical_shooting,
        tactical_positioning, tactical_decision_making,
        physical_stamina, physical_speed_agility, physical_strength,
        mental_discipline, mental_teamwork, mental_fighting_spirit,
        coach_notes || '',
      ],
    );

    return NextResponse.json({
      success: true,
      data: { id: (result as { insertId: number }).insertId },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
