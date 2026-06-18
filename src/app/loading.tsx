import { CardSkeleton } from '@/components/ui/Skeleton';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-canvas">
      <div className="w-full max-w-fluid-md">
        <CardSkeleton />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
