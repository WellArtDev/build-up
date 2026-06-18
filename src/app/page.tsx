'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const TIERS = [
  { name: 'Starter', price: '99rb', students: '1–30', popular: false,
    features: ['1 Cabang Olahraga','Manajemen Siswa Dasar','Jadwal & Absensi','Penilaian 4 PILAR','Laporan Bulanan','Support WhatsApp'], },
  { name: 'Growth', price: '249rb', students: '31–100', popular: true,
    features: ['Multi Olahraga','Analitik Lanjutan','Portal Orang Tua','Ekspor Laporan PDF','Integrasi WhatsApp','5 Akun Coach','Support Prioritas'], },
  { name: 'Professional', price: '499rb', students: '101–300', popular: false,
    features: ['Semua Fitur Growth','WhatsApp Automation','Custom Reports','Tournament Management','15 Akun Coach','API Access','Dedicated Account Manager'], },
  { name: 'Enterprise', price: 'Custom', students: '300+', popular: false,
    features: ['Semua Fitur Professional','White Label','Custom Integrations','Unlimited Coaches','SLA 99.9%','On-premise Option','Dedicated Support Team'], },
];

function AnimatedCounter({ end, suffix = '', label = '' }: { end: number; suffix?: string; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      let start = 0; const duration = 2000; const step = 16;
      const increment = (end * step) / duration;
      const timer = setInterval(() => { start += increment; if (start >= end) { setCount(end); clearInterval(timer); } else setCount(Math.floor(start)); }, step);
      obs.unobserve(el);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end]);

  return (
    <div ref={ref} className="text-center">
      <div className="font-outfit font-bold text-4xl md:text-5xl text-white">{count.toLocaleString()}{suffix}</div>
      <p className="text-text-secondary text-sm mt-1">{label}</p>
    </div>
  );
}

function BallAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="absolute rounded-full bg-accent/5"
          style={{
            width: `${40 + Math.random() * 80}px`, height: `${40 + Math.random() * 80}px`,
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            animation: `floatBall ${4 + Math.random() * 6}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="relative mx-auto max-w-4xl">
      {/* Glow behind */}
      <div className="absolute inset-0 bg-accent/10 blur-[100px] rounded-full" />
      {/* Dashboard frame */}
      <div className="relative bg-surface border border-border rounded-2xl overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-canvas">
          <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/60" /><div className="w-3 h-3 rounded-full bg-yellow-500/60" /><div className="w-3 h-3 rounded-full bg-green-500/60" /></div>
          <div className="ml-3 flex items-center gap-2"><span className="font-outfit font-bold text-xs text-white">Build<span className="text-accent">Up</span></span><span className="badge badge-info text-[9px]">Admin</span></div>
        </div>
        {/* Content */}
        <div className="p-6 grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-canvas rounded-xl border border-border p-4">
              <div className="h-2 w-16 bg-border rounded mb-3" /><div className="h-6 w-12 bg-accent/20 rounded mb-1" /><div className="h-3 w-20 bg-border/50 rounded" />
            </div>
          ))}
        </div>
        <div className="px-6 pb-6 grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-canvas rounded-xl border border-border p-4">
            <div className="h-3 w-24 bg-border rounded mb-4" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (<div key={i} className="h-8 bg-surface rounded flex items-center px-3 gap-2"><div className="w-6 h-6 rounded-full bg-accent/20" /><div className="h-2 flex-1 bg-border/50 rounded" /></div>))}
            </div>
          </div>
          <div className="bg-canvas rounded-xl border border-border p-4">
            <div className="h-3 w-16 bg-border rounded mb-4" />
            <div className="flex justify-center mb-3"><div className="w-20 h-20 rounded-full border-4 border-accent/30 border-t-accent" /></div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px]"><span className="text-text-secondary">Teknik</span><span className="text-accent">6.5</span></div>
              <div className="flex justify-between text-[10px]"><span className="text-text-secondary">Taktik</span><span className="text-accent">5.5</span></div>
              <div className="flex justify-between text-[10px]"><span className="text-text-secondary">Fisik</span><span className="text-accent">7.0</span></div>
              <div className="flex justify-between text-[10px]"><span className="text-text-secondary">Mental</span><span className="text-accent">8.0</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineStep({ num, title, desc, align }: { num: number; title: string; desc: string; align: 'left' | 'right' }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`flex items-center gap-6 md:gap-12 ${align === 'right' ? 'flex-row-reverse' : ''} transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="w-12 h-12 rounded-full bg-accent text-canvas font-outfit font-bold text-lg flex items-center justify-center shrink-0 z-10 shadow-[0_0_20px_rgba(204,255,0,0.3)]">{num}</div>
      <div className={`flex-1 bg-surface border border-border rounded-xl p-5 ${align === 'right' ? 'text-right' : ''}`}>
        <h4 className="text-white font-outfit font-semibold mb-1">{title}</h4>
        <p className="text-text-secondary text-sm">{desc}</p>
      </div>
    </div>
  );
}

function SportsIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    football: '⚽', basketball: '🏀', martial_arts: '🥋', swimming: '🏊', coaching: '🧑‍🏫',
    chart: '📊', shield: '🛡️', star: '⭐', rocket: '🚀', heart: '❤️', target: '🎯', trophy: '🏆',
  };
  return <span className="text-4xl">{icons[type] || '🏟️'}</span>;
}

export default function LandingPage() {
  const [activeTier, setActiveTier] = useState('yearly');
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => { setHeroVisible(true); }, []);

  return (
    <div className="bg-canvas overflow-x-hidden">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden px-4 pt-24 pb-20 md:pt-36 md:pb-32 min-h-[90vh] flex items-center">
        <BallAnimation />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-accent/3 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className={`max-w-fluid-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div>
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-6 animate-pulse">
              <span className="w-2 h-2 bg-accent rounded-full" />
              <span className="text-accent text-xs font-outfit font-medium">Platform Manajemen Olahraga #1 di Indonesia</span>
            </div>

            <h1 className="font-playfair italic text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
              Bina Atlet Muda{' '}
              <span className="text-gradient bg-gradient-to-r from-accent via-green-300 to-accent bg-clip-text text-transparent">Tanpa Batas</span>
            </h1>

            <p className="text-text-secondary text-base md:text-lg max-w-lg mb-8 font-outfit leading-relaxed">
              Platform all-in-one untuk akademi olahraga grassroots Indonesia. Kelola siswa, 4 PILAR assessment, otomatiskan keuangan & WhatsApp — satu dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link href="/auth/register" className="btn-primary text-base py-4 px-8 group relative overflow-hidden">
                <span className="relative z-10">Mulai Gratis 15 Hari</span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link href="#demo" className="btn-secondary text-base py-4 px-8 flex items-center gap-2 justify-center">
                🎬 Lihat Demo
              </Link>
            </div>

            <div className="flex gap-8">
              <AnimatedCounter end={500} suffix="+" label="Akademi Aktif" />
              <AnimatedCounter end={15000} suffix="+" label="Atlet Muda" />
              <AnimatedCounter end={98} suffix="%" label="Kepuasan" />
            </div>
          </div>

          <div className="hidden lg:block">
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS — Timeline ===== */}
      <section id="demo" className="px-4 py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-canvas via-accent/[0.02] to-canvas pointer-events-none" />
        <div className="max-w-fluid-md mx-auto relative">
          <div className="text-center mb-16">
            <p className="text-accent font-outfit font-medium mb-3 tracking-wide uppercase text-sm">Bagaimana Caranya</p>
            <h2 className="section-title text-4xl md:text-5xl">Mulai dalam 5 Menit</h2>
            <p className="section-subtitle mt-4">Setup akademi Anda, undang pelatih, dan mulai melatih</p>
          </div>

          <div className="relative space-y-8">
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-accent via-accent/40 to-border hidden md:block" />
            <TimelineStep num={1} title="Daftar Akademi" desc="Isi profil akademi, pilih olahraga, setup grup usia — gratis 15 hari akses penuh." align="left" />
            <TimelineStep num={2} title="Tambahkan Siswa & Pelatih" desc="Import massal via CSV atau input manual. Undang pelatih dengan akun khusus." align="right" />
            <TimelineStep num={3} title="Jadwalkan & Nilai" desc="Buat jadwal latihan, catat absensi, dan nilai perkembangan 4 PILAR setiap sesi." align="left" />
            <TimelineStep num={4} title="Pantau & Komunikasikan" desc="Dashboard real-time untuk pemilik, orang tua, dan pelatih. Notifikasi WhatsApp otomatis." align="right" />
          </div>
        </div>
      </section>

      {/* ===== SPORTS TYPES ===== */}
      <section className="px-4 py-16">
        <div className="max-w-fluid-xl mx-auto text-center">
          <p className="text-accent font-outfit font-medium mb-3 tracking-wide uppercase text-sm">Multi Olahraga</p>
          <h2 className="section-title text-4xl md:text-5xl mb-12">Satu Platform, Semua Cabang</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { icon: 'football', label: 'Sepak Bola', color: 'from-green-400/20' },
              { icon: 'basketball', label: 'Basket', color: 'from-orange-400/20' },
              { icon: 'martial_arts', label: 'Bela Diri', color: 'from-red-400/20' },
              { icon: 'swimming', label: 'Renang', color: 'from-blue-400/20' },
              { icon: 'star', label: 'Lainnya', color: 'from-purple-400/20' },
            ].map((s) => (
              <div key={s.label} className="card-hover group text-center py-8 hover:scale-105 transition-transform">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-b ${s.color} to-transparent flex items-center justify-center mx-auto mb-4 group-hover:shadow-[0_0_30px_rgba(204,255,0,0.15)] transition-all`}>
                  <SportsIcon type={s.icon} />
                </div>
                <p className="text-white font-outfit font-semibold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="px-4 py-20">
        <div className="max-w-fluid-xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-accent font-outfit font-medium mb-3 tracking-wide uppercase text-sm">Mengapa BuildUp?</p>
            <h2 className="section-title text-4xl md:text-5xl">Semua yang Dibutuhkan Akademi Anda</h2>
            <p className="section-subtitle mt-4">Dari pendaftaran hingga analitik performa — terintegrasi penuh</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: 'coaching', title: 'Manajemen Multi-Akademi', desc: 'Isolasi data tenant penuh. Kelola banyak akademi dalam satu platform.' },
              { icon: 'target', title: 'Sistem 4 PILAR', desc: 'Evaluasi Teknik, Taktik, Fisik, Mental — standar emas grassroots Indonesia.' },
              { icon: 'rocket', title: 'WhatsApp Automation', desc: 'Invoice & pengingat otomatis via WhatsApp. Orang tua update real-time.' },
              { icon: 'chart', title: 'Analitik Bisnis', desc: 'Dashboard eksekutif: tren pendaftaran, revenue, performa coach.' },
              { icon: 'trophy', title: 'Manajemen Turnamen', desc: 'Jadwalkan kompetisi, kelola peserta, rekam hasil — terintegrasi profil siswa.' },
              { icon: 'shield', title: 'Keamanan Multi-Tenant', desc: 'Isolasi data penuh, enkripsi end-to-end, RBAC 5 level role.' },
            ].map((f) => (
              <div key={f.title} className="card-hover group hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-accent/5 flex items-center justify-center mb-4 group-hover:bg-accent/10 group-hover:shadow-[0_0_20px_rgba(204,255,0,0.15)] transition-all">
                  <SportsIcon type={f.icon} />
                </div>
                <h3 className="font-outfit font-semibold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4 PILAR ILLUSTRATION ===== */}
      <section className="px-4 py-20 bg-surface/30">
        <div className="max-w-fluid-xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-accent font-outfit font-medium mb-3 tracking-wide uppercase text-sm">4 PILAR Assessment</p>
            <h2 className="section-title text-4xl md:text-5xl">Metode Penilaian Terstandar</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { pillar: 'TEKNIK', color: 'border-l-blue-400', items: ['First Touch', 'Passing', 'Dribbling', 'Shooting'], icon: '⚽' },
              { pillar: 'TAKTIK', color: 'border-l-yellow-400', items: ['Positioning', 'Decision Making', 'Game Reading', 'Formation'], icon: '🧠' },
              { pillar: 'FISIK', color: 'border-l-orange-400', items: ['Stamina', 'Speed & Agility', 'Strength', 'Coordination'], icon: '💪' },
              { pillar: 'MENTAL', color: 'border-l-green-400', items: ['Discipline', 'Teamwork', 'Fighting Spirit', 'Leadership'], icon: '❤️' },
            ].map((p) => (
              <div key={p.pillar} className={`card-hover border-l-2 ${p.color} group`}>
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className="font-outfit font-bold text-white text-lg mb-3">{p.pillar}</h3>
                <div className="space-y-2">
                  {p.items.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-text-secondary">
                      <div className="w-2 h-2 rounded-full bg-accent/50" />{item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="px-4 py-20">
        <div className="max-w-fluid-xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-accent font-outfit font-medium mb-3 tracking-wide uppercase text-sm">Harga</p>
            <h2 className="section-title text-4xl md:text-5xl">Investasi untuk Pertumbuhan</h2>
            <p className="section-subtitle mt-4">Pilih paket sesuai skala akademi Anda</p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-12">
            {['monthly', 'yearly'].map((t) => (
              <button key={t} onClick={() => setActiveTier(t)} className={`font-outfit text-sm px-5 py-2.5 rounded-lg transition-all ${activeTier === t ? 'bg-accent text-canvas font-semibold' : 'text-text-secondary hover:text-white'}`}>
                {t === 'monthly' ? 'Bulanan' : 'Tahunan'}{t === 'yearly' && <span className="text-accent text-xs ml-1">(Hemat 20%)</span>}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIERS.map((tier) => (
              <div key={tier.name} className={`card-hover relative group ${tier.popular ? 'border-accent border-2 scale-[1.02]' : 'border-border'}`}>
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent text-canvas font-outfit font-bold text-xs px-5 py-1.5 rounded-full shadow-[0_0_20px_rgba(204,255,0,0.3)]">🔥 Paling Populer</div>
                )}
                <div className="text-center mb-6 mt-2">
                  <h3 className="font-playfair italic text-2xl text-white mb-1">{tier.name}</h3>
                  <p className="text-text-secondary text-sm mb-4">{tier.students} siswa</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-text-secondary text-sm">Rp</span>
                    <span className="font-outfit font-bold text-4xl text-white group-hover:text-accent transition-colors">{tier.price}</span>
                    {tier.price !== 'Custom' && <span className="text-text-secondary text-sm">/bulan</span>}
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm text-text-secondary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link href={tier.price === 'Custom' ? '#contact' : '/auth/register'} className={`block text-center py-3 rounded-lg font-outfit font-semibold transition-all ${tier.popular ? 'bg-accent text-canvas hover:shadow-[0_0_25px_rgba(204,255,0,0.4)]' : 'bg-surface text-white border border-border hover:border-accent'}`}>
                  {tier.price === 'Custom' ? 'Hubungi Kami' : 'Coba Gratis'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="px-4 py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5 pointer-events-none" />
        <BallAnimation />
        <div className="max-w-fluid-sm mx-auto text-center relative">
          <div className="card-hover p-12 md:p-16 text-center relative overflow-hidden border-accent/20">
            <h2 className="font-playfair italic text-3xl md:text-4xl text-white mb-4">Siap Memajukan Akademi Anda?</h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto mb-8">Mulai uji coba gratis 15 hari. Akses penuh semua fitur.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="btn-primary text-lg py-4 px-8">Mulai Gratis Sekarang</Link>
              <Link href="#contact" className="btn-secondary text-lg py-4 px-8">Hubungi Sales</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" className="px-4 py-20">
        <div className="max-w-fluid-sm mx-auto">
          <div className="card-hover p-8 md:p-12">
            <div className="text-center mb-8">
              <p className="text-accent font-outfit font-medium mb-3 tracking-wide uppercase text-sm">Kontak</p>
              <h2 className="section-title text-4xl">Hubungi Kami</h2>
            </div>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div><label className="label-text">Nama</label><input className="input-field" placeholder="Nama lengkap" required /></div>
              <div><label className="label-text">Email</label><input type="email" className="input-field" placeholder="nama@email.com" required /></div>
              <div><label className="label-text">Pesan</label><textarea className="input-field min-h-[100px]" placeholder="Ceritakan kebutuhan akademi Anda..." required /></div>
              <button type="submit" className="btn-primary w-full">Kirim Pesan</button>
            </form>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border px-4 py-12">
        <div className="max-w-fluid-xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="font-outfit font-bold text-xl text-white">Build<span className="text-accent">Up</span></span>
          <div className="flex gap-6 text-text-secondary text-sm">
            <Link href="#" className="hover:text-accent transition-colors">Tentang</Link>
            <Link href="#features" className="hover:text-accent transition-colors">Fitur</Link>
            <Link href="#pricing" className="hover:text-accent transition-colors">Harga</Link>
            <Link href="#contact" className="hover:text-accent transition-colors">Kontak</Link>
          </div>
          <p className="text-text-secondary/50 text-sm">© {new Date().getFullYear()} BuildUp. All rights reserved.</p>
        </div>
      </footer>

      {/* Keyframe animations */}
      <style jsx global>{`
        @keyframes floatBall {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
          50% { transform: translateY(-30px) scale(1.1); opacity: 0.15; }
        }
      `}</style>
    </div>
  );
}
