'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { StatCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface ChildProgress {
  studentId: number;
  studentName: string;
  ageGroup: string;
  position: string;
  recentAssessment: {
    technical: number;
    tactical: number;
    physical: number;
    mental: number;
    date: string;
  } | null;
  attendance: { present: number; total: number };
  upcomingSchedule: { title: string; date: string; time: string } | null;
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card-hover">
      <p className="text-text-secondary text-xs font-outfit tracking-wide uppercase mb-2">{label}</p>
      <p className="font-outfit font-bold text-3xl text-white mb-1">{value}</p>
      {sub && <p className="text-text-secondary/60 text-xs">{sub}</p>}
    </div>
  );
}

function PilarBar({ label, value, max = 10 }: { label: string; value: number; max?: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-text-secondary text-xs w-16">{label}</span>
      <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-white text-xs font-medium w-6 text-right">{value}</span>
    </div>
  );
}

export default function ParentDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session?.user as any;

  useEffect(() => {
    // For Phase 1, show static demo content
    // Phase 4 will implement full parent portal API
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="font-playfair italic text-3xl text-white mb-8">Portal Orang Tua</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const demoChild: ChildProgress = {
    studentId: 1,
    studentName: 'Rizky Pratama',
    ageGroup: 'U-10',
    position: 'Striker',
    recentAssessment: {
      technical: 6.5,
      tactical: 5.5,
      physical: 7,
      mental: 8,
      date: '2024-06-10',
    },
    attendance: { present: 12, total: 14 },
    upcomingSchedule: {
      title: 'Latihan Rutin Selasa',
      date: '2024-06-18',
      time: '15:30',
    },
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-playfair italic text-3xl text-white mb-1">
          Selamat Datang, {user?.name || 'Orang Tua'}
        </h1>
        <p className="text-text-secondary text-sm">Pantau perkembangan anak Anda</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Kehadiran"
          value={`${Math.round((demoChild.attendance.present / demoChild.attendance.total) * 100)}%`}
          sub={`${demoChild.attendance.present} dari ${demoChild.attendance.total} sesi`}
        />
        <StatCard
          label="Skor 4 PILAR"
          value="6.8"
          sub={`${demoChild.recentAssessment ? 'Per ' + demoChild.recentAssessment.date : 'Belum ada penilaian'}`}
        />
        <StatCard
          label="Jadwal Terdekat"
          value={demoChild.upcomingSchedule ? demoChild.upcomingSchedule.date : '-'}
          sub={demoChild.upcomingSchedule?.title || 'Belum ada jadwal'}
        />
      </div>

      {/* 4 PILAR Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="font-outfit font-semibold text-white mb-4">
            Perkembangan {demoChild.studentName} • {demoChild.ageGroup}
          </h3>
          <div className="space-y-3">
            <PilarBar label="Teknik" value={demoChild.recentAssessment?.technical || 0} />
            <PilarBar label="Taktik" value={demoChild.recentAssessment?.tactical || 0} />
            <PilarBar label="Fisik" value={demoChild.recentAssessment?.physical || 0} />
            <PilarBar label="Mental" value={demoChild.recentAssessment?.mental || 0} />
          </div>
        </div>

        {/* Upcoming Schedule */}
        <div className="card">
          <h3 className="font-outfit font-semibold text-white mb-4">Jadwal Mendatang</h3>
          {demoChild.upcomingSchedule ? (
            <div className="bg-canvas rounded-lg p-4 border border-border">
              <p className="text-white font-medium mb-1">{demoChild.upcomingSchedule.title}</p>
              <div className="flex gap-4 text-text-secondary text-sm">
                <span>📅 {demoChild.upcomingSchedule.date}</span>
                <span>🕐 {demoChild.upcomingSchedule.time}</span>
              </div>
            </div>
          ) : (
            <EmptyState title="Belum ada jadwal" />
          )}
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-outfit font-semibold text-white mb-4">Pengumuman</h3>
          <div className="space-y-3">
            <div className="bg-canvas rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <span className="badge badge-warning text-[10px]">PENTING</span>
              </div>
              <p className="text-white text-sm font-medium">Jadwal Latihan Liburan</p>
              <p className="text-text-secondary text-xs mt-1">
                Latihan selama liburan sekolah tetap berjalan seperti biasa.
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-outfit font-semibold text-white mb-4">Keuangan</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-text-secondary text-sm">SPP Juni 2024</span>
              <span className="badge badge-success">Lunas</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-text-secondary text-sm">SPP Juli 2024</span>
              <span className="badge badge-warning">Menunggu</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
