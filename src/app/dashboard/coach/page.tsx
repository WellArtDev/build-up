'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { StatCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface CoachDashboard {
  totalStudents: number;
  todaySchedule: { title: string; time: string; ageGroup: string; count: number }[];
  recentAssessments: { studentName: string; date: string; avgScore: number }[];
  attendanceRate: number;
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

export default function CoachDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session?.user as any;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="font-playfair italic text-3xl text-white mb-8">Dasbor Pelatih</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const demo: CoachDashboard = {
    totalStudents: 15,
    todaySchedule: [
      { title: 'Latihan U-10', time: '15:30', ageGroup: 'U-10', count: 8 },
      { title: 'Latihan U-12', time: '17:00', ageGroup: 'U-12', count: 7 },
    ],
    recentAssessments: [
      { studentName: 'Rizky Pratama', date: '2024-06-10', avgScore: 6.8 },
      { studentName: 'Dimas Ardiansyah', date: '2024-06-10', avgScore: 7.2 },
      { studentName: 'Siti Nuraini', date: '2024-06-08', avgScore: 8.1 },
    ],
    attendanceRate: 85,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-playfair italic text-3xl text-white mb-1">
          Selamat Datang, {user?.name || 'Coach'}
        </h1>
        <p className="text-text-secondary text-sm">Dasbor Pelatih — Overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Siswa" value={String(demo.totalStudents)} sub="Dalam binaan Anda" />
        <StatCard label="Tingkat Kehadiran" value={`${demo.attendanceRate}%`} sub="Rata-rata bulan ini" />
        <StatCard label="Jadwal Hari Ini" value={String(demo.todaySchedule.length)} sub="Sesi latihan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="card">
          <h3 className="font-outfit font-semibold text-white mb-4">Jadwal Hari Ini</h3>
          {demo.todaySchedule.length > 0 ? (
            <div className="space-y-3">
              {demo.todaySchedule.map((s, i) => (
                <div key={i} className="bg-canvas rounded-lg p-4 border border-border flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{s.title}</p>
                    <p className="text-text-secondary text-xs">{s.ageGroup} • {s.count} siswa</p>
                  </div>
                  <span className="text-accent text-sm font-medium">🕐 {s.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Tidak ada jadwal hari ini" />
          )}
        </div>

        {/* Recent Assessments */}
        <div className="card">
          <h3 className="font-outfit font-semibold text-white mb-4">Penilaian Terbaru</h3>
          {demo.recentAssessments.length > 0 ? (
            <div className="space-y-3">
              {demo.recentAssessments.map((a, i) => (
                <div key={i} className="bg-canvas rounded-lg p-4 border border-border flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium text-sm">{a.studentName}</p>
                    <p className="text-text-secondary text-xs">{a.date}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-accent font-bold text-lg">{a.avgScore}</span>
                    <p className="text-text-secondary text-[10px]">/ 10</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Belum ada penilaian"
              description="Mulai penilaian 4 PILAR untuk siswa Anda"
              action={<button className="btn-primary text-sm">+ Penilaian Baru</button>}
            />
          )}
        </div>
      </div>
    </div>
  );
}
