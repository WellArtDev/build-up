'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface Coach {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  is_active: boolean;
  license_number: string;
  specialization: string;
  experience_years: number;
  bio: string;
  active_students: number;
}

export default function CoachesPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', license_number: '',
    specialization: '', experience_years: 0, bio: '', password: '',
  });

  const fetchCoaches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tenants/${tenantId}/coaches`);
      const data = await res.json();
      if (data.success) setCoaches(data.data);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { fetchCoaches(); }, [fetchCoaches]);

  async function handleCreate() {
    try {
      const res = await fetch(`/api/tenants/${tenantId}/coaches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, experience_years: Number(formData.experience_years) }),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setFormData({ name: '', email: '', phone: '', license_number: '', specialization: '', experience_years: 0, bio: '', password: '' });
        fetchCoaches();
      }
    } catch { /* ignore */ }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair italic text-3xl text-white mb-1">Daftar Pelatih</h1>
          <p className="text-text-secondary text-sm">{coaches.length} pelatih</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">+ Tambah Pelatih</button>
      </div>

      {loading ? (
        <TableSkeleton rows={3} cols={5} />
      ) : coaches.length === 0 ? (
        <EmptyState title="Belum ada pelatih" description="Daftarkan pelatih pertama Anda" action={<button onClick={() => setShowForm(true)} className="btn-primary">+ Tambah Pelatih</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coaches.map((c) => (
            <div key={c.id} className="card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-accent font-bold text-lg">{c.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-white font-semibold">{c.name}</p>
                  <p className="text-text-secondary text-xs">{c.specialization || 'Belum diset'}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Lisensi</span>
                  <span className="text-white">{c.license_number || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Pengalaman</span>
                  <span className="text-white">{c.experience_years} tahun</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Siswa Aktif</span>
                  <span className="text-accent font-bold">{c.active_students || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Status</span>
                  <span className={c.is_active ? 'badge badge-success' : 'badge badge-danger'}>{c.is_active ? 'Aktif' : 'Nonaktif'}</span>
                </div>
              </div>
              {c.bio && <p className="text-text-secondary/60 text-xs mt-3 border-t border-border pt-2 italic">{c.bio.slice(0, 100)}...</p>}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="font-playfair italic text-2xl text-white mb-4">Tambah Pelatih</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Nama *</label>
                  <input className="input-field" value={formData.name} onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label-text">Email *</label>
                  <input className="input-field" type="email" value={formData.email} onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Telepon</label>
                  <input className="input-field" value={formData.phone} onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="label-text">Password</label>
                  <input className="input-field" value={formData.password} onChange={(e) => setFormData((f) => ({ ...f, password: e.target.value }))} placeholder="Default: password123" />
                </div>
              </div>
              <div>
                <label className="label-text">No. Lisensi</label>
                <input className="input-field" value={formData.license_number} onChange={(e) => setFormData((f) => ({ ...f, license_number: e.target.value }))} />
              </div>
              <div>
                <label className="label-text">Spesialisasi</label>
                <input className="input-field" value={formData.specialization} onChange={(e) => setFormData((f) => ({ ...f, specialization: e.target.value }))} />
              </div>
              <div>
                <label className="label-text">Pengalaman (tahun)</label>
                <input type="number" className="input-field" value={formData.experience_years} onChange={(e) => setFormData((f) => ({ ...f, experience_years: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="label-text">Bio</label>
                <textarea className="input-field min-h-[60px]" value={formData.bio} onChange={(e) => setFormData((f) => ({ ...f, bio: e.target.value }))} />
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
