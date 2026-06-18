'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { TableSkeleton } from '@/components/ui/Skeleton';

interface Tenant {
  id: number; name: string; slug: string; sport_type: string;
  subscription_tier: string; subscription_status: string;
  student_count: number; user_count: number; created_at: string;
}

export default function SuperAdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ limit: '50' });
      if (search) q.set('search', search);
      if (status) q.set('status', status);
      const res = await fetch(`/api/tenants?${q}`);
      const data = await res.json();
      if (data.success) setTenants(data.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [search, status]);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  const statusBadge = (s: string) => ({
    active: 'badge badge-success', trial: 'badge badge-info',
    suspended: 'badge badge-danger', cancelled: 'badge badge-warning',
  }[s] || 'badge-info');

  return (
    <div>
      <h1 className="font-playfair italic text-3xl text-white mb-8">Manajemen Tenant</h1>

      <div className="flex gap-3 mb-4">
        <input className="input-field max-w-xs" placeholder="Cari tenant..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input-field max-w-[160px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Semua Status</option>
          <option value="trial">Trial</option>
          <option value="active">Aktif</option>
          <option value="suspended">Suspended</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? <TableSkeleton rows={6} cols={6} /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-text-secondary text-xs uppercase">Nama</th>
                <th className="text-left py-3 px-4 text-text-secondary text-xs uppercase">Olahraga</th>
                <th className="text-left py-3 px-4 text-text-secondary text-xs uppercase">Paket</th>
                <th className="text-left py-3 px-4 text-text-secondary text-xs uppercase">Status</th>
                <th className="text-left py-3 px-4 text-text-secondary text-xs uppercase">Siswa</th>
                <th className="text-left py-3 px-4 text-text-secondary text-xs uppercase">Terdaftar</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-accent/5">
                  <td className="py-3 px-4">
                    <Link href={`/dashboard/tenants/${t.id}`} className="text-white font-medium hover:text-accent">{t.name}</Link>
                    <p className="text-text-secondary/60 text-xs">{t.slug}</p>
                  </td>
                  <td className="py-3 px-4 text-text-secondary text-xs capitalize">{t.sport_type.replace('_', ' ')}</td>
                  <td className="py-3 px-4 text-text-secondary text-xs capitalize">{t.subscription_tier}</td>
                  <td className="py-3 px-4"><span className={statusBadge(t.subscription_status)}>{t.subscription_status}</span></td>
                  <td className="py-3 px-4 text-text-secondary text-xs">{t.student_count}</td>
                  <td className="py-3 px-4 text-text-secondary text-xs">{new Date(t.created_at).toLocaleDateString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
