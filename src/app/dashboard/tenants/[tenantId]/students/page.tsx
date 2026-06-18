'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface Student {
  id: number;
  student_code: string;
  name: string;
  age_group: string;
  position: string;
  gender: string;
  status: string;
  parent_contact: string;
  enrollment_date: string;
}

export default function StudentsPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenantId as string;
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20 });
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', nik: '', nisn: '', date_of_birth: '',
    gender: 'male', position: '', age_group: '',
    address: '', parent_contact: '', parent_email: '',
  });

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page: String(meta.page),
        limit: String(meta.limit),
      });
      if (search) q.set('search', search);
      if (statusFilter) q.set('status', statusFilter);

      const res = await fetch(`/api/tenants/${tenantId}/students?${q}`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.data);
        setMeta((m) => ({ ...m, total: data.meta?.total || 0 }));
      }
    } catch {
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [tenantId, search, statusFilter, meta.page, meta.limit]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  async function handleCreate() {
    if (!form.name.trim()) return;
    try {
      const res = await fetch(`/api/tenants/${tenantId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setForm({ name: '', nik: '', nisn: '', date_of_birth: '', gender: 'male', position: '', age_group: '', address: '', parent_contact: '', parent_email: '' });
        fetchStudents();
      }
    } catch {
      // ignore
    }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = { active: 'badge-success', alumni: 'badge-info', suspended: 'badge-danger' };
    return map[status] || 'badge-warning';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair italic text-3xl text-white mb-1">Daftar Siswa</h1>
          <p className="text-text-secondary text-sm">{meta.total} siswa terdaftar</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm">
          + Tambah Siswa
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          className="input-field max-w-xs"
          placeholder="Cari nama / kode / NIK..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setMeta((m) => ({ ...m, page: 1 })); }}
        />
        <select
          className="input-field max-w-[140px]"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setMeta((m) => ({ ...m, page: 1 })); }}
        >
          <option value="">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="alumni">Alumni</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : students.length === 0 ? (
        <EmptyState
          title="Belum ada siswa"
          description="Tambahkan siswa pertama ke akademi Anda"
          action={
            <button onClick={() => setShowModal(true)} className="btn-primary">+ Tambah Siswa</button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-text-secondary font-outfit text-xs uppercase">Kode</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-outfit text-xs uppercase">Nama</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-outfit text-xs uppercase">Grup</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-outfit text-xs uppercase">Posisi</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-outfit text-xs uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-outfit text-xs uppercase">Terdaftar</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} onClick={() => router.push(`/dashboard/tenants/${tenantId}/students/${s.id}`)} className="border-b border-border/50 hover:bg-accent/5 transition-colors cursor-pointer">
                    <td className="py-3 px-4 text-accent font-mono text-xs">{s.student_code}</td>
                    <td className="py-3 px-4 text-white font-medium">{s.name}</td>
                    <td className="py-3 px-4 text-text-secondary">{s.age_group || '-'}</td>
                    <td className="py-3 px-4 text-text-secondary">{s.position || '-'}</td>
                    <td className="py-3 px-4"><span className={statusBadge(s.status)}>{s.status}</span></td>
                    <td className="py-3 px-4 text-text-secondary text-xs">{s.enrollment_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {meta.total > meta.limit && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            className="btn-secondary text-sm"
            disabled={meta.page <= 1}
            onClick={() => setMeta((m) => ({ ...m, page: m.page - 1 }))}
          >
            Sebelumnya
          </button>
          <span className="text-text-secondary text-sm">Halaman {meta.page} dari {Math.ceil(meta.total / meta.limit)}</span>
          <button
            className="btn-secondary text-sm"
            disabled={meta.page >= Math.ceil(meta.total / meta.limit)}
            onClick={() => setMeta((m) => ({ ...m, page: m.page + 1 }))}
          >
            Berikutnya
          </button>
        </div>
      )}

      {/* Add Student Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="font-playfair italic text-2xl text-white mb-4">Tambah Siswa Baru</h3>
            <div className="space-y-3">
              <div>
                <label className="label-text">Nama Lengkap *</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">NIK</label>
                  <input className="input-field" value={form.nik} onChange={(e) => setForm((f) => ({ ...f, nik: e.target.value }))} />
                </div>
                <div>
                  <label className="label-text">NISN</label>
                  <input className="input-field" value={form.nisn} onChange={(e) => setForm((f) => ({ ...f, nisn: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Tanggal Lahir</label>
                  <input type="date" className="input-field" value={form.date_of_birth} onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))} />
                </div>
                <div>
                  <label className="label-text">Jenis Kelamin</label>
                  <select className="input-field" value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Posisi</label>
                  <input className="input-field" placeholder="Striker, Midfielder..." value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} />
                </div>
                <div>
                  <label className="label-text">Grup Usia</label>
                  <select className="input-field" value={form.age_group} onChange={(e) => setForm((f) => ({ ...f, age_group: e.target.value }))}>
                    <option value="">Pilih</option>
                    {['U-8', 'U-10', 'U-12', 'U-14', 'U-16', 'U-18', 'U-21'].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label-text">Alamat</label>
                <textarea className="input-field min-h-[60px]" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">HP Orang Tua</label>
                  <input className="input-field" value={form.parent_contact} onChange={(e) => setForm((f) => ({ ...f, parent_contact: e.target.value }))} />
                </div>
                <div>
                  <label className="label-text">Email Orang Tua</label>
                  <input className="input-field" value={form.parent_email} onChange={(e) => setForm((f) => ({ ...f, parent_email: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Batal</button>
              <button className="btn-primary flex-1" onClick={handleCreate}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
