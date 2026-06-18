import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { getAuthContext } from '@/lib/auth/middleware';
import { validateTenantAccess } from '@/lib/api/validateTenant';
import { handleApiError } from '@/lib/api/handleError';

// PATCH — save landing page content & settings
export async function PATCH(
  req: NextRequest,
  routeParams: { params: { tenantId: string } },
) {
  try {
    const ctx = await getAuthContext(['academy_owner', 'academy_admin']);
    const tenantId = parseInt(routeParams.params.tenantId, 10);
    await validateTenantAccess(tenantId, ctx.userId, ctx.role);

    const body = await req.json();
    const { landing_content, landing_theme } = body;

    // Get current settings
    const tenant = await queryOne<{ settings: string }>(
      'SELECT CAST(settings AS CHAR) as settings FROM tenants WHERE id = ?',
      [tenantId],
    );

    const current = tenant?.settings ? JSON.parse(tenant.settings) : {};

    // Merge landing settings
    const updated = {
      ...current,
      landing_content: landing_content ? { ...(current.landing_content || {}), ...landing_content } : current.landing_content,
      landing_theme: landing_theme || current.landing_theme || 'dark',
    };

    await queryOne(
      'UPDATE tenants SET settings = ? WHERE id = ?',
      [JSON.stringify(updated), tenantId],
    );

    return NextResponse.json({ success: true, data: { settings: updated } });
  } catch (err) {
    return handleApiError(err);
  }
}
