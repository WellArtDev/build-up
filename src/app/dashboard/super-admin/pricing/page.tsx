'use client';

import { useState } from 'react';

interface PricingTier {
  id: number; name: string; price: string; students: string; features: string[];
  popular: boolean; active: boolean;
}

const INITIAL_TIERS: PricingTier[] = [
  {
    id: 1, name: 'Starter', price: '99000', students: '1–30',
    features: ['1 Cabang Olahraga', 'Manajemen Siswa Dasar', 'Jadwal & Absensi', 'Penilaian 4 PILAR', 'Laporan Bulanan', 'Support WhatsApp'],
    popular: false, active: true,
  },
  {
    id: 2, name: 'Growth', price: '249000', students: '31–100',
    features: ['Multi Olahraga', 'Analitik Lanjutan', 'Portal Orang Tua', 'Ekspor Laporan PDF', 'Integrasi WhatsApp', '5 Akun Coach', 'Support Prioritas'],
    popular: true, active: true,
  },
  {
    id: 3, name: 'Professional', price: '499000', students: '101–300',
    features: ['Semua Fitur Growth', 'WhatsApp Automation', 'Custom Reports', 'Tournament Management', '15 Akun Coach', 'API Access', 'Dedicated Account Manager'],
    popular: false, active: true,
  },
  {
    id: 4, name: 'Enterprise', price: 'Custom', students: '300+',
    features: ['Semua Fitur Professional', 'White Label', 'Custom Integrations', 'Unlimited Coaches', 'SLA 99.9%', 'On-premise Option', 'Dedicated Support Team'],
    popular: false, active: true,
  },
];

const AVAILABLE_FEATURES = [
  'Manajemen Siswa Dasar', 'Jadwal & Absensi', 'Penilaian 4 PILAR', 'Laporan Bulanan',
  'Support WhatsApp', 'Multi Olahraga', 'Analitik Lanjutan', 'Portal Orang Tua',
  'Ekspor Laporan PDF', 'Integrasi WhatsApp', '5 Akun Coach', 'Support Prioritas',
  'WhatsApp Automation', 'Custom Reports', 'Tournament Management', '15 Akun Coach',
  'API Access', 'Dedicated Account Manager', 'White Label', 'Custom Integrations',
  'Unlimited Coaches', 'SLA 99.9%', 'On-premise Option', 'Dedicated Support Team',
  '1 Cabang Olahraga', 'Sertifikat Digital', 'Import/Export CSV', 'Papan Drag-Drop Coach',
];

export default function PricingManagementPage() {
  const [tiers, setTiers] = useState<PricingTier[]>(INITIAL_TIERS);
  const [editId, setEditId] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  function startEdit(id: number) { setEditId(id); }
  function cancelEdit() { setEditId(null); }

  function updateTier(id: number, field: string, value: string | boolean | string[]) {
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  }

  function toggleFeature(tierId: number, feature: string) {
    setTiers((prev) => prev.map((t) => {
      if (t.id !== tierId) return t;
      if (t.features.includes(feature)) return { ...t, features: t.features.filter((f) => f !== feature) };
      return { ...t, features: [...t.features, feature] };
    }));
  }

  function handleSave() {
    setSaved(true);
    setEditId(null);
    // In production: POST /api/admin/pricing
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair italic text-3xl text-white mb-2">Manajemen Harga & Fitur</h1>
          <p className="text-text-secondary text-sm">Edit pricing tiers, tambah/hapus fitur per paket</p>
        </div>
        <button onClick={handleSave} className="btn-primary">{saved ? '✅ Tersimpan' : 'Simpan Perubahan'}</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {tiers.map((tier) => (
          <div key={tier.id} className={`card-hover ${tier.popular ? 'border-accent border-2' : ''}`}>
            {tier.popular && (
              <div className="bg-accent text-canvas font-outfit font-semibold text-xs px-3 py-1 rounded-full text-center -mt-8 mx-auto w-fit mb-2">
                Paling Populer
              </div>
            )}

            {editId === tier.id ? (
              /* Edit mode */
              <div className="space-y-3">
                <input className="input-field text-lg font-bold" value={tier.name} onChange={(e) => updateTier(tier.id, 'name', e.target.value)} />
                <div className="flex gap-2 items-center">
                  <span className="text-text-secondary text-sm">Rp</span>
                  <input className="input-field" value={tier.price} onChange={(e) => updateTier(tier.id, 'price', e.target.value)} disabled={tier.name === 'Enterprise'} />
                </div>
                <input className="input-field" value={tier.students} onChange={(e) => updateTier(tier.id, 'students', e.target.value)} placeholder="Range siswa" />
                <div>
                  <label className="label-text text-[10px]">Fitur (klik untuk toggle)</label>
                  <div className="flex flex-wrap gap-1 max-h-[200px] overflow-y-auto">
                    {AVAILABLE_FEATURES.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => toggleFeature(tier.id, f)}
                        className={`text-[10px] px-2 py-1 rounded-full border transition-all ${tier.features.includes(f) ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-secondary/50'}`}
                      >
                        {tier.features.includes(f) ? '✓ ' : '+ '}{f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={tier.popular} onChange={(e) => updateTier(tier.id, 'popular', e.target.checked)} className="accent-accent" /> Popular
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={tier.active} onChange={(e) => updateTier(tier.id, 'active', e.target.checked)} className="accent-accent" /> Aktif
                  </label>
                </div>
                <button onClick={cancelEdit} className="btn-ghost text-xs w-full">Selesai Edit</button>
              </div>
            ) : (
              /* Display mode */
              <>
                <div className="text-center mb-4">
                  <h3 className="font-playfair italic text-2xl text-white mb-1">{tier.name}</h3>
                  <p className="text-text-secondary text-xs mb-3">{tier.students} siswa</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-text-secondary text-xs">Rp</span>
                    <span className="font-outfit font-bold text-3xl text-white">{tier.price === 'Custom' ? 'Custom' : Number(tier.price).toLocaleString('id-ID')}</span>
                    {tier.price !== 'Custom' && <span className="text-text-secondary text-xs">/bulan</span>}
                  </div>
                </div>
                <ul className="space-y-2 mb-4 text-sm">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-text-secondary">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2 items-center">
                  {tier.active ? <span className="badge badge-success text-[10px]">Aktif</span> : <span className="badge badge-danger text-[10px]">Nonaktif</span>}
                  <button onClick={() => startEdit(tier.id)} className="btn-ghost text-xs ml-auto">✏️ Edit</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
