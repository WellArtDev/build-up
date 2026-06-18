'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { FileUpload } from '@/components/forms/FileUpload';

export default function LandingEditorPage() {
  const { tenantId } = useParams() as { tenantId: string };
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState('');

  const [form, setForm] = useState({
    hero_title: '',
    hero_subtitle: '',
    about_text: '',
    whatsapp_number: '',
    primary_color: '#CCFF00',
    theme: 'dark',
  });
  const [gallery, setGallery] = useState<string[]>([]);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(`/api/tenants/${tenantId}`);
        const data = await res.json();
        if (data.success) {
          const s = data.data;
          const landing = s.settings?.landing_content || {};
          setForm({
            hero_title: landing.hero_title || '',
            hero_subtitle: landing.hero_subtitle || '',
            about_text: landing.about_text || '',
            whatsapp_number: landing.whatsapp_number || s.phone || '',
            primary_color: landing.primary_color || '#CCFF00',
            theme: s.settings?.landing_theme || 'dark',
          });
          setGallery(landing.gallery || []);
          setPreviewUrl(`/t/${s.slug}`);
        }
      } catch { /* ignore */ } finally { setLoading(false); }
    }
    loadSettings();
  }, [tenantId]);

  async function handleSave() {
    setSaving(true); setMessage('');
    try {
      const res = await fetch(`/api/tenants/${tenantId}/landing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landing_content: { ...form, gallery },
          landing_theme: form.theme,
        }),
      });
      const data = await res.json();
      setMessage(data.success ? '✅ Landing berhasil disimpan' : '❌ Gagal menyimpan');
    } catch {
      setMessage('❌ Gagal terhubung');
    } finally { setSaving(false); }
  }

  function addGalleryUrl(url: string) {
    setGallery((prev) => [...prev, url]);
  }
  function removeGallery(index: number) {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  }

  if (loading) return <div><h1 className="font-playfair italic text-3xl text-white mb-8">Landing Page Editor</h1><CardSkeleton /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair italic text-3xl text-white mb-1">Landing Page Editor</h1>
          <p className="text-text-secondary text-sm">Edit halaman publik akademi Anda di <a href={previewUrl} target="_blank" rel="noopener" className="text-accent hover:underline">{previewUrl}</a></p>
        </div>
        <a href={previewUrl} target="_blank" rel="noopener" className="btn-secondary text-sm">👁️ Preview</a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content */}
        <div className="card space-y-4">
          <h3 className="font-outfit font-semibold text-white text-lg">📝 Konten Halaman</h3>

          <div>
            <label className="label-text">Judul Hero</label>
            <input className="input-field" placeholder="Nama Akademi Anda" value={form.hero_title} onChange={(e) => setForm((f) => ({ ...f, hero_title: e.target.value }))} />
          </div>
          <div>
            <label className="label-text">Subtitle Hero</label>
            <input className="input-field" placeholder="Tagline akademi..." value={form.hero_subtitle} onChange={(e) => setForm((f) => ({ ...f, hero_subtitle: e.target.value }))} />
          </div>
          <div>
            <label className="label-text">Tentang Kami</label>
            <textarea className="input-field min-h-[120px]" placeholder="Ceritakan tentang akademi Anda..." value={form.about_text} onChange={(e) => setForm((f) => ({ ...f, about_text: e.target.value }))} />
          </div>
          <div>
            <label className="label-text">Nomor WhatsApp</label>
            <input className="input-field" placeholder="62812xxxx" value={form.whatsapp_number} onChange={(e) => setForm((f) => ({ ...f, whatsapp_number: e.target.value }))} />
            <p className="text-text-secondary/50 text-xs mt-1">Nomor ini akan muncul sebagai floating WhatsApp button</p>
          </div>
        </div>

        {/* Theme & Gallery */}
        <div className="space-y-6">
          <div className="card space-y-4">
            <h3 className="font-outfit font-semibold text-white text-lg">🎨 Tema</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'dark', label: 'Dark', preview: 'bg-[#0A0A0C]', border: 'border-[#1F2937]', accent: 'bg-[#CCFF00]' },
                { value: 'light', label: 'Light', preview: 'bg-white', border: 'border-gray-200', accent: 'bg-blue-600' },
                { value: 'green', label: 'Sport', preview: 'bg-[#0a1f0a]', border: 'border-[#1a3a1a]', accent: 'bg-[#22c55e]' },
              ].map((t) => (
                <button key={t.value} onClick={() => setForm((f) => ({ ...f, theme: t.value }))} className={`rounded-xl border-2 overflow-hidden transition-all ${form.theme === t.value ? 'border-accent scale-105' : 'border-border hover:border-accent/50'}`}>
                  <div className={`h-12 ${t.preview} relative`}>
                    <div className={`absolute bottom-2 left-2 w-8 h-1.5 ${t.accent} rounded`} />
                    <div className={`absolute bottom-2 left-12 w-12 h-1.5 ${t.border} rounded`} />
                  </div>
                  <p className="text-xs py-1.5 text-text-secondary">{t.label}</p>
                </button>
              ))}
            </div>
            <div>
              <label className="label-text">Warna Aksen</label>
              <input type="color" className="w-full h-10 rounded-lg cursor-pointer bg-surface border border-border p-1" value={form.primary_color} onChange={(e) => setForm((f) => ({ ...f, primary_color: e.target.value }))} />
            </div>
          </div>

          {/* Gallery */}
          <div className="card space-y-4">
            <h3 className="font-outfit font-semibold text-white text-lg">🖼️ Galeri</h3>
            <div className="grid grid-cols-3 gap-2">
              {gallery.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeGallery(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                </div>
              ))}
            </div>
            <FileUpload onUpload={addGalleryUrl} label="Tambah Foto" type="gallery" accept="image/*" />
            <p className="text-text-secondary/50 text-xs">Upload foto kegiatan: latihan, pertandingan, fasilitas</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Menyimpan...' : 'Simpan Landing Page'}
        </button>
        {message && <span className={`text-sm ${message.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{message}</span>}
      </div>
    </div>
  );
}
