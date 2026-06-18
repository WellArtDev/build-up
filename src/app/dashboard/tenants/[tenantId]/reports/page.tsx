'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function ReportsPage() {
  const { tenantId } = useParams() as { tenantId: string };
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleExport(type: string) {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/tenants/${tenantId}/export?type=${type}`);
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      setMessage('✅ Export berhasil');
    } catch {
      setMessage('❌ Gagal export');
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateReport(report: string) {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/reports?tenant_id=${tenantId}&report=${report}`);
      const data = await res.json();
      if (data.success) {
        // Download as JSON for now (PDF in production)
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report}_report_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        setMessage('✅ Report siap');
      }
    } catch {
      setMessage('❌ Gagal generate');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-playfair italic text-3xl text-white mb-8">Laporan & Ekspor</h1>

      {/* CSV Export */}
      <div className="card mb-6">
        <h3 className="font-outfit font-semibold text-white mb-4">📥 Ekspor CSV</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { type: 'students', label: '👥 Data Siswa' },
            { type: 'assessments', label: '📋 Penilaian 4 PILAR' },
            { type: 'finances', label: '💰 Transaksi Keuangan' },
          ].map((e) => (
            <button
              key={e.type}
              onClick={() => handleExport(e.type)}
              disabled={loading}
              className="btn-secondary text-sm"
            >
              {e.label} ↓ CSV
            </button>
          ))}
        </div>
      </div>

      {/* Analytic Reports */}
      <div className="card mb-6">
        <h3 className="font-outfit font-semibold text-white mb-4">📊 Laporan Analitik</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { report: 'student_progress', label: '📈 Perkembangan Siswa' },
            { report: 'financial', label: '💵 Ringkasan Keuangan' },
            { report: 'attendance', label: '📊 Statistik Kehadiran' },
          ].map((r) => (
            <button
              key={r.report}
              onClick={() => handleGenerateReport(r.report)}
              disabled={loading}
              className="btn-secondary text-sm"
            >
              {r.label} ↓
            </button>
          ))}
        </div>
      </div>

      {/* Bulking Import */}
      <div className="card">
        <h3 className="font-outfit font-semibold text-white mb-4">📤 Import Massal</h3>
        <p className="text-text-secondary text-sm mb-3">
          Upload file CSV dengan kolom: name, nik, nisn, date_of_birth, gender, position, age_group, address, parent_contact, parent_email
        </p>
        <div className="flex gap-3 items-center">
          <input
            type="file"
            accept=".csv"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setLoading(true);
              setMessage('');
              try {
                const text = await file.text();
                const lines = text.split('\n').filter((l) => l.trim());
                if (lines.length < 2) throw new Error('File kosong');
                const headers = lines[0].split(',').map((h) => h.trim());
                const rows = lines.slice(1).map((line) => {
                  const vals = line.split(',').map((v) => v.trim());
                  const obj: Record<string, string> = {};
                  headers.forEach((h, i) => (obj[h] = vals[i] || ''));
                  return obj;
                });

                const res = await fetch(`/api/tenants/${tenantId}/import`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ rows }),
                });
                const data = await res.json();
                if (data.success) {
                  setMessage(`✅ ${data.data.imported} import berhasil, ${data.data.skipped} dilewati${data.data.errors.length ? '. ' + data.data.errors.join('; ') : ''}`);
                }
              } catch {
                setMessage('❌ Gagal parse CSV');
              } finally {
                setLoading(false);
              }
            }}
            className="text-sm text-text-secondary file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border file:border-border file:bg-surface file:text-white file:text-sm file:cursor-pointer hover:file:border-accent"
          />
        </div>
        {message && <p className={`text-sm mt-3 ${message.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{message}</p>}
      </div>
    </div>
  );
}
