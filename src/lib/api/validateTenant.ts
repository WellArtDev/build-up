import { queryOne } from '@/lib/db';
import { AuthError } from '@/lib/auth/middleware';

/**
 * Ensure tenant exists and user has access.
 * Returns tenant data. Throws AuthError if not found or no access.
 */
export async function validateTenantAccess(
  tenantId: number,
  userId: number,
  userRole: string,
) {
  // Super admin bypasses tenant isolation
  if (userRole === 'super_admin') {
    const tenant = await queryOne<{ id: number; name: string; slug: string }>(
      'SELECT id, name, slug FROM tenants WHERE id = ?',
      [tenantId],
    );
    if (!tenant) throw new AuthError('Tenant tidak ditemukan', 404);
    return tenant;
  }

  // Regular users must belong to this tenant
  const tenant = await queryOne<{ id: number; name: string; slug: string }>(
    'SELECT id, name, slug FROM tenants WHERE id = ?',
    [tenantId],
  );

  if (!tenant) throw new AuthError('Tenant tidak ditemukan', 404);

  const user = await queryOne<{ tenant_id: number }>(
    'SELECT tenant_id FROM users WHERE id = ?',
    [userId],
  );

  if (!user || user.tenant_id !== tenantId) {
    throw new AuthError('Akses ke tenant ini ditolak', 403);
  }

  return tenant;
}
