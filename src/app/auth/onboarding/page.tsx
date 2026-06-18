'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface OnboardingState {
  step: number;
  logo: File | null;
  assessmentFrequency: string;
  ageGroups: string[];
  wablasApiKey: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

const AGE_OPTIONS = ['U-8', 'U-10', 'U-12', 'U-14', 'U-16', 'U-18', 'U-21', 'Senior'];

const ASSESSMENT_FREQ = [
  { value: 'per_practice', label: 'Setiap Latihan' },
  { value: 'weekly', label: 'Mingguan' },
  { value: 'biweekly', label: '2 Minggu Sekali' },
  { value: 'monthly', label: 'Bulanan' },
];

export default function OnboardingPage() {
  const router = useRouter();

  const [state, setState] = useState<OnboardingState>({
    step: 1,
    logo: null,
    assessmentFrequency: 'monthly',
    ageGroups: ['U-12', 'U-14'],
    wablasApiKey: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
  });
  const [loading, setLoading] = useState(false);

  function toggleAgeGroup(group: string) {
    setState((prev) => ({
      ...prev,
      ageGroups: prev.ageGroups.includes(group)
        ? prev.ageGroups.filter((g) => g !== group)
        : [...prev.ageGroups, group],
    }));
  }

  async function handleComplete() {
    setLoading(true);
    // Here we'd save all onboarding config per-tenant
    // For Phase 1, just redirect to dashboard
    // In later phases: save assessment frequency, age groups, payment gateways

    await new Promise((r) => setTimeout(r, 800)); // simulate save
    setLoading(false);
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-fluid-sm">
        <div className="card-hover p-8">
          <div className="text-center mb-8">
            <h1 className="font-playfair italic text-3xl text-white mb-2">
              Setup Akademi Anda
            </h1>
            <p className="text-text-secondary">
              Langkah {state.step} dari 3
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-all ${
                  s <= state.step ? 'bg-accent' : 'bg-border'
                }`}
              />
            ))}
          </div>

          {state.step === 1 && (
            <div className="space-y-6">
              <h3 className="font-outfit font-semibold text-white text-lg">
                Grup Usia & Frekuensi Penilaian
              </h3>

              <div>
                <label className="label-text">Grup Usia yang Dilatih</label>
                <div className="grid grid-cols-4 gap-2">
                  {AGE_OPTIONS.map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => toggleAgeGroup(age)}
                      className={`py-2 px-3 rounded-lg text-xs font-outfit font-medium transition-all border ${
                        state.ageGroups.includes(age)
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border text-text-secondary hover:border-accent/50'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-text">Frekuensi Penilaian 4 PILAR</label>
                <div className="grid grid-cols-2 gap-2">
                  {ASSESSMENT_FREQ.map((freq) => (
                    <button
                      key={freq.value}
                      type="button"
                      onClick={() => setState((prev) => ({ ...prev, assessmentFrequency: freq.value }))}
                      className={`py-2.5 px-4 rounded-lg text-sm font-outfit transition-all border ${
                        state.assessmentFrequency === freq.value
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border text-text-secondary hover:border-accent/50'
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => setState((prev) => ({ ...prev, step: 2 }))} className="btn-primary w-full">
                Lanjutkan
              </button>
            </div>
          )}

          {state.step === 2 && (
            <div className="space-y-6">
              <h3 className="font-outfit font-semibold text-white text-lg">
                WhatsApp Gateway (Wablas)
              </h3>
              <p className="text-text-secondary text-sm">
                Konfigurasi WhatsApp untuk invoice dan pengingat otomatis. Bisa diatur nanti.
              </p>

              <div>
                <label className="label-text">Wablas API Key</label>
                <input
                  className="input-field"
                  placeholder="Masukkan API Key Wablas"
                  value={state.wablasApiKey}
                  onChange={(e) => setState((prev) => ({ ...prev, wablasApiKey: e.target.value }))}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setState((prev) => ({ ...prev, step: 3 }))}
                  className="btn-secondary flex-1"
                >
                  Lewati
                </button>
                <button
                  onClick={() => setState((prev) => ({ ...prev, step: 3 }))}
                  className="btn-primary flex-1"
                >
                  Lanjutkan
                </button>
              </div>
            </div>
          )}

          {state.step === 3 && (
            <div className="space-y-6">
              <h3 className="font-outfit font-semibold text-white text-lg">
                Pembayaran
              </h3>
              <p className="text-text-secondary text-sm">
                Konfigurasi rekening untuk pembayaran SPP. Bisa diubah kapan saja di Settings.
              </p>

              <div>
                <label className="label-text">Nama Bank</label>
                <input
                  className="input-field"
                  placeholder="Contoh: BCA, BRI, Mandiri"
                  value={state.bankName}
                  onChange={(e) => setState((prev) => ({ ...prev, bankName: e.target.value }))}
                />
              </div>
              <div>
                <label className="label-text">Nomor Rekening</label>
                <input
                  className="input-field"
                  placeholder="Nomor rekening"
                  value={state.accountNumber}
                  onChange={(e) => setState((prev) => ({ ...prev, accountNumber: e.target.value }))}
                />
              </div>
              <div>
                <label className="label-text">Atas Nama</label>
                <input
                  className="input-field"
                  placeholder="Nama pemilik rekening"
                  value={state.accountName}
                  onChange={(e) => setState((prev) => ({ ...prev, accountName: e.target.value }))}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setState((prev) => ({ ...prev, step: 2 }))}
                  className="btn-secondary flex-1"
                >
                  Kembali
                </button>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Menyimpan...' : 'Selesai & Masuk Dasbor'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
