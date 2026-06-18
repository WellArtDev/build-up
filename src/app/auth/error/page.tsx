'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: 'Email atau password salah.',
  OAuthSignin: 'Gagal login dengan provider.',
  OAuthCallback: 'Gagal callback dari provider.',
  OAuthCreateAccount: 'Gagal membuat akun dengan provider.',
  EmailCreateAccount: 'Gagal membuat akun dengan email.',
  Callback: 'Gagal pada callback autentikasi.',
  OAuthAccountNotLinked: 'Akun ini sudah terhubung dengan metode login lain.',
  EmailSignin: 'Gagal mengirim email login.',
  default: 'Terjadi kesalahan saat autentikasi.',
};

export default function AuthErrorPage() {
  const params = useSearchParams();
  const errorType = params.get('error') || 'default';

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-fluid-sm card-hover p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h2 className="font-playfair italic text-2xl text-white mb-2">Autentikasi Gagal</h2>
        <p className="text-text-secondary mb-6">
          {ERROR_MESSAGES[errorType] || ERROR_MESSAGES.default}
        </p>
        <Link href="/auth/login" className="btn-primary">
          Kembali ke Login
        </Link>
      </div>
    </div>
  );
}
