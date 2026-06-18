'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';

interface LandingData {
  name: string; slug: string; sport_type: string; address: string;
  phone: string; email: string;
  subscription_tier: string;
  studentCount: number; coachCount: number;
  settings: {
    landing_theme?: string;
    logo_url?: string;
    landing_content?: {
      hero_title?: string;
      hero_subtitle?: string;
      about_text?: string;
      gallery?: string[];
      whatsapp_number?: string;
      primary_color?: string;
    };
  };
  achievements: { title: string; description: string; rank_position: number; date_achieved: string }[];
  tournaments: { name: string; start_date: string; end_date: string; status: string }[];
  announcements: { title: string; content: string; created_at: string }[];
  coaches: { name: string; avatar: string | null; specialization: string; experience_years: number; bio: string; license_number: string }[];
}

function Counter({ end, label }: { end: number; label: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0; const d = 1500; const step = 16;
    const inc = (end * step) / d;
    const t = setInterval(() => { start += inc; if (start >= end) { setCount(end); clearInterval(t); } else setCount(Math.floor(start)); }, step);
    return () => clearInterval(t);
  }, [end]);
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-accent font-outfit">{count}+</div>
      <p className="text-text-secondary/70 text-sm mt-1">{label}</p>
    </div>
  );
}

function FloatingWhatsApp({ phone, tenantName }: { phone?: string; tenantName: string }) {
  if (!phone && typeof window !== 'undefined') return null;
  const num = phone || '6281234567890';
  const msg = encodeURIComponent(`Halo ${tenantName}! Saya ingin info pendaftaran.`);
  return (
    <a
      href={`https://wa.me/${num}?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-green-500 shadow-[0_4px_20px_rgba(34,197,94,0.4)] flex items-center justify-center hover:scale-110 transition-transform animate-bounce"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
    </a>
  );
}

export default function TenantLandingPage() {
  const { slug } = useParams() as { slug: string };
  const [data, setData] = useState<LandingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/t/${slug}`);
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch { /* ignore */ } finally { setLoading(false); }
    }
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="space-y-4 w-full max-w-3xl px-4">
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
          <Skeleton className="h-64 w-full mt-8" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center text-text-secondary">Akademi tidak ditemukan.</div>
    );
  }

  const theme = data.settings?.landing_theme || 'dark';
  const content = data.settings?.landing_content || {};
  const isDark = theme === 'dark' || !theme;
  const bgClass = isDark ? 'bg-[#0A0A0C]' : 'bg-white';
  const textClass = isDark ? 'text-[#FFFFFF]' : 'text-gray-900';
  const mutedClass = isDark ? 'text-[#9CA3AF]' : 'text-gray-500';
  const cardClass = isDark ? 'bg-[#111114] border-[#1F2937]' : 'bg-gray-50 border-gray-200';

  return (
    <div className={`min-h-screen ${bgClass} ${textClass}`}>
      <FloatingWhatsApp phone={content.whatsapp_number} tenantName={data.name} />

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden px-4 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">

          {/* Logo */}
          {data.settings?.logo_url && (
            <img src={data.settings.logo_url} alt={data.name} className="h-20 md:h-24 mx-auto mb-6 object-contain" />
          )}

          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20 mb-6">
            🏟️ {data.sport_type?.replace('_', ' ') || 'Olahraga'}
          </span>
          <h1 className="font-playfair italic text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">
            {content.hero_title || data.name}
          </h1>
          <p className={`${mutedClass} text-lg md:text-xl max-w-2xl mx-auto mb-8`}>
            {content.hero_subtitle || `Akademi ${data.sport_type?.replace('_', ' ') || 'Olahraga'} — Membina atlet muda Indonesia`}
          </p>

          {/* Counters */}
          <div className="flex justify-center gap-10 md:gap-16 mb-10">
            <Counter end={data.studentCount} label="Atlet Aktif" />
            <Counter end={data.coachCount} label="Pelatih" />
            <Counter end={data.achievements.length} label="Prestasi" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/register/${data.slug}`} className="btn-primary text-base py-4 px-8">
              Daftar Online
            </Link>
            <a href={`https://wa.me/${content.whatsapp_number || '6281234567890'}`} target="_blank" rel="noopener" className="btn-secondary text-base py-4 px-8 flex items-center gap-2 justify-center">
              💬 WhatsApp Kami
            </a>
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      {content.about_text && (
        <section className="px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-playfair italic text-3xl md:text-4xl mb-6 text-center">Tentang Kami</h2>
            <p className={`${mutedClass} text-lg leading-relaxed text-center`}>{content.about_text}</p>

            {data.address && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
                {[
                  { icon: '📍', text: data.address },
                  { icon: '📞', text: data.phone || '-' },
                  { icon: '✉️', text: data.email || '-' },
                ].map((info) => (
                  <div key={info.icon} className={`${cardClass} rounded-xl p-5 text-center border`}>
                    <span className="text-2xl">{info.icon}</span>
                    <p className="text-sm mt-2 opacity-80">{info.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== GALLERY ===== */}
      <section className="px-4 py-16 bg-surface/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-playfair italic text-3xl md:text-4xl mb-10 text-center">🖼️ Galeri</h2>
          {content.gallery && content.gallery.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {content.gallery.map((img, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-border hover:scale-105 transition-transform shadow-lg">
                  <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 opacity-50">
              <div className="text-5xl mb-3">📸</div>
              <p className={`${mutedClass} text-sm`}>Galeri foto sedang dipersiapkan</p>
              <p className={`${mutedClass} text-xs mt-1`}>Foto latihan, pertandingan, dan kegiatan akan ditampilkan di sini</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== COACH PROFILES ===== */}
      {data.coaches && data.coaches.length > 0 && (
        <section className="px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-playfair italic text-3xl md:text-4xl mb-10 text-center">🧑‍🏫 Tim Pelatih</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.coaches.map((c, i) => (
                <div key={i} className={`${cardClass} rounded-xl p-6 border hover:border-accent/30 transition-all flex gap-5`}>
                  <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center shrink-0 overflow-hidden border-2 border-accent/20">
                    {c.avatar ? (
                      <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-accent">{c.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-lg">{c.name}</h4>
                    <p className="text-accent text-xs font-medium mb-2">{c.specialization || 'Pelatih'}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="text-xs bg-canvas rounded-full px-2.5 py-0.5 border border-border">{c.experience_years} tahun pengalaman</span>
                      {c.license_number && <span className="text-xs bg-canvas rounded-full px-2.5 py-0.5 border border-border">Lisensi: {c.license_number}</span>}
                    </div>
                    {c.bio && <p className="text-xs opacity-60 line-clamp-2">{c.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== ACHIEVEMENTS ===== */}
      {data.achievements.length > 0 && (
        <section className="px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-playfair italic text-3xl md:text-4xl mb-10 text-center">🏆 Prestasi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.achievements.map((a, i) => (
                <div key={i} className={`${cardClass} rounded-xl p-5 border hover:border-accent/30 transition-all text-center`}>
                  <div className="text-3xl mb-2">{a.rank_position <= 3 ? ['🥇','🥈','🥉'][a.rank_position - 1] : '🏅'}</div>
                  <h4 className="font-semibold mb-1">{a.title}</h4>
                  <p className="text-xs opacity-60">{a.description?.slice(0, 60)}</p>
                  <p className="text-xs opacity-50 mt-2">{a.date_achieved}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== TOURNAMENTS ===== */}
      {data.tournaments.length > 0 && (
        <section className="px-4 py-16 bg-surface/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-playfair italic text-3xl md:text-4xl mb-10 text-center">📅 Turnamen</h2>
            <div className="space-y-3">
              {data.tournaments.map((t, i) => (
                <div key={i} className={`${cardClass} rounded-xl p-4 border flex items-center justify-between`}>
                  <div>
                    <h4 className="font-semibold text-sm">{t.name}</h4>
                    <p className="text-xs opacity-60">{t.start_date} — {t.end_date}</p>
                  </div>
                  <span className={`badge badge-${t.status === 'upcoming' ? 'info' : t.status === 'ongoing' ? 'warning' : 'success'} text-[10px]`}>{t.status}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== ANNOUNCEMENTS ===== */}
      {data.announcements.length > 0 && (
        <section className="px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-playfair italic text-3xl md:text-4xl mb-10 text-center">📢 Pengumuman</h2>
            <div className="space-y-3">
              {data.announcements.map((a, i) => (
                <div key={i} className={`${cardClass} rounded-xl p-5 border`}>
                  <h4 className="font-semibold mb-1">{a.title}</h4>
                  <p className="text-sm opacity-70">{a.content?.slice(0, 150)}</p>
                  <p className="text-xs opacity-50 mt-2">{new Date(a.created_at).toLocaleDateString('id-ID')}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA FOOTER ===== */}
      <section className="px-4 py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent pointer-events-none" />
        <div className="max-w-xl mx-auto text-center relative">
          <h2 className="font-playfair italic text-3xl md:text-4xl mb-4">Gabung Sekarang!</h2>
          <p className={`${mutedClass} mb-8`}>Jadilah bagian dari {data.name}</p>
          <Link href={`/register/${data.slug}`} className="btn-primary text-lg py-4 px-10">Daftar Online</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 px-4 py-6 text-center text-xs opacity-50">
        Powered by <span className="text-accent">BuildUp</span> — {data.name}
      </footer>
    </div>
  );
}
