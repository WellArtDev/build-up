'use client';

import { useState } from 'react';

export default function SuperAdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    wablasApiKey: '',
    wablasSender: '',
    defaultTrialDays: '15',
    maxFileSizeMb: '5',
    platformFeePercent: '0',
  });

  return (
    <div>
      <h1 className="font-playfair italic text-3xl text-white mb-8">Pengaturan Sistem</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WhatsApp Gateway */}
        <div className="card">
          <h3 className="font-outfit font-semibold text-white text-lg mb-4">📱 WhatsApp Gateway (Wablas)</h3>
          <p className="text-text-secondary text-sm mb-4">Konfigurasi default Wablas API untuk semua tenant. Tenant bisa override di Settings masing-masing.</p>
          <div className="space-y-3">
            <div>
              <label className="label-text">Wablas API Key</label>
              <input type="password" className="input-field" placeholder="API Key dari panel Wablas" value={form.wablasApiKey} onChange={(e) => setForm((f) => ({ ...f, wablasApiKey: e.target.value }))} />
            </div>
            <div>
              <label className="label-text">Sender Number</label>
              <input className="input-field" placeholder="62812xxxx" value={form.wablasSender} onChange={(e) => setForm((f) => ({ ...f, wablasSender: e.target.value }))} />
            </div>
            <button className="btn-secondary text-sm">Test Koneksi WhatsApp</button>
          </div>
        </div>

        {/* General Settings */}
        <div className="card">
          <h3 className="font-outfit font-semibold text-white text-lg mb-4">⚙️ Pengaturan Umum</h3>
          <div className="space-y-3">
            <div>
              <label className="label-text">Masa Trial (hari)</label>
              <input type="number" className="input-field" value={form.defaultTrialDays} onChange={(e) => setForm((f) => ({ ...f, defaultTrialDays: e.target.value }))} />
            </div>
            <div>
              <label className="label-text">Max Upload File (MB)</label>
              <input type="number" className="input-field" value={form.maxFileSizeMb} onChange={(e) => setForm((f) => ({ ...f, maxFileSizeMb: e.target.value }))} />
            </div>
            <div>
              <label className="label-text">Platform Fee (%)</label>
              <input type="number" className="input-field" value={form.platformFeePercent} onChange={(e) => setForm((f) => ({ ...f, platformFeePercent: e.target.value }))} />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Gateway */}
      <div className="card mt-6">
        <h3 className="font-outfit font-semibold text-white text-lg mb-4">💳 Payment Gateway Default</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center justify-between p-4 bg-canvas rounded-lg border border-border cursor-pointer hover:border-accent/50">
            <div><p className="text-white font-medium">QRIS</p><p className="text-text-secondary text-xs">Aktifkan pembayaran QRIS untuk seluruh tenant</p></div>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-accent" />
          </label>
          <label className="flex items-center justify-between p-4 bg-canvas rounded-lg border border-border cursor-pointer hover:border-accent/50">
            <div><p className="text-white font-medium">Bank Transfer</p><p className="text-text-secondary text-xs">Aktifkan transfer bank untuk seluruh tenant</p></div>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-accent" />
          </label>
        </div>
      </div>

      <button
        onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
        className="btn-primary mt-6"
      >
        {saved ? '✅ Tersimpan' : 'Simpan Pengaturan'}
      </button>
    </div>
  );
}
