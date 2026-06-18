'use client';

import { useState, useRef } from 'react';

interface FileUploadProps {
  onUpload: (url: string) => void;
  accept?: string;
  label?: string;
  type?: string;
  className?: string;
}

export function FileUpload({ onUpload, accept = 'image/*', label = 'Upload File', type = 'general', className = '' }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        onUpload(data.data.url);
      } else {
        setError(data.error || 'Upload gagal');
      }
    } catch {
      setError('Gagal terhubung ke server');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={className}>
      <label className="label-text">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          error ? 'border-red-500/50 bg-red-500/5' : preview ? 'border-accent/50 bg-accent/5' : 'border-border hover:border-accent/30'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        {preview ? (
          <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded-lg mb-2" />
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" className="mx-auto mb-2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        )}

        <p className="text-text-secondary text-sm">
          {uploading ? 'Mengupload...' : preview ? 'Klik untuk ganti' : 'Klik untuk upload'}
        </p>
        <p className="text-text-secondary/50 text-xs mt-1">Max 5MB • JPG, PNG, WEBP, GIF, PDF</p>
      </div>

      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
