'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export function TenantSubNav({ tenantId }: { tenantId: string }) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: `/dashboard/tenants/${tenantId}`, label: 'Dasbor', icon: '📊' },
    { href: `/dashboard/tenants/${tenantId}/students`, label: 'Siswa', icon: '👥' },
    { href: `/dashboard/tenants/${tenantId}/coaches`, label: 'Pelatih', icon: '🧑‍🏫' },
    { href: `/dashboard/tenants/${tenantId}/assessments`, label: 'Penilaian', icon: '📋' },
    { href: `/dashboard/tenants/${tenantId}/schedules`, label: 'Jadwal', icon: '📅' },
    { href: `/dashboard/tenants/${tenantId}/finances`, label: 'Keuangan', icon: '💰' },
    { href: '/dashboard/settings', label: 'Pengaturan', icon: '⚙️' },
  ];

  return (
    <nav className="flex flex-wrap gap-1 mb-6">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== `/dashboard/tenants/${tenantId}` && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-outfit transition-all ${
              isActive
                ? 'bg-accent/10 text-accent border border-accent/30 font-medium'
                : 'text-text-secondary hover:text-white hover:bg-surface border border-transparent'
            }`}
          >
            <span className="text-xs">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
