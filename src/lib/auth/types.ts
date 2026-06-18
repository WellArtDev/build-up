import { RowDataPacket } from 'mysql2';
import { UserRole } from '@/types';

export interface SessionUser {
  id: number;
  tenant_id: number | null;
  email: string;
  name: string;
  role: UserRole;
  avatar: string | null;
}

export interface AuthUser extends RowDataPacket {
  id: number;
  tenant_id: number | null;
  email: string;
  password_hash: string;
  name: string;
  role: UserRole;
  phone: string;
  avatar: string | null;
  is_active: boolean;
}
