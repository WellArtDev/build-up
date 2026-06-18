'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StatCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface Profile {
  id: number;
  student_code: string;
  name: string;
  nik: string;
  nisn: string;
  date_of_birth: string;
  gender: string;
  position: string;
  age_group: string;
  photo: string | null;
  address: string;
  parent_contact: string;
  parent_email: string;
  previous_clubs: string;
  status: string;
  enrollment_date: string;
}
interface Assessment { id: number; assessment_date: string; assessment_period: string; coach_notes: string; }

export default function StudentDetailPage() {
  const { tenantId } = useParams() as { tenantId: string; studentId: string };
  const router = useRouter();
  const studentId = useParams().studentId as string;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Profile>>({});

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, aRes] = await Promise.all([
        fetch(`/api/tenants/${tenantId}/students?search=${studentId}`),
        fetch(`/api/tenants/${tenantId}/assessments?student_id=${studentId}`),
      ]);
      const [pData, aData] = await Promise.all([pRes.json(), aRes.json()]);
      if (pData.success) {
        const found = pData.data.find((s: Profile) => s.id === Number(studentId));
        setProfile(found || null);
        if (found) setForm(found);
      }
      if (aData.success) setAssessments(aData.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [tenantId, studentId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function handleSave() {
    try {
      await fetch(`/api/tenants/${tenantId}/students/${studentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setEditing(false);
      fetchAll();
    } catch { /* ignore */ }
  }

  if (loading) return <div><h1 className="font-playfair italic text-3xl text-white mb-8">Profil Siswa</h1><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></div>;
  if (!profile) return <EmptyState title="Siswa tidak ditemukan" action={<button onClick={() => router.back()} className="btn-secondary">Kembali</button>} />;

  const pilarAvg = (a: Assessment) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aa = a as any;
    const vals = [aa.technical_first_touch, aa.technical_passing, aa.technical_dribbling, aa.technical_shooting,
      aa.tactical_positioning, aa.tactical_decision_making,
      aa.physical_stamina, aa.physical_speed_agility, aa.physical_strength,
      aa.mental_discipline, aa.mental_teamwork, aa.mental_fighting_spirit].filter(Number);
    return vals.length ? Math.round((vals.reduce((s: number, v: number) => s + v, 0) / vals.length) * 10) / 10 : 0;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="btn-ghost text-sm">← Kembali</button>
        <button onClick={() => setEditing(!editing)} className="btn-secondary text-sm">{editing ? 'Batal Edit' : 'Edit Profil'}</button>
      </div>

      {/* Profile Card */}
      <div className="card mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-3xl font-bold text-accent">
            {profile.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="font-playfair italic text-2xl text-white mb-1">{profile.name}</h1>
            <p className="text-accent font-mono text-sm">{profile.student_code}</p>
            <p className="text-text-secondary text-xs mt-1">{profile.position || 'Posisi belum diset'} • {profile.age_group || '-'}</p>
          </div>
          <span className={`badge ${profile.status === 'active' ? 'badge-success' : profile.status === 'alumni' ? 'badge-info' : 'badge-danger'}`}>{profile.status}</span>
        </div>
        {editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label-text">Nama</label><input className="input-field" value={form.name || ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
              <div><label className="label-text">Posisi</label><input className="input-field" value={form.position || ''} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label-text">NIK</label><input className="input-field" value={form.nik || ''} onChange={(e) => setForm((f) => ({ ...f, nik: e.target.value }))} /></div>
              <div><label className="label-text">NISN</label><input className="input-field" value={form.nisn || ''} onChange={(e) => setForm((f) => ({ ...f, nisn: e.target.value }))} /></div>
            </div>
            <div><label className="label-text">Alamat</label><textarea className="input-field min-h-[60px]" value={form.address || ''} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label-text">HP Orang Tua</label><input className="input-field" value={form.parent_contact || ''} onChange={(e) => setForm((f) => ({ ...f, parent_contact: e.target.value }))} /></div>
              <div><label className="label-text">Email Orang Tua</label><input className="input-field" value={form.parent_email || ''} onChange={(e) => setForm((f) => ({ ...f, parent_email: e.target.value }))} /></div>
            </div>
            <button onClick={handleSave} className="btn-primary text-sm">Simpan</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[['NIK', profile.nik], ['NISN', profile.nisn], ['Tgl Lahir', profile.date_of_birth], ['Gender', profile.gender === 'male' ? 'Laki-laki' : 'Perempuan'],
              ['HP Ortu', profile.parent_contact], ['Email Ortu', profile.parent_email], ['Terdaftar', profile.enrollment_date]].map(([k, v]) => (
              <div key={k as string}><p className="text-text-secondary text-[10px] uppercase">{k}</p><p className="text-white text-xs">{v || '-'}</p></div>
            ))}
          </div>
        )}
      </div>

      {/* Assessment History */}
      <div className="card mb-6">
        <h3 className="font-outfit font-semibold text-white mb-3">Riwayat Penilaian 4 PILAR</h3>
        {assessments.length === 0 ? <p className="text-text-secondary text-sm">Belum ada penilaian</p> : (
          <div className="space-y-2">
            {assessments.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center justify-between bg-canvas rounded-lg px-4 py-2 border border-border">
                <div><p className="text-white text-sm">{a.assessment_period || a.assessment_date}</p>{a.coach_notes && <p className="text-text-secondary/60 text-xs">{a.coach_notes.slice(0, 60)}</p>}</div>
                <span className="text-accent font-bold">{pilarAvg(a)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Address */}
      {profile.address && (
        <div className="card">
          <h3 className="font-outfit font-semibold text-white mb-2">Alamat</h3>
          <p className="text-text-secondary text-sm">{profile.address}</p>
          {profile.previous_clubs && <p className="text-text-secondary/60 text-xs mt-2">Klub sebelumnya: {profile.previous_clubs}</p>}
        </div>
      )}
    </div>
  );
}
