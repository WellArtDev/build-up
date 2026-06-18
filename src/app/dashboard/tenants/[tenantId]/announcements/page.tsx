'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface Announcement {
  id: number;
  title: string;
  content: string;
  target_audience: string;
  priority: string;
  sent_via_whatsapp: boolean;
  created_by_name: string;
  created_at: string;
}

const PRIORITY_MAP: Record<string, { label: string; cls: string }> = {
  urgent: { label: 'URGENT', cls: 'badge badge-danger' },
  high: { label: 'Penting', cls: 'badge badge-warning' },
  normal: { label: 'Normal', cls: 'badge badge-info' },
  low: { label: 'Info', cls: 'badge badge-success' },
};

const AUDIENCE_MAP: Record<string, string> = {
  all: 'Semua', parents: 'Orang Tua', students: 'Siswa', coaches: 'Pelatih',
};

export default function AnnouncementsPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', target_audience: 'all', priority: 'normal' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tenants/${tenantId}/announcements`);
      const data = await res.json();
      if (data.success) setAnnouncements(data.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [tenantId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleCreate() {
    try {
      const res = await fetch(`/api/tenants/${tenantId}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setForm({ title: '', content: '', target_audience: 'all', priority: 'normal' });
        fetchData();
      }
    } catch { /* ignore */ }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair italic text-3xl text-white mb-1">Pengumuman</h1>
          <p className="text-text-secondary text-sm">{announcements.length} pengumuman</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">+ Pengumuman</button>
      </div>

      {loading ? <TableSkeleton rows={4} cols={4} /> : announcements.length === 0 ? (
        <EmptyState title="Belum ada pengumuman" description="Buat pengumuman pertama Anda" action={<button onClick={() => setShowForm(true)} className="btn-primary">+ Pengumuman</button>} />
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className={`card-hover ${a.priority === 'urgent' ? 'border-l-2 border-l-red-500' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-semibold">{a.title}</h4>
                  <span className={PRIORITY_MAP[a.priority]?.cls}>{PRIORITY_MAP[a.priority]?.label}</span>
                  <span className="badge badge-info text-[10px]">{AUDIENCE_MAP[a.target_audience] || a.target_audience}</span>
                </div>
                {a.sent_via_whatsapp && <span className="text-green-400 text-xs">✓ WhatsApp</span>}
              </div>
              <p className="text-text-secondary text-sm whitespace-pre-wrap">{a.content}</p>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                <p className="text-text-secondary/60 text-xs">Oleh: {a.created_by_name}</p>
                <p className="text-text-secondary/60 text-xs">{new Date(a.created_at).toLocaleDateString('id-ID')}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-lg">
            <h3 className="font-playfair italic text-2xl text-white mb-4">Pengumuman Baru</h3>
            <div className="space-y-3">
              <div>
                <label className="label-text">Judul *</label>
                <input className="input-field" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="label-text">Konten *</label>
                <textarea className="input-field min-h-[120px]" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Target</label>
                  <select className="input-field" value={form.target_audience} onChange={(e) => setForm((f) => ({ ...f, target_audience: e.target.value }))}>
                    <option value="all">Semua</option>
                    <option value="parents">Orang Tua</option>
                    <option value="students">Siswa</option>
                    <option value="coaches">Pelatih</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Prioritas</label>
                  <select className="input-field" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
                    <option value="low">Info</option>
                    <option value="normal">Normal</option>
                    <option value="high">Penting</option>
                    <option value="urgent">URGENT</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn-secondary flex-1" onClick={() => setShowForm(false)}>Batal</button>
              <button className="btn-primary flex-1" onClick={handleCreate}>Kirim</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
