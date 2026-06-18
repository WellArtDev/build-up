'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/forms/FileUpload';

interface BankAccount {
  id: number; bank: string; accountNumber: string; accountName: string;
}

export default function PaymentGatewayPage() {
  const [activeTab, setActiveTab] = useState('qris');
  const [saved, setSaved] = useState(false);
  const [qrisImage, setQrisImage] = useState('/api/placeholder/300/400');
  const [banks, setBanks] = useState<BankAccount[]>([
    { id: 1, bank: 'BCA', accountNumber: '1234567890', accountName: 'PT BuildUp Indonesia' },
    { id: 2, bank: 'BRI', accountNumber: '0987654321', accountName: 'PT BuildUp Indonesia' },
  ]);
  const [newBank, setNewBank] = useState({ bank: '', accountNumber: '', accountName: '' });
  const [globalQrisEnabled, setGlobalQrisEnabled] = useState(false);
  const [globalTransferEnabled, setGlobalTransferEnabled] = useState(true);

  function addBank() {
    if (!newBank.bank || !newBank.accountNumber || !newBank.accountName) return;
    setBanks((prev) => [...prev, { ...newBank, id: Date.now() }]);
    setNewBank({ bank: '', accountNumber: '', accountName: '' });
  }

  function removeBank(id: number) {
    setBanks((prev) => prev.filter((b) => b.id !== id));
  }

  function handleSave() {
    setSaved(true);
    // In production: POST /api/admin/payment-gateway
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <h1 className="font-playfair italic text-3xl text-white mb-2">Payment Gateway</h1>
      <p className="text-text-secondary text-sm mb-8">Konfigurasi metode pembayaran global untuk seluruh tenant</p>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'qris', label: 'QRIS', icon: '📱' },
          { key: 'transfer', label: 'Transfer Bank', icon: '🏦' },
          { key: 'settings', label: 'Pengaturan Global', icon: '⚙️' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-outfit font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-accent text-canvas'
                : 'bg-surface text-text-secondary border border-border hover:text-white'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* QRIS Tab */}
      {activeTab === 'qris' && (
        <div className="card space-y-4">
          <h3 className="font-outfit font-semibold text-white text-lg mb-2">📱 QRIS Configuration</h3>
          <p className="text-text-secondary text-sm">Upload gambar QRIS yang akan ditampilkan ke orang tua siswa saat pembayaran.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <FileUpload
                onUpload={(url) => setQrisImage(url)}
                label="Upload QRIS Image"
                type="qris"
                accept="image/*"
              />
              <p className="text-text-secondary/50 text-xs mt-2">Rekomendasi: gambar PNG persegi, max 5MB</p>
            </div>

            <div>
              <label className="label-text">Preview QRIS</label>
              <div className="border border-border rounded-xl p-4 bg-white flex items-center justify-center min-h-[200px]">
                <img src={qrisImage} alt="QRIS Preview" className="max-w-[200px] max-h-[200px] object-contain" />
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <label className="flex items-center justify-between p-4 bg-canvas rounded-lg border border-border">
              <div>
                <p className="text-white font-medium">Aktifkan QRIS Global</p>
                <p className="text-text-secondary text-xs">QRIS tersedia untuk semua tenant</p>
              </div>
              <input type="checkbox" checked={globalQrisEnabled} onChange={(e) => setGlobalQrisEnabled(e.target.checked)} className="w-5 h-5 accent-accent" />
            </label>
          </div>
        </div>
      )}

      {/* Transfer Bank Tab */}
      {activeTab === 'transfer' && (
        <div className="card space-y-4">
          <h3 className="font-outfit font-semibold text-white text-lg mb-2">🏦 Rekening Bank</h3>
          <p className="text-text-secondary text-sm">Daftar rekening yang bisa dipilih tenant untuk pembayaran SPP.</p>

          {/* Existing banks */}
          <div className="space-y-2">
            {banks.map((b) => (
              <div key={b.id} className="flex items-center justify-between bg-canvas rounded-lg p-4 border border-border">
                <div className="flex items-center gap-4">
                  <span className="text-white font-bold text-sm min-w-[60px]">{b.bank}</span>
                  <div>
                    <p className="text-white text-sm font-mono">{b.accountNumber}</p>
                    <p className="text-text-secondary text-xs">a.n. {b.accountName}</p>
                  </div>
                </div>
                <button onClick={() => removeBank(b.id)} className="text-red-400 hover:text-red-300 text-xs">Hapus</button>
              </div>
            ))}
          </div>

          {/* Add bank form */}
          <div className="bg-canvas rounded-xl p-4 border border-dashed border-border space-y-3">
            <h4 className="text-text-secondary text-sm font-medium">+ Tambah Rekening Baru</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select className="input-field" value={newBank.bank} onChange={(e) => setNewBank((f) => ({ ...f, bank: e.target.value }))}>
                <option value="">Pilih Bank</option>
                {['BCA', 'BRI', 'BNI', 'Mandiri', 'CIMB Niaga', 'BSI', 'Danamon', 'Permata', 'OCBC', 'Maybank'].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <input className="input-field" placeholder="Nomor Rekening" value={newBank.accountNumber} onChange={(e) => setNewBank((f) => ({ ...f, accountNumber: e.target.value }))} />
              <input className="input-field" placeholder="Atas Nama" value={newBank.accountName} onChange={(e) => setNewBank((f) => ({ ...f, accountName: e.target.value }))} />
            </div>
            <button onClick={addBank} className="btn-primary text-sm">Tambah Rekening</button>
          </div>
        </div>
      )}

      {/* Global Settings Tab */}
      {activeTab === 'settings' && (
        <div className="card space-y-4">
          <h3 className="font-outfit font-semibold text-white text-lg mb-2">⚙️ Pengaturan Pembayaran Global</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-canvas rounded-lg border border-border cursor-pointer hover:border-accent/50">
              <div>
                <p className="text-white font-medium">QRIS Global</p>
                <p className="text-text-secondary text-xs">Semua tenant bisa menerima pembayaran QRIS</p>
              </div>
              <input type="checkbox" checked={globalQrisEnabled} onChange={(e) => setGlobalQrisEnabled(e.target.checked)} className="w-5 h-5 accent-accent" />
            </label>

            <label className="flex items-center justify-between p-4 bg-canvas rounded-lg border border-border cursor-pointer hover:border-accent/50">
              <div>
                <p className="text-white font-medium">Transfer Bank</p>
                <p className="text-text-secondary text-xs">Semua tenant bisa menampilkan nomor rekening pembayaran</p>
              </div>
              <input type="checkbox" checked={globalTransferEnabled} onChange={(e) => setGlobalTransferEnabled(e.target.checked)} className="w-5 h-5 accent-accent" />
            </label>

            <div>
              <label className="label-text">SPP Default (Rp)</label>
              <input type="number" className="input-field max-w-[200px]" defaultValue={150000} />
              <p className="text-text-secondary/50 text-xs mt-1">Jumlah default SPP per bulan — tenant bisa override</p>
            </div>

            <div>
              <label className="label-text">Denda Keterlambatan (Rp/hari)</label>
              <input type="number" className="input-field max-w-[200px]" defaultValue={1000} />
            </div>
          </div>
        </div>
      )}

      <button onClick={handleSave} className="btn-primary mt-6">{saved ? '✅ Tersimpan' : 'Simpan Semua Pengaturan'}</button>
    </div>
  );
}
