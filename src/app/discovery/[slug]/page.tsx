'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { StatCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface AcademyProfile {
  id: number; name: string; slug: string; sport_type: string;
  address: string; phone: string; email: string;
  subscription_tier: string; studentCount: number; coachCount: number;
}

export default function AcademyProfilePage() {
  const { slug } = useParams() as { slug: string };
  const [academy, setAcademy] = useState<AcademyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/tenants/${slug}`);
        const data = await res.json();
        if (data.success) setAcademy(data.data);
      } catch { /* ignore */ } finally { setLoading(false); }
    }
    fetchData();
  }, [slug]);

  if (loading) return <div className="max-w-fluid-md mx-auto px-4 pt-24"><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></div>;
  if (!academy) return <EmptyState title="Akademi tidak ditemukan" action={<Link href="/discovery" className="btn-primary">Kembali</Link>} />;

  return (
    <div className="min-h-screen bg-canvas">
      <section className="max-w-fluid-md mx-auto px-4 pt-24 pb-20">
        <Link href="/discovery" className="btn-ghost text-sm mb-6 inline-block">← Kembali ke Pencarian</Link>

        <div className="card-hover p-8">
          <h1 className="font-playfair italic text-3xl md:text-4xl text-white mb-2">{academy.name}</h1>
          <p className="text-accent capitalize text-sm mb-4">{academy.sport_type.replace('_', ' ')}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Siswa', value: String(academy.studentCount || 0) },
              { label: 'Pelatih', value: String(academy.coachCount || 0) },
              { label: 'Paket', value: academy.subscription_tier, capitalize: true },
            ].map((c) => (
              <div key={c.label} className="bg-canvas rounded-lg p-4 border border-border text-center">
                <p className="text-text-secondary text-xs uppercase mb-1">{c.label}</p>
                <p className="text-white font-bold text-xl capitalize">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3 mb-8 text-sm">
            {academy.address && <p className="text-text-secondary">📍 {academy.address}</p>}
            {academy.phone && <p className="text-text-secondary">📞 {academy.phone}</p>}
            {academy.email && <p className="text-text-secondary">✉️ {academy.email}</p>}
          </div>

          <Link href={`/auth/register?ref=${academy.slug}`} className="btn-primary text-center block">
            Daftar di {academy.name}
          </Link>
        </div>
      </section>
    </div>
  );
}
