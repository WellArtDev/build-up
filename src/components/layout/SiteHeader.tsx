'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/#features', label: 'Fitur' },
  { href: '/#pricing', label: 'Harga' },
  { href: '/discovery', label: 'Discovery' },
  { href: '/#contact', label: 'Kontak' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthPage = pathname.startsWith('/auth/');
  const isDashboard = pathname.startsWith('/dashboard');

  if (isAuthPage) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-canvas/80 backdrop-blur-lg border-b border-border">
      <nav className="max-w-fluid-xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-outfit font-bold text-xl text-white">
            Build<span className="text-accent">Up</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {!isDashboard && NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-text-secondary hover:text-accent transition-colors font-outfit text-sm"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <Link href="/dashboard" className="btn-primary text-sm py-2 px-4">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="btn-ghost text-sm">
                Masuk
              </Link>
              <Link
                href="/auth/register"
                className="btn-primary text-sm py-2 px-4"
              >
                Coba Gratis
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-text-secondary hover:text-accent"
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden bg-surface border-b border-border px-4 py-4 flex flex-col gap-3">
          {!isDashboard && NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-text-secondary hover:text-accent py-2 font-outfit"
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-border pt-3 flex flex-col gap-2">
            {session ? (
              <Link href="/dashboard" className="btn-primary text-center">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="btn-secondary text-center">
                  Masuk
                </Link>
                <Link href="/auth/register" className="btn-primary text-center">
                  Coba Gratis 15 Hari
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
