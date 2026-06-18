'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { StatCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { TenantSubNav } from '@/components/layout/TenantSubNav';

interface TenantDashboard {
  id: number;
  name: string;
  slug: string;
  studentCount: number;
  coachCount: number;
  activeStudents: number;
  monthlyRevenue: number;
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card-hover">
      <p className="text-text-secondary text-xs font-outfit tracking-wide uppercase mb-2">{label}</p>
      <p className="font-outfit font-bold text-3xl text-white mb-1">{value}</p>
      {sub && <p className="text-text-secondary/60 text-xs">{sub}</p>}
    </div>
  );
}

export default function TenantDashboardPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;
  const [data, setData] = useState<TenantDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/tenants/${tenantId}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error || 'Gagal memuat data');
        }
      } catch {
        setError('Gagal terhubung ke server');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [tenantId]);

  if (loading) {
    return (
      <div>
        <h1 className="font-playfair italic text-3xl text-white mb-8">Dasbor Akademi</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        }
        title="Gagal Memuat Data"
        description={error || 'Data tenant tidak ditemukan'}
        action={
          <button onClick={() => window.location.reload()} className="btn-secondary text-sm">
            Coba Lagi
          </button>
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-playfair italic text-3xl text-white mb-1">{data.name}</h1>
        <p className="text-text-secondary text-sm">Dasbor Akademi — Overview</p>
      </div>

      <TenantSubNav tenantId={tenantId} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Siswa" value={String(data.studentCount)} sub={`${data.activeStudents} aktif`} />
        <StatCard label="Pelatih" value={String(data.coachCount)} />
        <StatCard label="Siswa Aktif" value={String(data.activeStudents)} sub={`${Math.round((data.activeStudents / Math.max(data.studentCount, 1)) * 100)}% dari total`} />
        <StatCard label="Pendapatan Bulanan" value={`Rp ${(data.monthlyRevenue / 1000000).toFixed(1)}jt`} sub="Lihat detail keuangan" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-outfit font-semibold text-white mb-4">Menu Cepat</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="btn-secondary text-sm py-2.5">👥 Daftar Siswa</button>
            <button className="btn-secondary text-sm py-2.5">📋 Jadwal</button>
            <button className="btn-secondary text-sm py-2.5">📊 Penilaian</button>
            <button className="btn-secondary text-sm py-2.5">💰 Keuangan</button>
          </div>
        </div>

        <div className="card">
          <h3 className="font-outfit font-semibold text-white mb-4">Aktivitas Terbaru</h3>
          <EmptyState
            title="Belum ada aktivitas"
            description="Aktivitas akademi akan muncul di sini"
          />
        </div>
      </div>
    </div>
  );
}
