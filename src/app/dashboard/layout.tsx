'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { CardSkeleton } from '@/components/ui/Skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CardSkeleton />
      </div>
    );
  }

  if (!session?.user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-canvas flex">
      <DashboardSidebar />
      <div className="flex-1 ml-56 pt-0 transition-all">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
