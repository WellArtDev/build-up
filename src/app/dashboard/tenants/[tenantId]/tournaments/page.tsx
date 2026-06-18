'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface Tournament {
  id: number;
  name: string;
  organizer: string;
  start_date: string;
  end_date: string;
  location: string;
  age_category: string;
  tournament_type: string;
  status: string;
  participant_count: number;
}

const STATUS_MAP: Record<string, string> = {
  upcoming: 'badge-info', ongoing: 'badge-warning', completed: 'badge-success',
};

export default function TournamentsPage() {
  const { tenantId } = useParams() as { tenantId: string };
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', organizer: '', start_date: '', end_date: '', location: '', age_category: '', tournament_type: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tenants/${tenantId}/tournaments`);
      const data = await res.json();
      if (data.success) setTournaments(data.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [tenantId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleCreate() {
    try {
      const res = await fetch(`/api/tenants/${tenantId}/tournaments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setForm({ name: '', organizer: '', start_date: '', end_date: '', location: '', age_category: '', tournament_type: '' });
        fetchData();
      }
    } catch { /* ignore */ }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair italic text-3xl text-white mb-1">Turnamen</h1>
          <p className="text-text-secondary text-sm">{tournaments.length} turnamen</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">+ Turnamen</button>
      </div>

      {loading ? <TableSkeleton rows={4} cols={5} /> : tournaments.length === 0 ? (
        <EmptyState title="Belum ada turnamen" description="Buat turnamen pertama" action={<button onClick={() => setShowForm(true)} className="btn-primary">+ Turnamen</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tournaments.map((t) => (
            <div key={t.id} className="card-hover">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold">{t.name}</h4>
                <span className={STATUS_MAP[t.status] || 'badge-info'}>{t.status}</span>
              </div>
              <div className="space-y-1.5 text-sm">
                {t.organizer && <p className="text-text-secondary">🏢 {t.organizer}</p>}
                <p className="text-text-secondary">📅 {t.start_date} s/d {t.end_date}</p>
                {t.location && <p className="text-text-secondary">📍 {t.location}</p>}
                {t.age_category && <p className="text-text-secondary">👥 {t.age_category}</p>}
                {t.tournament_type && <p className="text-text-secondary">🏆 {t.tournament_type}</p>}
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                <span className="text-accent font-bold">{t.participant_count || 0} peserta</span>
                <button className="btn-ghost text-xs">Kelola Peserta →</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-lg">
            <h3 className="font-playfair italic text-2xl text-white mb-4">Turnamen Baru</h3>
            <div className="space-y-3">
              <div><label className="label-text">Nama Turnamen *</label><input className="input-field" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
              <div><label className="label-text">Penyelenggara</label><input className="input-field" value={form.organizer} onChange={(e) => setForm((f) => ({ ...f, organizer: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label-text">Tanggal Mulai *</label><input type="date" className="input-field" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} /></div>
                <div><label className="label-text">Tanggal Selesai *</label><input type="date" className="input-field" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} /></div>
              </div>
              <div><label className="label-text">Lokasi</label><input className="input-field" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label-text">Kategori Usia</label><select className="input-field" value={form.age_category} onChange={(e) => setForm((f) => ({ ...f, age_category: e.target.value }))}>
                  <option value="">Pilih</option>
                  {['U-10','U-12','U-14','U-16','U-18','U-21'].map((a) => <option key={a} value={a}>{a}</option>)}
                </select></div>
                <div><label className="label-text">Tipe</label><select className="input-field" value={form.tournament_type} onChange={(e) => setForm((f) => ({ ...f, tournament_type: e.target.value }))}>
                  <option value="">Pilih</option>
                  {['Liga','Piala','Friendly','Seleksi'].map((a) => <option key={a} value={a}>{a}</option>)}
                </select></div>
              </div>
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
