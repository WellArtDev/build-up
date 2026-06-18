'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Academy { id: number; name: string; sport_type: string; address: string; }

export default function GuestRegisterPage() {
  const { tenantId } = useParams() as { tenantId: string };
  const router = useRouter();
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [resultCode, setResultCode] = useState('');
  const [form, setForm] = useState({
    name: '', nik: '', nisn: '', date_of_birth: '', gender: 'male',
    position: '', age_group: '', address: '',
    parent_name: '', parent_contact: '', parent_email: '', previous_clubs: '',
  });

  useEffect(() => {
    async function fetchAcademy() {
      try {
        // Use public endpoint
        const res = await fetch(`/api/tenants/${tenantId}`);
        const data = await res.json();
        if (data.success) setAcademy(data.data);
      } catch { /* ignore */ }
    }
    fetchAcademy();
  }, [tenantId]);

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/tenants/${tenantId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setResultCode(data.data.student_code);
        setDone(true);
      } else {
        setError(data.error || 'Pendaftaran gagal');
      }
    } catch {
      setError('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="card-hover p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="font-playfair italic text-2xl text-white mb-2">Pendaftaran Berhasil!</h2>
          <p className="text-text-secondary mb-2">Kode Pendaftaran: <span className="text-accent font-mono">{resultCode}</span></p>
          <p className="text-text-secondary text-sm mb-6">{academy?.name} akan menghubungi Anda melalui kontak yang didaftarkan.</p>
          <button onClick={() => router.push('/discovery')} className="btn-primary">Kembali ke Discovery</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
      <div className="w-full max-w-fluid-sm">
        <div className="card-hover p-8">
          <div className="text-center mb-6">
            <h1 className="font-playfair italic text-3xl text-white mb-2">Pendaftaran Online</h1>
            <p className="text-text-secondary">{academy?.name || '...'} • {academy?.sport_type?.replace('_', ' ') || ''}</p>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4 text-red-400 text-sm">{error}</div>}

          <form onSubmit={(e) => { e.preventDefault(); step === 1 ? setStep(2) : handleSubmit(); }} className="space-y-4">
            {step === 1 && (
              <>
                <div><label className="label-text">Nama Lengkap *</label><input className="input-field" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label-text">NIK</label><input className="input-field" value={form.nik} onChange={(e) => setForm((f) => ({ ...f, nik: e.target.value }))} /></div>
                  <div><label className="label-text">NISN</label><input className="input-field" value={form.nisn} onChange={(e) => setForm((f) => ({ ...f, nisn: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label-text">Tanggal Lahir</label><input type="date" className="input-field" value={form.date_of_birth} onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))} /></div>
                  <div><label className="label-text">Jenis Kelamin</label><select className="input-field" value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}><option value="male">Laki-laki</option><option value="female">Perempuan</option></select></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label-text">Posisi</label><input className="input-field" value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} /></div>
                  <div><label className="label-text">Grup Usia</label><select className="input-field" value={form.age_group} onChange={(e) => setForm((f) => ({ ...f, age_group: e.target.value }))}><option value="">Pilih</option>{['U-8','U-10','U-12','U-14','U-16','U-18','U-21'].map((g) => <option key={g} value={g}>{g}</option>)}</select></div>
                </div>
                <div><label className="label-text">Alamat</label><textarea className="input-field min-h-[60px]" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} /></div>
                <button type="button" onClick={() => setStep(2)} className="btn-primary w-full">Lanjutkan</button>
              </>
            )}
            {step === 2 && (
              <>
                <div><label className="label-text">Nama Orang Tua</label><input className="input-field" value={form.parent_name} onChange={(e) => setForm((f) => ({ ...f, parent_name: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label-text">No. HP Orang Tua</label><input className="input-field" value={form.parent_contact} onChange={(e) => setForm((f) => ({ ...f, parent_contact: e.target.value }))} /></div>
                  <div><label className="label-text">Email Orang Tua</label><input className="input-field" value={form.parent_email} onChange={(e) => setForm((f) => ({ ...f, parent_email: e.target.value }))} /></div>
                </div>
                <div><label className="label-text">Klub Sebelumnya</label><input className="input-field" value={form.previous_clubs} onChange={(e) => setForm((f) => ({ ...f, previous_clubs: e.target.value }))} /></div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">Kembali</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Mendaftar...' : 'Daftar'}</button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
