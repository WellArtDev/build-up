'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-canvas">
      <div className="card-hover p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="font-playfair italic text-2xl text-white mb-2">Terjadi Kesalahan</h2>
        <p className="text-text-secondary text-sm mb-6">
          Maaf, terjadi kesalahan yang tidak terduga. Tim kami telah diberitahu.
        </p>
        <button onClick={reset} className="btn-primary">
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
