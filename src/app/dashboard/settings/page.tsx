'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CardSkeleton } from '@/components/ui/Skeleton';

interface AcademySettings {
  id: number;
  name: string;
  slug: string;
  sport_type: string;
  address: string;
  phone: string;
  email: string;
  subscription_tier: string;
  subscription_status: string;
  settings: {
    wablas_token?: string;
    wablas_secret_key?: string;
    use_buildup_wablas?: boolean;
    qris_enabled?: boolean;
    bank_transfer_enabled?: boolean;
    logo_url?: string;
  };
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session?.user as any;
  const tenantId = user?.tenantId;

  const [form, setForm] = useState({
    name: '', address: '', phone: '', email: '',
    useBuildupWablas: true,
    wablasToken: '', wablasSecretKey: '',
    qrisEnabled: false, bankTransferEnabled: false,
  });

  useEffect(() => {
    if (!tenantId) return;
    async function fetchSettings() {
      try {
        const res = await fetch(`/api/tenants/${tenantId}`);
        const data = await res.json();
        if (data.success) {
          const s: AcademySettings = data.data;
          setForm({
            name: s.name || '', address: s.address || '',
            phone: s.phone || '', email: s.email || '',
            useBuildupWablas: s.settings?.use_buildup_wablas !== false,
            wablasToken: s.settings?.wablas_token || '',
            wablasSecretKey: s.settings?.wablas_secret_key || '',
            qrisEnabled: s.settings?.qris_enabled || false,
            bankTransferEnabled: s.settings?.bank_transfer_enabled || false,
          });
        }
      } catch { /* ignore */ } finally { setLoading(false); }
    }
    fetchSettings();
  }, [tenantId]);

  async function handleSave() {
    if (!tenantId) return;
    setSaving(true);
    setMessage('');
    try {
      const settingsPayload: Record<string, unknown> = {
        use_buildup_wablas: form.useBuildupWablas,
        wablas_token: form.wablasToken,
        wablas_secret_key: form.wablasSecretKey,
        qris_enabled: form.qrisEnabled,
        bank_transfer_enabled: form.bankTransferEnabled,
      };

      const res = await fetch(`/api/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, address: form.address,
          phone: form.phone, email: form.email,
          settings: settingsPayload,
        }),
      });
      const data = await res.json();
      setMessage(data.success ? '✅ Pengaturan berhasil disimpan' : '❌ Gagal menyimpan');
    } catch {
      setMessage('❌ Gagal terhubung ke server');
    } finally { setSaving(false); }
  }

  async function handleTestWablas() {
    try {
      const res = await fetch('/api/wablas?action=test');
      const data = await res.json();
      setTestResult(data.data || { ok: false, message: data.error || 'Gagal' });
    } catch {
      setTestResult({ ok: false, message: 'Gagal terhubung' });
    }
  }

  if (loading) {
    return <div><h1 className="font-playfair italic text-3xl text-white mb-8">Pengaturan</h1><CardSkeleton /></div>;
  }

  const tabs = [
    { key: 'profile', label: 'Profil Akademi' },
    { key: 'whatsapp', label: 'WhatsApp' },
    { key: 'payments', label: 'Pembayaran' },
    { key: 'subscription', label: 'Langganan' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-playfair italic text-3xl text-white mb-2">Pengaturan Akademi</h1>
        <p className="text-text-secondary text-sm">Konfigurasi akademi Anda</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-outfit font-medium transition-all ${
              activeTab === tab.key ? 'bg-accent text-canvas' : 'bg-surface text-text-secondary border border-border hover:text-white'
            }`}>{tab.label}</button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card space-y-4">
          <h3 className="font-outfit font-semibold text-white text-lg mb-2">Profil Akademi</h3>
          <div><label className="label-text">Nama Akademi</label><input className="input-field" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="label-text">Alamat</label><textarea className="input-field min-h-[80px]" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="label-text">Telepon</label><input className="input-field" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
            <div><label className="label-text">Email</label><input className="input-field" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
          </div>
        </div>
      )}

      {/* WhatsApp Tab — Full Wablas settings */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-6">
          {/* Source selection */}
          <div className="card">
            <h3 className="font-outfit font-semibold text-white text-lg mb-4">Sumber API Wablas</h3>
            <p className="text-text-secondary text-sm mb-4">
              Pilih mau pakai akun Wablas bawaan BuildUp atau API key sendiri dari akun Wablas pribadi Anda.
              {' '}<a href="https://wablas.com/documentation/api" target="_blank" rel="noopener" className="text-accent hover:underline">Dokumentasi Wablas API →</a>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${form.useBuildupWablas ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/30'}`}>
                <input type="radio" name="wablasSource" checked={form.useBuildupWablas} onChange={() => setForm((f) => ({ ...f, useBuildupWablas: true }))} className="hidden" />
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏢</span>
                  <div>
                    <p className="text-white font-semibold">BuildUp Shared API</p>
                    <p className="text-text-secondary text-xs mt-1">Pakai akun Wablas bawaan BuildUp. Biaya sudah termasuk dalam paket Professional ke atas.</p>
                    <span className="badge badge-success text-[10px] mt-2">Rekomendasi</span>
                  </div>
                </div>
              </label>
              <label className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${!form.useBuildupWablas ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/30'}`}>
                <input type="radio" name="wablasSource" checked={!form.useBuildupWablas} onChange={() => setForm((f) => ({ ...f, useBuildupWablas: false }))} className="hidden" />
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔑</span>
                  <div>
                    <p className="text-white font-semibold">API Key Sendiri</p>
                    <p className="text-text-secondary text-xs mt-1">Pakai akun Wablas pribadi Anda. Kontrol penuh atas device, nomor pengirim, dan biaya.</p>
                    <span className="badge badge-info text-[10px] mt-2">Kontrol Penuh</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Own API fields — only if !useBuildupWablas */}
          {!form.useBuildupWablas && (
            <div className="card space-y-3">
              <h3 className="font-outfit font-semibold text-white text-lg mb-2">Konfigurasi Wablas Sendiri</h3>
              <div>
                <label className="label-text">Wablas Token (Device Token)</label>
                <input type="password" className="input-field font-mono" placeholder="Token dari panel Wablas → Device → Settings" value={form.wablasToken} onChange={(e) => setForm((f) => ({ ...f, wablasToken: e.target.value }))} />
                <p className="text-text-secondary/50 text-xs mt-1">Dari Wablas Panel → Device → Settings → Token</p>
              </div>
              <div>
                <label className="label-text">Secret Key</label>
                <input type="password" className="input-field font-mono" placeholder="Generate via Wablas Panel" value={form.wablasSecretKey} onChange={(e) => setForm((f) => ({ ...f, wablasSecretKey: e.target.value }))} />
                <p className="text-text-secondary/50 text-xs mt-1">Generate di panel, dikirim ke WhatsApp admin</p>
              </div>
              <button onClick={handleTestWablas} className="btn-secondary text-sm">Test Koneksi WhatsApp</button>
              {testResult && (
                <div className={`p-4 rounded-lg border text-sm ${testResult.ok ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  {testResult.ok ? '✅' : '❌'} {testResult.message}
                </div>
              )}
            </div>
          )}

          {/* Template info */}
          <div className="card">
            <h3 className="font-outfit font-semibold text-white text-lg mb-4">📋 Template Pesan</h3>
            <div className="space-y-2">
              {[
                { label: 'Invoice SPP', desc: 'Dikirim saat invoice baru', status: 'Aktif' },
                { label: 'Pengingat Jatuh Tempo', desc: 'H-3 sebelum jatuh tempo', status: 'Aktif' },
                { label: 'Pengumuman Broadcast', desc: 'Saat broadcast pengumuman', status: 'Aktif' },
                { label: 'Konfirmasi Pendaftaran', desc: 'Siswa baru terdaftar', status: 'Aktif' },
              ].map((t) => (
                <div key={t.label} className="flex items-center justify-between p-3 bg-canvas rounded-lg border border-border">
                  <div><p className="text-white text-sm font-medium">{t.label}</p><p className="text-text-secondary text-xs">{t.desc}</p></div>
                  <span className="badge badge-success text-[10px]">{t.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="card space-y-4">
          <h3 className="font-outfit font-semibold text-white text-lg mb-2">Metode Pembayaran</h3>
          <p className="text-text-secondary text-sm">Aktifkan metode pembayaran yang tersedia untuk orang tua siswa.</p>
          <label className="flex items-center justify-between p-4 bg-canvas rounded-lg border border-border cursor-pointer hover:border-accent/50">
            <div><p className="text-white font-medium">QRIS</p><p className="text-text-secondary text-xs">Pembayaran via scan QR</p></div>
            <input type="checkbox" checked={form.qrisEnabled} onChange={(e) => setForm((f) => ({ ...f, qrisEnabled: e.target.checked }))} className="w-5 h-5 accent-accent" />
          </label>
          <label className="flex items-center justify-between p-4 bg-canvas rounded-lg border border-border cursor-pointer hover:border-accent/50">
            <div><p className="text-white font-medium">Transfer Bank</p><p className="text-text-secondary text-xs">Pembayaran via transfer bank</p></div>
            <input type="checkbox" checked={form.bankTransferEnabled} onChange={(e) => setForm((f) => ({ ...f, bankTransferEnabled: e.target.checked }))} className="w-5 h-5 accent-accent" />
          </label>
        </div>
      )}

      {/* Subscription Tab */}
      {activeTab === 'subscription' && (
        <div className="card space-y-4">
          <h3 className="font-outfit font-semibold text-white text-lg mb-2">Paket Langganan</h3>
          <div className="bg-canvas rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div><p className="text-white font-bold text-xl">Starter</p><p className="text-text-secondary text-sm">1-30 siswa • 1 olahraga</p></div>
              <span className="badge badge-info">Trial • 15 hari</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['growth', 'professional', 'enterprise'].map((tier) => (
                <div key={tier} className="bg-surface rounded-lg p-4 border border-border text-center opacity-50">
                  <p className="text-white font-semibold capitalize">{tier}</p>
                  <button className="btn-secondary text-xs mt-2" disabled>Segera</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center gap-4">
        <button onClick={() => handleSave()} disabled={saving} className="btn-primary">
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
        {message && (
          <span className={`text-sm ${message.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{message}</span>
        )}
      </div>
    </div>
  );
}
