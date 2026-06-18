import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { getAuthContext } from '@/lib/auth/middleware';
import { validateTenantAccess } from '@/lib/api/validateTenant';
import { handleApiError } from '@/lib/api/handleError';

export async function PATCH(
  req: NextRequest,
  routeParams: { params: { tenantId: string; studentId: string } },
) {
  try {
    const ctx = await getAuthContext(['academy_owner', 'academy_admin']);
    const tenantId = parseInt(routeParams.params.tenantId, 10);
    const studentId = parseInt(routeParams.params.studentId, 10);
    await validateTenantAccess(tenantId, ctx.userId, ctx.role);

    const body = await req.json();
    const allowed = ['name', 'nik', 'nisn', 'date_of_birth', 'gender', 'position', 'address', 'parent_contact', 'parent_email', 'previous_clubs', 'age_group', 'status'];
    const sets: string[] = [];
    const vals: unknown[] = [];

    for (const [k, v] of Object.entries(body)) {
      if (allowed.includes(k)) { sets.push(`${k} = ?`); vals.push(v); }
    }
    if (sets.length === 0) return NextResponse.json({ success: false, error: 'No fields' }, { status: 400 });

    vals.push(studentId, tenantId);
    await queryOne(`UPDATE students SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`, vals);

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
