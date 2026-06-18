'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface Academy {
  id: number;
  name: string;
  slug: string;
  sport_type: string;
  address: string;
  subscription_tier: string;
}

const SPORT_OPTIONS = [
  { value: '', label: 'Semua Olahraga' },
  { value: 'football', label: 'Sepak Bola' },
  { value: 'basketball', label: 'Basket' },
  { value: 'martial_arts', label: 'Bela Diri' },
  { value: 'swimming', label: 'Renang' },
];

const SPORT_ICONS: Record<string, string> = {
  football: '⚽', basketball: '🏀', martial_arts: '🥋', swimming: '🏊', other: '🏟️',
};

export default function DiscoveryPage() {
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const q = new URLSearchParams();
        if (search) q.set('search', search);
        if (sport) q.set('sport', sport);
        if (location) q.set('location', location);
        q.set('limit', '20');
        const res = await fetch(`/api/tenants?${q}`);
        const data = await res.json();
        if (data.success) setAcademies(data.data);
      } catch { /* ignore */ } finally { setLoading(false); }
    }
    fetchData();
  }, [search, sport, location]);

  return (
    <div className="min-h-screen bg-canvas">
      {/* Hero search */}
      <section className="px-4 pt-24 pb-12 text-center bg-gradient-to-b from-accent/5 to-transparent">
        <h1 className="font-playfair italic text-4xl md:text-5xl text-white mb-3">
          Temukan Akademi Impian
        </h1>
        <p className="text-text-secondary text-lg mb-8">
          Cari akademi olahraga grassroots terbaik di kotamu
        </p>

        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
          <input
            className="input-field flex-1"
            placeholder="Cari nama akademi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input-field max-w-[180px]" value={sport} onChange={(e) => setSport(e.target.value)}>
            {SPORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input
            className="input-field max-w-[180px]"
            placeholder="Lokasi..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </section>

      {/* Results */}
      <section className="max-w-fluid-xl mx-auto px-4 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : academies.length === 0 ? (
          <EmptyState
            icon={<span className="text-3xl">🔍</span>}
            title="Tidak ditemukan"
            description={search || sport || location ? 'Coba ubah filter pencarian' : 'Belum ada akademi terdaftar'}
            action={<Link href="/auth/register" className="btn-primary">Daftarkan Akademi Anda</Link>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {academies.map((a) => (
              <div key={a.id} className="card-hover">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{SPORT_ICONS[a.sport_type] || '🏟️'}</span>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{a.name}</h3>
                    <p className="text-text-secondary text-xs capitalize">{a.sport_type.replace('_', ' ')}</p>
                  </div>
                  <span className="badge badge-info text-[10px] capitalize">{a.subscription_tier}</span>
                </div>
                <p className="text-text-secondary text-xs mb-3">📍 {a.address || 'Alamat belum diset'}</p>
                <Link
                  href={`/discovery/${a.slug}`}
                  className="btn-secondary text-sm w-full text-center block"
                >
                  Lihat Profil
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
