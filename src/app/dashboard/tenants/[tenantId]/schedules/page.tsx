'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface Schedule {
  id: number;
  title: string;
  type: string;
  age_group: string;
  coach_id: number;
  coach_name: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  notes: string;
}

const TYPE_MAP: Record<string, { label: string; color: string }> = {
  training: { label: 'Latihan', color: 'badge-info' },
  match: { label: 'Pertandingan', color: 'badge-warning' },
  tournament: { label: 'Turnamen', color: 'badge-success' },
};

export default function SchedulesPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenantId as string;
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', type: 'training', age_group: '', coach_id: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '15:30', end_time: '17:30', location: '', notes: '',
  });

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tenants/${tenantId}/schedules`);
      const data = await res.json();
      if (data.success) setSchedules(data.data);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  async function handleCreate() {
    try {
      const res = await fetch(`/api/tenants/${tenantId}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, coach_id: formData.coach_id ? Number(formData.coach_id) : null }),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setFormData((f) => ({ ...f, title: '', location: '', notes: '' }));
        fetchSchedules();
      }
    } catch { /* ignore */ }
  }

  const grouped: Record<string, Schedule[]> = {};
  schedules.forEach((s) => {
    if (!grouped[s.date]) grouped[s.date] = [];
    grouped[s.date].push(s);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair italic text-3xl text-white mb-1">Jadwal</h1>
          <p className="text-text-secondary text-sm">{schedules.length} jadwal</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">+ Jadwal Baru</button>
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : schedules.length === 0 ? (
        <EmptyState title="Belum ada jadwal" description="Buat jadwal latihan, pertandingan, atau turnamen" action={<button onClick={() => setShowForm(true)} className="btn-primary">+ Jadwal Baru</button>} />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).sort().map(([date, items]) => (
            <div key={date}>
              <h3 className="font-outfit font-semibold text-text-secondary text-sm mb-3">
                📅 {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              <div className="space-y-2">
                {items.map((s) => (
                  <div key={s.id} onClick={() => router.push(`/dashboard/tenants/${tenantId}/schedules/${s.id}`)} className="card-hover flex items-center gap-4 cursor-pointer">
                    <div className="text-center min-w-[70px]">
                      <p className="text-white font-bold text-lg">{s.start_time.slice(0, 5)}</p>
                      <p className="text-text-secondary text-xs">s/d {s.end_time.slice(0, 5)}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{s.title}</p>
                      <p className="text-text-secondary text-xs">{s.location || 'Belum ditentukan'} • {s.age_group || 'Semua Grup'} • Coach: {s.coach_name || '-'}</p>
                    </div>
                    <span className={TYPE_MAP[s.type]?.color || 'badge-info'}>{TYPE_MAP[s.type]?.label || s.type}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="font-playfair italic text-2xl text-white mb-4">Jadwal Baru</h3>
            <div className="space-y-3">
              <div>
                <label className="label-text">Judul *</label>
                <input className="input-field" value={formData.title} onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Tipe</label>
                  <select className="input-field" value={formData.type} onChange={(e) => setFormData((f) => ({ ...f, type: e.target.value }))}>
                    <option value="training">Latihan</option>
                    <option value="match">Pertandingan</option>
                    <option value="tournament">Turnamen</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Grup Usia</label>
                  <select className="input-field" value={formData.age_group} onChange={(e) => setFormData((f) => ({ ...f, age_group: e.target.value }))}>
                    <option value="">Semua</option>
                    {['U-8','U-10','U-12','U-14','U-16','U-18','U-21'].map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label-text">Tanggal *</label>
                  <input type="date" className="input-field" value={formData.date} onChange={(e) => setFormData((f) => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <label className="label-text">Mulai *</label>
                  <input type="time" className="input-field" value={formData.start_time} onChange={(e) => setFormData((f) => ({ ...f, start_time: e.target.value }))} />
                </div>
                <div>
                  <label className="label-text">Selesai *</label>
                  <input type="time" className="input-field" value={formData.end_time} onChange={(e) => setFormData((f) => ({ ...f, end_time: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label-text">Lokasi</label>
                <input className="input-field" value={formData.location} onChange={(e) => setFormData((f) => ({ ...f, location: e.target.value }))} />
              </div>
              <div>
                <label className="label-text">Catatan</label>
                <textarea className="input-field min-h-[60px]" value={formData.notes} onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))} />
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
