'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Gagal mengirim email reset');
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError('Gagal terhubung ke server');
    }

    setLoading(false);
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-fluid-sm card-hover p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h2 className="font-playfair italic text-2xl text-white mb-2">Cek Email Anda</h2>
          <p className="text-text-secondary mb-6">
            Link reset password telah dikirim ke {email}. Silakan cek inbox Anda.
          </p>
          <Link href="/auth/login" className="btn-primary">
            Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-fluid-sm">
        <div className="card-hover p-8">
          <div className="text-center mb-8">
            <h1 className="font-playfair italic text-3xl text-white mb-2">
              Reset Password
            </h1>
            <p className="text-text-secondary">
              Masukkan email Anda untuk menerima link reset
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-text">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>
          </form>

          <p className="mt-6 text-center text-text-secondary text-sm">
            <Link href="/auth/login" className="text-accent hover:underline font-medium">
              ← Kembali ke Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
