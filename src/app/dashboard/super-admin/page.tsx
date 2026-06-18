'use client';

import { useState, useEffect } from 'react';
import { StatCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  totalStudents: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  avgStudentsPerTenant: number;
  systemHealth: 'healthy' | 'degraded' | 'down';
}

function StatCard({ label, value, sub, trend }: {
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down';
}) {
  return (
    <div className="card-hover">
      <p className="text-text-secondary text-xs font-outfit tracking-wide uppercase mb-2">{label}</p>
      <p className="font-outfit font-bold text-3xl text-white mb-1">{value}</p>
      <div className="flex items-center gap-2">
        {trend && (
          <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? '↑' : '↓'}
          </span>
        )}
        {sub && <p className="text-text-secondary/60 text-xs">{sub}</p>}
      </div>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        } else {
          setError(data.error || 'Gagal memuat data');
        }
      } catch {
        setError('Gagal terhubung ke server');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="font-playfair italic text-3xl text-white mb-8">Dasbor Super Admin</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        }
        title="Gagal Memuat Data"
        description={error}
        action={
          <button onClick={() => window.location.reload()} className="btn-secondary text-sm">
            Coba Lagi
          </button>
        }
      />
    );
  }

  if (!stats) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair italic text-3xl text-white mb-1">Dasbor Super Admin</h1>
          <p className="text-text-secondary text-sm">Overview seluruh akademi di platform</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${
            stats.systemHealth === 'healthy' ? 'bg-green-400' :
            stats.systemHealth === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
          }`} />
          <span className="text-text-secondary text-sm capitalize">{stats.systemHealth}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Tenant"
          value={String(stats.totalTenants)}
          sub={`${stats.trialTenants} dalam masa trial`}
        />
        <StatCard
          label="Tenant Aktif"
          value={String(stats.activeTenants)}
          trend="up"
          sub={`${Math.round((stats.activeTenants / Math.max(stats.totalTenants, 1)) * 100)}% dari total`}
        />
        <StatCard
          label="Total Siswa"
          value={String(stats.totalStudents)}
          sub={`Rata-rata ${stats.avgStudentsPerTenant} per tenant`}
        />
        <StatCard
          label="Pendapatan Bulanan"
          value={`Rp ${(stats.monthlyRevenue / 1000000).toFixed(1)}jt`}
          trend={stats.revenueGrowth >= 0 ? 'up' : 'down'}
          sub={`${stats.revenueGrowth >= 0 ? '+' : ''}${stats.revenueGrowth}% dari bulan lalu`}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-outfit font-semibold text-white mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="btn-secondary text-sm py-2.5">+ Tambah Tenant</button>
            <button className="btn-secondary text-sm py-2.5">Lihat Semua Tenant</button>
            <button className="btn-secondary text-sm py-2.5">Laporan Keuangan</button>
            <button className="btn-secondary text-sm py-2.5">Pengaturan Sistem</button>
          </div>
        </div>

        <div className="card">
          <h3 className="font-outfit font-semibold text-white mb-4">Status Sistem</h3>
          <div className="space-y-3">
            {[
              { label: 'Database', ok: true },
              { label: 'File Storage', ok: true },
              { label: 'WhatsApp Gateway', ok: true },
              { label: 'Payment Gateway', ok: false },
            ].map((svc) => (
              <div key={svc.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-text-secondary text-sm">{svc.label}</span>
                <span className={`badge ${svc.ok ? 'badge-success' : 'badge-danger'}`}>
                  {svc.ok ? 'Online' : 'Offline'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
