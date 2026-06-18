'use client';

import { useState } from 'react';

export default function DatabaseManagementPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [dbStatus, setDbStatus] = useState<{ tables: number; counts: Record<string, number>; dbName: string; timestamp: string } | null>(null);
  const [error, setError] = useState('');

  async function runAction(action: string) {
    setLoading(true); setError(''); setResults([]);
    try {
      const res = await fetch('/api/admin/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        if (action === 'status') {
          setDbStatus(data.data);
        } else {
          setResults(data.data.results || ['Done']);
        }
      } else {
        setError(data.error || 'Gagal');
      }
    } catch {
      setError('Gagal terhubung ke server');
    } finally { setLoading(false); }
  }

  return (
    <div>
      <h1 className="font-playfair italic text-3xl text-white mb-8">Manajemen Database</h1>
      <p className="text-text-secondary text-sm mb-6">Jalankan operasi database tanpa SSH — langsung dari dashboard super admin.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions */}
        <div className="card">
          <h3 className="font-outfit font-semibold text-white text-lg mb-4">⚡ Operasi Database</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { action: 'status', label: '📊 Status', desc: 'Lihat jumlah data per tabel', color: 'btn-secondary' },
              { action: 'migrate', label: '🗄️ Migrate', desc: 'Jalankan schema.sql (buat tabel baru)', color: 'btn-secondary' },
              { action: 'indexes', label: '⚡ Indexes', desc: 'Tambahkan index performance', color: 'btn-secondary' },
              { action: 'demo-data', label: '🎲 Demo Data', desc: 'Import data demo SSB Garuda', color: 'btn-primary' },
            ].map((btn) => (
              <button key={btn.action} onClick={() => runAction(btn.action)} disabled={loading} className={`${btn.color} text-xs py-3 px-4 text-left`}>
                <div className="font-semibold mb-0.5">{btn.label}</div>
                <div className="opacity-60 text-[11px]">{btn.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Status / Results */}
        <div className="card">
          <h3 className="font-outfit font-semibold text-white text-lg mb-4">📋 Output</h3>
          {loading && <p className="text-text-secondary text-sm animate-pulse">⏳ Menjalankan...</p>}
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm mb-3">{error}</div>}

          {dbStatus && (
            <div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-canvas rounded-lg p-3 border border-border text-center">
                  <p className="text-accent font-bold text-xl">{dbStatus.tables}</p>
                  <p className="text-text-secondary text-[10px]">Tabel</p>
                </div>
                <div className="bg-canvas rounded-lg p-3 border border-border text-center">
                  <p className="text-white font-bold text-xs">{dbStatus.dbName}</p>
                  <p className="text-text-secondary text-[10px]">Database</p>
                </div>
              </div>
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {Object.entries(dbStatus.counts).map(([table, count]) => (
                  <div key={table} className="flex justify-between text-xs py-1.5 px-2 rounded hover:bg-surface">
                    <span className="text-text-secondary">{table}</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {results.map((r, i) => (
                <div key={i} className={`text-xs py-1.5 px-2 rounded font-mono ${r.startsWith('✓') ? 'text-green-400 bg-green-500/5' : r.startsWith('✗') ? 'text-red-400 bg-red-500/5' : 'text-text-secondary/60'}`}>
                  {r}
                </div>
              ))}
            </div>
          )}

          {!dbStatus && results.length === 0 && !loading && (
            <p className="text-text-secondary/50 text-sm py-8 text-center">Pilih operasi database di sebelah kiri</p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="card mt-6">
        <h3 className="font-outfit font-semibold text-white text-lg mb-2">ℹ️ Cara Pakai</h3>
        <div className="text-text-secondary text-sm space-y-2">
          <p><strong>Status</strong> — Cek jumlah data di setiap tabel. Aman, tidak mengubah data.</p>
          <p><strong>Migrate</strong> — Jalankan schema.sql untuk membuat tabel baru. Aman dijalankan ulang (pakai IF NOT EXISTS).</p>
          <p><strong>Indexes</strong> — Tambahkan index untuk performa query. Jalankan setelah import data besar.</p>
          <p><strong>Demo Data</strong> — Import data demo ke tenant SSB Garuda Muda. Aman (pakai INSERT IGNORE).</p>
        </div>
      </div>
    </div>
  );
}
