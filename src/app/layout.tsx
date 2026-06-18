import type { Metadata } from 'next';
import '@/styles/globals.css';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { Providers } from '@/components/layout/Providers';

export const metadata: Metadata = {
  title: 'BuildUp - Grassroots Sports Management',
  description: 'Indonesia\'s leading grassroots sports management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-canvas antialiased">
        <Providers>
          <SiteHeader />
          <main className="min-h-screen w-full pt-20">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
