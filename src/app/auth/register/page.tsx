'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SportType } from '@/types';

interface FormData {
  academyName: string;
  academySlug: string;
  sportType: SportType;
  ownerName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  address: string;
}

const SPORTS: { value: SportType; label: string }[] = [
  { value: 'football', label: 'Sepak Bola' },
  { value: 'basketball', label: 'Basket' },
  { value: 'martial_arts', label: 'Bela Diri' },
  { value: 'swimming', label: 'Renang' },
  { value: 'other', label: 'Lainnya' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>({
    academyName: '',
    academySlug: '',
    sportType: 'football',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
  });

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateStep1(): string | null {
    if (!form.academyName.trim()) return 'Nama akademi wajib diisi';
    if (!form.sportType) return 'Pilih jenis olahraga';
    if (!form.address.trim()) return 'Alamat wajib diisi';
    return null;
  }

  function validateStep2(): string | null {
    if (!form.ownerName.trim()) return 'Nama pemilik wajib diisi';
    if (!form.email.trim()) return 'Email wajib diisi';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Format email tidak valid';
    if (!form.phone.trim()) return 'Nomor telepon wajib diisi';
    if (form.password.length < 6) return 'Password minimal 6 karakter';
    if (form.password !== form.confirmPassword) return 'Password tidak cocok';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const step1Error = validateStep1();
    if (step1Error) {
      setError(step1Error);
      setStep(1);
      return;
    }

    const step2Error = validateStep2();
    if (step2Error) {
      setError(step2Error);
      setStep(2);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/tenants/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academyName: form.academyName,
          academySlug: form.academyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          sportType: form.sportType,
          address: form.address,
          phone: form.phone,
          email: form.email,
          ownerName: form.ownerName,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Pendaftaran gagal');
        setLoading(false);
        return;
      }

      router.push('/auth/onboarding?tenant=' + data.data.slug);
    } catch {
      setError('Gagal terhubung ke server. Coba lagi nanti.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-fluid-sm">
        <div className="card-hover p-8">
          <div className="text-center mb-8">
            <h1 className="font-playfair italic text-3xl text-white mb-2">
              Mulai 15 Hari Gratis
            </h1>
            <p className="text-text-secondary">
              Daftarkan akademi Anda dan nikmati akses penuh
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 1 ? 'bg-accent' : 'bg-border'}`} />
            <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 2 ? 'bg-accent' : 'bg-border'}`} />
          </div>
          <div className="flex justify-between text-xs text-text-secondary mb-6">
            <span className={step >= 1 ? 'text-accent' : ''}>Info Akademi</span>
            <span className={step >= 2 ? 'text-accent' : ''}>Akun Pemilik</span>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="label-text">Nama Akademi</label>
                  <input
                    className="input-field"
                    placeholder="Contoh: SSB Garuda Muda"
                    value={form.academyName}
                    onChange={(e) => updateField('academyName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label-text">Jenis Olahraga</label>
                  <select
                    className="input-field"
                    value={form.sportType}
                    onChange={(e) => updateField('sportType', e.target.value)}
                  >
                    {SPORTS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-text">Alamat</label>
                  <textarea
                    className="input-field min-h-[80px]"
                    placeholder="Alamat lengkap akademi"
                    value={form.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    required
                  />
                </div>
                <button type="button" onClick={() => setStep(2)} className="btn-primary w-full">
                  Lanjutkan
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="label-text">Nama Pemilik</label>
                  <input
                    className="input-field"
                    placeholder="Nama lengkap"
                    value={form.ownerName}
                    onChange={(e) => updateField('ownerName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label-text">Email</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="nama@email.com"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label-text">No. Telepon</label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="0821xxxx"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label-text">Password</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Minimal 6 karakter"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label-text">Konfirmasi Password</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Ulangi password"
                    value={form.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => { setStep(1); setError(''); }} className="btn-secondary flex-1">
                    Kembali
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="mt-6 text-center text-text-secondary text-sm">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-accent hover:underline font-medium">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
