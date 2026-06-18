'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CardSkeleton } from '@/components/ui/Skeleton';

export default function DashboardRedirect() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session?.user as any;
    if (!user) return;

    switch (user.role) {
      case 'super_admin':
        router.push('/dashboard/super-admin');
        break;
      case 'parent':
        router.push('/dashboard/parent');
        break;
      case 'coach':
        router.push(`/dashboard/tenants/${user.tenantId}`);
        break;
      default:
        router.push(`/dashboard/tenants/${user.tenantId}`);
    }
  }, [session, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <CardSkeleton />
    </div>
  );
}
