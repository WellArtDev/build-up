import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { queryOne } from '@/lib/db';
import { AuthUser, SessionUser } from './types';
import { UserRole } from '@/types';

export const authOptions: NextAuthOptions = {
  providers: [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password wajib diisi');
        }

        const user = await queryOne<AuthUser>(
          'SELECT id, tenant_id, email, password_hash, name, role, phone, avatar, is_active FROM users WHERE email = ?',
          [credentials.email],
        );

        if (!user) {
          throw new Error('Email atau password salah');
        }

        if (!user.is_active) {
          throw new Error('Akun tidak aktif. Hubungi administrator.');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!isValid) {
          throw new Error('Email atau password salah');
        }

        return {
          id: String(user.id),
          tenantId: user.tenant_id ?? null,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        };
      },
    }) as never,
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.tenantId = user.tenantId ?? null;
        token.role = user.role ?? '';
        token.name = user.name ?? '';
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      session.user = {
        ...session.user,
        id: Number(token.id),
        tenantId: token.tenantId ?? null,
        role: token.role,
      };
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export function getSessionUser(session: unknown): SessionUser | null {
  if (!session) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = session as any;
  if (!s?.user) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = s.user;
  return {
    id: user.id as number,
    tenant_id: user.tenantId as number | null,
    email: user.email as string,
    name: user.name as string,
    role: user.role as UserRole,
    avatar: user.avatar as string | null,
  };
}
