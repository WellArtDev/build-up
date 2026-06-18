'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { UserRole } from '@/types';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const ICON_DASBOR = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);

const ICON_TENANT = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ICON_SISWA = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ICON_COACH = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    <path d="M17 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ICON_PENILAIAN = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const ICON_JADWAL = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ICON_KEUANGAN = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const ICON_PENGATURAN = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const ICON_PARENT = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

function getNavItems(role: UserRole, tenantId: number | null): NavItem[] {
  const tid = tenantId || 0;

  const items: Record<UserRole, NavItem[]> = {
    super_admin: [
      { href: '/dashboard/super-admin', label: 'Dasbor', icon: ICON_DASBOR, roles: ['super_admin'] },
      { href: '/dashboard/super-admin/tenants', label: 'Tenant', icon: ICON_TENANT, roles: ['super_admin'] },
      { href: '/dashboard/super-admin/billing', label: 'Keuangan', icon: ICON_KEUANGAN, roles: ['super_admin'] },
      { href: '/dashboard/super-admin/payments', label: 'Payment Gateway', icon: ICON_KEUANGAN, roles: ['super_admin'] },
      { href: '/dashboard/super-admin/database', label: 'Database', icon: ICON_PENGATURAN, roles: ['super_admin'] },
      { href: '/dashboard/super-admin/pricing', label: 'Harga & Fitur', icon: ICON_JADWAL, roles: ['super_admin'] },
      { href: '/dashboard/super-admin/settings', label: 'Pengaturan', icon: ICON_PENGATURAN, roles: ['super_admin'] },
    ],
    academy_owner: [
      { href: `/dashboard/tenants/${tid}`, label: 'Dasbor', icon: ICON_DASBOR, roles: ['academy_owner', 'academy_admin'] },
      { href: `/dashboard/tenants/${tid}/students`, label: 'Siswa', icon: ICON_SISWA, roles: ['academy_owner', 'academy_admin'] },
      { href: `/dashboard/tenants/${tid}/coaches`, label: 'Pelatih', icon: ICON_COACH, roles: ['academy_owner', 'academy_admin'] },
      { href: `/dashboard/tenants/${tid}/schedules`, label: 'Jadwal & Absensi', icon: ICON_JADWAL, roles: ['academy_owner', 'academy_admin'] },
      { href: `/dashboard/tenants/${tid}/assessments`, label: 'Penilaian', icon: ICON_PENILAIAN, roles: ['academy_owner', 'academy_admin'] },
      { href: `/dashboard/tenants/${tid}/finances`, label: 'Keuangan', icon: ICON_KEUANGAN, roles: ['academy_owner', 'academy_admin'] },
      { href: `/dashboard/tenants/${tid}/announcements`, label: 'Pengumuman', icon: ICON_PENILAIAN, roles: ['academy_owner', 'academy_admin'] },
      { href: `/dashboard/tenants/${tid}/tournaments`, label: 'Turnamen', icon: ICON_JADWAL, roles: ['academy_owner', 'academy_admin'] },
      { href: `/dashboard/tenants/${tid}/achievements`, label: 'Prestasi', icon: ICON_COACH, roles: ['academy_owner', 'academy_admin'] },
      { href: `/dashboard/tenants/${tid}/reports`, label: 'Laporan', icon: ICON_PENILAIAN, roles: ['academy_owner', 'academy_admin'] },
      { href: `/dashboard/tenants/${tid}/landing`, label: 'Landing Page', icon: ICON_COACH, roles: ['academy_owner', 'academy_admin'] },
      { href: '/dashboard/settings', label: 'Pengaturan', icon: ICON_PENGATURAN, roles: ['academy_owner', 'academy_admin'] },
    ],
    academy_admin: [
      { href: `/dashboard/tenants/${tid}`, label: 'Dasbor', icon: ICON_DASBOR, roles: ['academy_owner', 'academy_admin'] },
      { href: `/dashboard/tenants/${tid}/students`, label: 'Siswa', icon: ICON_SISWA, roles: ['academy_owner', 'academy_admin'] },
      { href: `/dashboard/tenants/${tid}/coaches`, label: 'Pelatih', icon: ICON_COACH, roles: ['academy_owner', 'academy_admin'] },
      { href: `/dashboard/tenants/${tid}/assessments`, label: 'Penilaian', icon: ICON_PENILAIAN, roles: ['academy_owner', 'academy_admin'] },
      { href: `/dashboard/tenants/${tid}/schedules`, label: 'Jadwal', icon: ICON_JADWAL, roles: ['academy_owner', 'academy_admin'] },
      { href: `/dashboard/tenants/${tid}/finances`, label: 'Keuangan', icon: ICON_KEUANGAN, roles: ['academy_owner', 'academy_admin'] },
      { href: `/dashboard/tenants/${tid}/announcements`, label: 'Pengumuman', icon: ICON_PENILAIAN, roles: ['academy_owner', 'academy_admin'] },
      { href: `/dashboard/tenants/${tid}/tournaments`, label: 'Turnamen', icon: ICON_JADWAL, roles: ['academy_owner', 'academy_admin'] },
      { href: `/dashboard/tenants/${tid}/achievements`, label: 'Prestasi', icon: ICON_COACH, roles: ['academy_owner', 'academy_admin'] },
      { href: `/dashboard/tenants/${tid}/reports`, label: 'Laporan', icon: ICON_PENILAIAN, roles: ['academy_owner', 'academy_admin'] },
      { href: `/dashboard/tenants/${tid}/landing`, label: 'Landing Page', icon: ICON_COACH, roles: ['academy_owner', 'academy_admin'] },
      { href: '/dashboard/settings', label: 'Pengaturan', icon: ICON_PENGATURAN, roles: ['academy_owner', 'academy_admin'] },
    ],
    coach: [
      { href: '/dashboard/coach', label: 'Dasbor', icon: ICON_DASBOR, roles: ['coach'] },
      { href: `/dashboard/tenants/${tid}/students`, label: 'Siswa', icon: ICON_SISWA, roles: ['coach'] },
      { href: `/dashboard/tenants/${tid}/schedules`, label: 'Jadwal & Absensi', icon: ICON_JADWAL, roles: ['coach'] },
      { href: `/dashboard/tenants/${tid}/assessments`, label: 'Penilaian', icon: ICON_PENILAIAN, roles: ['coach'] },
    ],
    parent: [
      { href: '/dashboard/parent', label: 'Dasbor', icon: ICON_PARENT, roles: ['parent'] },
      { href: '/dashboard/parent/keuangan', label: 'Keuangan', icon: ICON_KEUANGAN, roles: ['parent'] },
    ],
  };

  return items[role] || [];
}

export function DashboardSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session?.user as any;
  const userRole: UserRole = user?.role || 'academy_owner';
  const userName = user?.name || 'User';
  const userEmail = user?.email || '';
  const tenantId = user?.tenantId as number | null;

  const navItems = getNavItems(userRole, tenantId);

  const isActive = (href: string) => {
    if (href === `/dashboard/tenants/${tenantId}`) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-56'} h-screen fixed left-0 top-0 bg-surface border-r border-border flex flex-col z-40 transition-all duration-200`}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border justify-between">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="font-outfit font-bold text-lg text-white">
              Build<span className="text-accent">Up</span>
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-text-secondary hover:text-white hover:bg-border/30 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {collapsed ? <polyline points="13 17 18 12 13 7" /> : <polyline points="11 17 6 12 11 7" />}
            {collapsed && <line x1="6" y1="12" x2="18" y2="12" />}
          </svg>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-outfit text-sm transition-all ${
                active
                  ? 'bg-accent/10 text-accent font-medium border border-accent/20'
                  : 'text-text-secondary hover:text-white hover:bg-border/20 border border-transparent'
              }`}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User info & logout */}
      <div className="border-t border-border p-3">
        <div className={`flex items-center gap-2.5 mb-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
            <span className="text-accent font-outfit font-bold text-xs">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{userName}</p>
              <p className="text-text-secondary/60 text-[10px] truncate">{userRole}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className={`flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/5 transition-all text-xs ${collapsed ? 'justify-center' : ''}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!collapsed && 'Keluar'}
        </button>
      </div>
    </aside>
  );
}
