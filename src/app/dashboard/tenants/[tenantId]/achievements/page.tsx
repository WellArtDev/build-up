'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface Achievement {
  id: number;
  achievement_type: string;
  title: string;
  description: string;
  rank_position: number;
  date_achieved: string;
  student_name: string | null;
  tournament_name: string | null;
}

export default function AchievementsPage() {
  const { tenantId } = useParams() as { tenantId: string };
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [students, setStudents] = useState<{ id: number; name: string }[]>([]);
  const [tournaments, setTournaments] = useState<{ id: number; name: string }[]>([]);
  const [form, setForm] = useState({
    achievement_type: 'individual', title: '', description: '', rank_position: 1,
    date_achieved: new Date().toISOString().split('T')[0], student_id: '', tournament_id: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, sRes, tRes] = await Promise.all([
        fetch(`/api/tenants/${tenantId}/achievements`),
        fetch(`/api/tenants/${tenantId}/students?limit=100`),
        fetch(`/api/tenants/${tenantId}/tournaments`),
      ]);
      const [aData, sData, tData] = await Promise.all([aRes.json(), sRes.json(), tRes.json()]);
      if (aData.success) setAchievements(aData.data);
      if (sData.success) setStudents(sData.data);
      if (tData.success) setTournaments(tData.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [tenantId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleCreate() {
    try {
      const res = await fetch(`/api/tenants/${tenantId}/achievements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, student_id: form.student_id ? Number(form.student_id) : null, tournament_id: form.tournament_id ? Number(form.tournament_id) : null, rank_position: Number(form.rank_position) }),
      });
      if ((await res.json()).success) { setShowForm(false); fetchData(); }
    } catch { /* ignore */ }
  }

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-playfair italic text-3xl text-white mb-1">Prestasi</h1><p className="text-text-secondary text-sm">{achievements.length} prestasi</p></div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">+ Prestasi</button>
      </div>

      {loading ? <TableSkeleton rows={5} cols={4} /> : achievements.length === 0 ? (
        <EmptyState title="Belum ada prestasi" description="Catat prestasi individu atau tim" action={<button onClick={() => setShowForm(true)} className="btn-primary">+ Prestasi</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((a) => (
            <div key={a.id} className="card-hover text-center">
              <div className="text-4xl mb-2">{a.rank_position <= 3 ? medals[a.rank_position - 1] : '🏅'}</div>
              <h4 className="text-white font-semibold mb-1">{a.title}</h4>
              <p className="text-text-secondary text-xs mb-2">{a.description && a.description.slice(0, 80)}</p>
              <div className="flex justify-center gap-2">
                <span className={`badge ${a.achievement_type === 'individual' ? 'badge-info' : 'badge-success'}`}>{a.achievement_type === 'individual' ? 'Individu' : 'Tim'}</span>
                <span className="badge badge-warning">Peringkat #{a.rank_position}</span>
              </div>
              {a.student_name && <p className="text-text-secondary text-xs mt-2">{a.student_name}</p>}
              {a.tournament_name && <p className="text-text-secondary/60 text-xs">{a.tournament_name}</p>}
              <p className="text-text-secondary/60 text-xs mt-1">{a.date_achieved}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md">
            <h3 className="font-playfair italic text-2xl text-white mb-4">Prestasi Baru</h3>
            <div className="space-y-3">
              <div>
                <label className="label-text">Tipe</label>
                <select className="input-field" value={form.achievement_type} onChange={(e) => setForm((f) => ({ ...f, achievement_type: e.target.value }))}>
                  <option value="individual">Individu</option><option value="team">Tim</option>
                </select>
              </div>
              <div><label className="label-text">Judul *</label><input className="input-field" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
              <div><label className="label-text">Deskripsi</label><textarea className="input-field min-h-[60px]" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label-text">Peringkat</label><input type="number" className="input-field" min="1" value={form.rank_position} onChange={(e) => setForm((f) => ({ ...f, rank_position: Number(e.target.value) }))} /></div>
                <div><label className="label-text">Tanggal *</label><input type="date" className="input-field" value={form.date_achieved} onChange={(e) => setForm((f) => ({ ...f, date_achieved: e.target.value }))} /></div>
              </div>
              <div><label className="label-text">Siswa</label><select className="input-field" value={form.student_id} onChange={(e) => setForm((f) => ({ ...f, student_id: e.target.value }))}><option value="">Pilih</option>{students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
              <div><label className="label-text">Turnamen</label><select className="input-field" value={form.tournament_id} onChange={(e) => setForm((f) => ({ ...f, tournament_id: e.target.value }))}><option value="">Pilih</option>{tournaments.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn-secondary flex-1" onClick={() => setShowForm(false)}>Batal</button>
              <button className="btn-primary flex-1" onClick={handleCreate}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
