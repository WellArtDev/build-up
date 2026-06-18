'use client';

import Link from 'next/link';
import { useState } from 'react';

const TIERS = [
  {
    name: 'Starter',
    price: '99rb',
    students: '1–30',
    features: [
      '1 Cabang Olahraga',
      'Manajemen Siswa Dasar',
      'Jadwal & Absensi',
      'Penilaian 4 PILAR',
      'Laporan Bulanan',
      'Support WhatsApp',
    ],
    accent: 'border-border',
  },
  {
    name: 'Growth',
    price: '249rb',
    students: '31–100',
    popular: true,
    features: [
      'Multi Olahraga',
      'Analitik Lanjutan',
      'Portal Orang Tua',
      'Ekspor Laporan PDF',
      'Integrasi WhatsApp',
      '5 Akun Coach',
      'Support Prioritas',
    ],
    accent: 'border-accent',
  },
  {
    name: 'Professional',
    price: '499rb',
    students: '101–300',
    features: [
      'Semua Fitur Growth',
      'WhatsApp Automation',
      'Custom Reports',
      'Tournament Management',
      '15 Akun Coach',
      'API Access',
      'Dedicated Account Manager',
    ],
    accent: 'border-border',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    students: '300+',
    features: [
      'Semua Fitur Professional',
      'White Label',
      'Custom Integrations',
      'Unlimited Coaches',
      'SLA 99.9%',
      'On-premise Option',
      'Dedicated Support Team',
    ],
    accent: 'border-border',
  },
];

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Manajemen Multi-Akademi',
    desc: 'Kelola beberapa akademi olahraga dalam satu platform terpadu dengan isolasi data tenant penuh.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="1.5">
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
        <line x1="12" y1="22" x2="12" y2="15.5" />
        <polyline points="22 8.5 12 15.5 2 8.5" />
      </svg>
    ),
    title: 'Sistem 4 PILAR',
    desc: 'Evaluasi komprehensif: Teknik, Taktik, Fisik, dan Mental — standar emas pembinaan grassroots Indonesia.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="1.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    title: 'WhatsApp Automation',
    desc: 'Invoice dan pengingat otomatis via WhatsApp. Orang tua dapat update real-time perkembangan anak.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="1.5">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    ),
    title: 'Analitik Bisnis',
    desc: 'Dashboard eksekutif dengan tren pendaftaran, revenue analytics, dan performa coach dalam satu layar.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="14" x2="8.01" y2="14" />
        <line x1="12" y1="14" x2="12.01" y2="14" />
      </svg>
    ),
    title: 'Manajemen Turnamen',
    desc: 'Jadwalkan kompetisi, kelola peserta, rekam hasil pertandingan — semua terintegrasi dengan profil siswa.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Keamanan Multi-Tenant',
    desc: 'Isolasi data penuh antar akademi, enkripsi end-to-end, dan role-based access control ketat.',
  },
];

export default function LandingPage() {
  const [activeTier, setActiveTier] = useState('yearly');

  return (
    <div className="bg-canvas">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 md:py-32">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-fluid-xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-accent text-sm font-outfit font-medium">
              Platform Manajemen Olahraga #1 di Indonesia
            </span>
          </div>

          <h1 className="font-playfair italic text-4xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight">
            Bina Atlet Muda
            <br />
            <span className="text-gradient">Tanpa Batas Administrasi</span>
          </h1>

          <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 font-outfit">
            BuildUp adalah platform all-in-one untuk akademi olahraga grassroots Indonesia.
            Kelola siswa, pantau perkembangan 4 PILAR, otomatiskan keuangan — semua dalam satu dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn-primary text-lg py-4 px-8">
              Mulai Gratis 15 Hari
            </Link>
            <Link href="#features" className="btn-secondary text-lg py-4 px-8">
              Jelajahi Fitur
            </Link>
          </div>

          <p className="text-text-secondary/60 text-sm mt-4">
            Tanpa kartu kredit • Setup 5 menit • Batal kapan saja
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-20">
        <div className="max-w-fluid-xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-accent font-outfit font-medium mb-3 tracking-wide uppercase text-sm">
              Mengapa BuildUp?
            </p>
            <h2 className="section-title text-4xl md:text-5xl">
              Semua yang Dibutuhkan Akademi Anda
            </h2>
            <p className="section-subtitle mt-4">
              Dari pendaftaran siswa hingga analitik performa — satu platform terintegrasi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card-hover group">
                <div className="w-12 h-12 rounded-xl bg-accent/5 flex items-center justify-center mb-4 group-hover:bg-accent/10 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="font-outfit font-semibold text-white text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-4 py-20">
        <div className="max-w-fluid-xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-accent font-outfit font-medium mb-3 tracking-wide uppercase text-sm">
              Harga
            </p>
            <h2 className="section-title text-4xl md:text-5xl">
              Investasi untuk Pertumbuhan
            </h2>
            <p className="section-subtitle mt-4">
              Pilih paket sesuai skala akademi Anda
            </p>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <button
              onClick={() => setActiveTier('monthly')}
              className={`font-outfit text-sm px-4 py-2 rounded-lg transition-all ${
                activeTier === 'monthly'
                  ? 'bg-accent text-canvas font-semibold'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setActiveTier('yearly')}
              className={`font-outfit text-sm px-4 py-2 rounded-lg transition-all ${
                activeTier === 'yearly'
                  ? 'bg-accent text-canvas font-semibold'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              Tahunan <span className="text-accent text-xs">(Hemat 20%)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`card-hover relative ${
                  tier.popular ? 'border-accent border-2' : 'border-border'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-canvas font-outfit font-semibold text-xs px-4 py-1 rounded-full">
                    Paling Populer
                  </div>
                )}

                <div className="text-center mb-6 mt-2">
                  <h3 className="font-playfair italic text-2xl text-white mb-1">{tier.name}</h3>
                  <p className="text-text-secondary text-sm mb-4">{tier.students} siswa</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-text-secondary text-sm">Rp</span>
                    <span className="font-outfit font-bold text-4xl text-white">{tier.price}</span>
                    {tier.price !== 'Custom' && (
                      <span className="text-text-secondary text-sm">/bulan</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm text-text-secondary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.price === 'Custom' ? '#contact' : '/auth/register'}
                  className={`block text-center py-3 rounded-lg font-outfit font-semibold transition-all ${
                    tier.popular
                      ? 'bg-accent text-canvas hover:shadow-[0_0_20px_rgba(204,255,0,0.3)]'
                      : 'bg-surface text-white border border-border hover:border-accent'
                  }`}
                >
                  {tier.price === 'Custom' ? 'Hubungi Kami' : 'Coba Gratis'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="max-w-fluid-xl mx-auto">
          <div className="card-hover p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="font-playfair italic text-3xl md:text-4xl text-white mb-4">
                Siap Memajukan Akademi Anda?
              </h2>
              <p className="text-text-secondary text-lg max-w-xl mx-auto mb-8">
                Mulai uji coba gratis 15 hari. Akses penuh semua fitur. Tanpa kartu kredit.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register" className="btn-primary text-lg py-4 px-8">
                  Mulai Gratis Sekarang
                </Link>
                <Link href="#contact" className="btn-secondary text-lg py-4 px-8">
                  Hubungi Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="px-4 py-20">
        <div className="max-w-fluid-sm mx-auto">
          <div className="card-hover p-8 md:p-12">
            <div className="text-center mb-8">
              <p className="text-accent font-outfit font-medium mb-3 tracking-wide uppercase text-sm">Kontak</p>
              <h2 className="section-title text-4xl">Hubungi Kami</h2>
              <p className="section-subtitle mt-4">Tim kami siap membantu Anda</p>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); }}>
              <div>
                <label className="label-text">Nama</label>
                <input className="input-field" placeholder="Nama lengkap" required />
              </div>
              <div>
                <label className="label-text">Email</label>
                <input type="email" className="input-field" placeholder="nama@email.com" required />
              </div>
              <div>
                <label className="label-text">Pesan</label>
                <textarea className="input-field min-h-[100px]" placeholder="Ceritakan kebutuhan akademi Anda..." required />
              </div>
              <button type="submit" className="btn-primary w-full">Kirim Pesan</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-12">
        <div className="max-w-fluid-xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-outfit font-bold text-xl text-white">
                Build<span className="text-accent">Up</span>
              </span>
            </div>
            <div className="flex gap-6 text-text-secondary text-sm">
              <Link href="#" className="hover:text-accent transition-colors">Tentang</Link>
              <Link href="#" className="hover:text-accent transition-colors">Fitur</Link>
              <Link href="#" className="hover:text-accent transition-colors">Harga</Link>
              <Link href="#" className="hover:text-accent transition-colors">Kontak</Link>
              <Link href="#" className="hover:text-accent transition-colors">Kebijakan Privasi</Link>
            </div>
            <p className="text-text-secondary/50 text-sm">
              © {new Date().getFullYear()} BuildUp. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
