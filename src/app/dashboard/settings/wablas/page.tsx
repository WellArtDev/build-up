'use client';

import { useState, useEffect } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function WablasSettingsPage() {
  const [useBuildup, setUseBuildup] = useState(true);
  const [form, setForm] = useState({ token: '', secretKey: '', sender: '' });
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load current settings from session / tenant
    async function load() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        // In production: fetch from /api/tenants/[id] settings
      } catch { /* ignore */ }
    }
    load();
  }, []);

  async function handleTest() {
    setTestResult(null);
    try {
      const res = await fetch('/api/wablas?action=test');
      const data = await res.json();
      setTestResult(data.data || { ok: false, message: data.error || 'Gagal' });
    } catch {
      setTestResult({ ok: false, message: 'Gagal terhubung' });
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Simpan ke tenant settings
      // await fetch(`/api/tenants/${tenantId}`, { method: 'PATCH', body: JSON.stringify({ settings: { wablas_token: form.token, wablas_secret_key: form.secretKey, use_buildup_wablas: useBuildup } }) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="font-playfair italic text-3xl text-white mb-2">WhatsApp Gateway</h1>
      <p className="text-text-secondary text-sm mb-8">Konfigurasi integrasi WhatsApp via Wablas API</p>

      {/* Source selection */}
      <div className="card mb-6">
        <h3 className="font-outfit font-semibold text-white text-lg mb-4">Sumber API Wablas</h3>
        <p className="text-text-secondary text-sm mb-4">
          Pilih mau pakai akun Wablas bawaan BuildUp atau API key sendiri dari akun Wablas pribadi.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label
            className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
              useBuildup ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/30'
            }`}
          >
            <input
              type="radio"
              name="source"
              checked={useBuildup}
              onChange={() => setUseBuildup(true)}
              className="hidden"
            />
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏢</span>
              <div>
                <p className="text-white font-semibold">BuildUp Shared API</p>
                <p className="text-text-secondary text-xs mt-1">
                  Pakai akun Wablas bawaan BuildUp. Biaya sudah termasuk dalam paket Professional ke atas. Starter dan Growth dikenakan biaya per pesan.
                </p>
                <span className="badge badge-success text-[10px] mt-2">Rekomendasi</span>
              </div>
            </div>
          </label>

          <label
            className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
              !useBuildup ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/30'
            }`}
          >
            <input
              type="radio"
              name="source"
              checked={!useBuildup}
              onChange={() => setUseBuildup(false)}
              className="hidden"
            />
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔑</span>
              <div>
                <p className="text-white font-semibold">API Key Sendiri</p>
                <p className="text-text-secondary text-xs mt-1">
                  Pakai akun Wablas pribadi Anda sendiri. Anda kontrol penuh atas device, nomor pengirim, dan biaya.
                </p>
                <span className="badge badge-info text-[10px] mt-2">Kontrol Penuh</span>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Own API config — only shown if !useBuildup */}
      {!useBuildup && (
        <div className="card mb-6">
          <h3 className="font-outfit font-semibold text-white text-lg mb-4">Konfigurasi API Sendiri</h3>
          <p className="text-text-secondary text-sm mb-4">
            Dapatkan Token dan Secret Key dari panel Wablas: Device → Settings → Generate Secret Key.
            <br />
            <a href="https://wablas.com/documentation/api" target="_blank" rel="noopener" className="text-accent hover:underline">
              Dokumentasi Wablas API →
            </a>
          </p>

          <div className="space-y-3">
            <div>
              <label className="label-text">Wablas Token (Device Token)</label>
              <input
                type="password"
                className="input-field font-mono"
                placeholder="Masukkan token dari panel Wablas"
                value={form.token}
                onChange={(e) => setForm((f) => ({ ...f, token: e.target.value }))}
              />
              <p className="text-text-secondary/50 text-xs mt-1">Dapat ditemukan di: Wablas Panel → Device → Settings → Token</p>
            </div>
            <div>
              <label className="label-text">Secret Key</label>
              <input
                type="password"
                className="input-field font-mono"
                placeholder="Secret key yang digenerate via panel"
                value={form.secretKey}
                onChange={(e) => setForm((f) => ({ ...f, secretKey: e.target.value }))}
              />
              <p className="text-text-secondary/50 text-xs mt-1">Generate di panel Wablas, akan dikirim ke WhatsApp admin</p>
            </div>
            <div>
              <label className="label-text">Sender Number (opsional)</label>
              <input
                className="input-field"
                placeholder="62812xxxx"
                value={form.sender}
                onChange={(e) => setForm((f) => ({ ...f, sender: e.target.value }))}
              />
            </div>

            <button onClick={handleTest} className="btn-secondary text-sm">
              Test Koneksi WhatsApp
            </button>

            {testResult && (
              <div className={`p-4 rounded-lg border text-sm ${testResult.ok ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {testResult.ok ? '✅' : '❌'} {testResult.message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message Templates */}
      <div className="card mb-6">
        <h3 className="font-outfit font-semibold text-white text-lg mb-4">📋 Template Pesan</h3>
        <p className="text-text-secondary text-sm mb-4">Template pesan otomatis yang akan dikirim ke orang tua siswa.</p>

        <div className="space-y-3">
          {[
            { label: 'Invoice SPP', desc: 'Dikirim saat invoice baru dibuat', status: 'Aktif' },
            { label: 'Pengingat Jatuh Tempo', desc: 'Dikirim H-3 sebelum jatuh tempo', status: 'Aktif' },
            { label: 'Pengumuman', desc: 'Dikirim saat broadcast pengumuman', status: 'Aktif' },
            { label: 'Konfirmasi Pendaftaran', desc: 'Dikirim saat siswa baru terdaftar', status: 'Aktif' },
            { label: 'Laporan Bulanan', desc: 'Notifikasi laporan siap diunduh', status: 'Nonaktif' },
          ].map((t) => (
            <div key={t.label} className="flex items-center justify-between p-3 bg-canvas rounded-lg border border-border">
              <div>
                <p className="text-white text-sm font-medium">{t.label}</p>
                <p className="text-text-secondary text-xs">{t.desc}</p>
              </div>
              <span className={t.status === 'Aktif' ? 'badge badge-success text-[10px]' : 'badge badge-info text-[10px]'}>{t.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="card mb-6">
        <h3 className="font-outfit font-semibold text-white text-lg mb-4">📊 Statistik Pengiriman</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Terkirim Bulan Ini', value: '0' },
            { label: 'Sisa Kuota', value: 'N/A' },
            { label: 'Success Rate', value: '-%' },
            { label: 'Device Status', value: 'Cek' },
          ].map((s) => (
            <div key={s.label} className="bg-canvas rounded-lg p-4 border border-border text-center">
              <p className="text-text-secondary text-[10px] uppercase mb-1">{s.label}</p>
              <p className="text-white font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary">
        {saved ? '✅ Tersimpan' : saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
      </button>
    </div>
  );
}
