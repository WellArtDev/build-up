'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface Student {
  id: number; name: string; student_code: string; age_group: string;
}
interface AttRecord {
  id: number; student_id: number; student_name: string; student_code: string;
  age_group: string; status: string; check_in_time: string; notes: string;
}
interface Schedule { id: number; title: string; date: string; start_time: string; age_group: string; }

export default function AttendancePage() {
  const { tenantId, scheduleId } = useParams() as { tenantId: string; scheduleId: string };
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [attendance, setAttendance] = useState<AttRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, sRes, schRes] = await Promise.all([
        fetch(`/api/tenants/${tenantId}/schedules/${scheduleId}/attendance`),
        fetch(`/api/tenants/${tenantId}/students?limit=200`),
        fetch(`/api/tenants/${tenantId}/schedules`),
      ]);
      const [aData, sData, schData] = await Promise.all([aRes.json(), sRes.json(), schRes.json()]);
      if (aData.success) setAttendance(aData.data);
      if (sData.success) setStudents(sData.data);
      if (schData.success) {
        const found = schData.data.find((s: Schedule) => s.id === Number(scheduleId));
        setSchedule(found || null);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [tenantId, scheduleId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const statusMap = (s: string) =>
    ({ present: '✓ Hadir', absent: '✗ Tidak Hadir', late: '⏰ Terlambat', excused: '📝 Izin' }[s] || '-');
  const statusColor = (s: string) =>
    ({ present: 'text-green-400', absent: 'text-red-400', late: 'text-yellow-400', excused: 'text-blue-400' }[s] || '');

  const toggleStatus = (studentId: number) => {
    setAttendance((prev) => {
      const existing = prev.find((a) => a.student_id === studentId);
      if (existing) {
        const order = ['present', 'late', 'excused', 'absent'];
        const next = order[(order.indexOf(existing.status) + 1) % order.length];
        return prev.map((a) => a.student_id === studentId ? { ...a, status: next } : a);
      }
      return [...prev, { id: 0, student_id: studentId, student_name: '', student_code: '', age_group: '', status: 'present', check_in_time: '', notes: '' }];
    });
  };

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/tenants/${tenantId}/schedules/${scheduleId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: attendance.map((a) => ({ student_id: a.student_id, status: a.status })) }),
      });
      fetchAll();
    } catch { /* ignore */ } finally { setSaving(false); }
  }

  // Merge: all students + attendance status
  const merged = students.map((s) => {
    const att = attendance.find((a) => a.student_id === s.id);
    return { ...s, status: att?.status || 'absent', check_in_time: att?.check_in_time, notes: att?.notes };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair italic text-3xl text-white mb-1">Absensi</h1>
          <p className="text-text-secondary text-sm">
            {schedule ? `${schedule.title} • ${schedule.date} • ${schedule.start_time?.slice(0, 5)}` : 'Pilih jadwal'}
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
          {saving ? 'Menyimpan...' : 'Simpan Absensi'}
        </button>
      </div>

      {loading ? <TableSkeleton rows={8} cols={4} /> : merged.length === 0 ? (
        <EmptyState title="Belum ada siswa" description="Tambahkan siswa terlebih dahulu" />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 text-text-secondary text-xs uppercase">Kode</th>
                <th className="text-left py-3 px-3 text-text-secondary text-xs uppercase">Nama</th>
                <th className="text-left py-3 px-3 text-text-secondary text-xs uppercase">Grup</th>
                <th className="text-center py-3 px-3 text-text-secondary text-xs uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {merged.map((s) => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-accent/5 cursor-pointer" onClick={() => toggleStatus(s.id)}>
                  <td className="py-3 px-3 text-accent font-mono text-xs">{s.student_code}</td>
                  <td className="py-3 px-3 text-white font-medium text-xs">{s.name}</td>
                  <td className="py-3 px-3 text-text-secondary text-xs">{s.age_group}</td>
                  <td className={`py-3 px-3 text-center font-medium text-xs ${statusColor(s.status)}`}>
                    {statusMap(s.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-text-secondary/50 text-xs p-3 text-center border-t border-border">
            Klik baris siswa untuk mengubah status: Hadir → Terlambat → Izin → Tidak Hadir
          </p>
        </div>
      )}
    </div>
  );
}
