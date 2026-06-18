import { getServerSession } from 'next-auth/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { authOptions, getSessionUser } from '@/lib/auth';
import { UserRole } from '@/types';

export interface AuthContext {
  userId: number;
  tenantId: number | null;
  role: UserRole;
}

/**
 * NextAuth App Router compatible auth helper.
 * Call like: await getAuthContext() in API route handlers.
 */
export async function getAuthContext(allowedRoles?: UserRole[]): Promise<AuthContext> {
  // For App Router API routes, use the headers-based approach
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await getServerSession(authOptions as any);
  const user = getSessionUser(session);

  if (!user) {
    throw new AuthError('Authentication required', 401);
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new AuthError('Insufficient permissions', 403);
  }

  return {
    userId: user.id,
    tenantId: user.tenant_id,
    role: user.role,
  };
}

/**
 * For Pages Router compatibility.
 */
export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  allowedRoles?: UserRole[],
): Promise<AuthContext> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await getServerSession(req as any, res as any, authOptions as any);
  const user = getSessionUser(session);

  if (!user) {
    throw new AuthError('Authentication required', 401);
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new AuthError('Insufficient permissions', 403);
  }

  return {
    userId: user.id,
    tenantId: user.tenant_id,
    role: user.role,
  };
}

export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AuthError';
  }
}
