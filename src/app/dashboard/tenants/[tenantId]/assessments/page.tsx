'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface Assessment {
  id: number;
  student_id: number;
  student_name: string;
  coach_name: string;
  assessment_date: string;
  assessment_period: string;
  technical_first_touch: number;
  technical_passing: number;
  technical_dribbling: number;
  technical_shooting: number;
  tactical_positioning: number;
  tactical_decision_making: number;
  physical_stamina: number;
  physical_speed_agility: number;
  physical_strength: number;
  mental_discipline: number;
  mental_teamwork: number;
  mental_fighting_spirit: number;
  coach_notes: string;
}

interface Student {
  id: number;
  name: string;
  age_group: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pillarAvg(a: any, key: string): number {
  const fields: Record<string, string[]> = {
    technical: ['technical_first_touch', 'technical_passing', 'technical_dribbling', 'technical_shooting'],
    tactical: ['tactical_positioning', 'tactical_decision_making'],
    physical: ['physical_stamina', 'physical_speed_agility', 'physical_strength'],
    mental: ['mental_discipline', 'mental_teamwork', 'mental_fighting_spirit'],
  };
  const f = fields[key] || [];
  const vals = f.map((fn: string) => Number(a[fn]) || 0);
  return vals.length ? Math.round((vals.reduce((s: number, v: number) => s + v, 0) / vals.length) * 10) / 10 : 0;
}

export default function AssessmentsPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<number>(0);
  const [formData, setFormData] = useState({
    assessment_date: new Date().toISOString().split('T')[0],
    assessment_period: '',
    technical_first_touch: 5, technical_passing: 5, technical_dribbling: 5, technical_shooting: 5,
    tactical_positioning: 5, tactical_decision_making: 5,
    physical_stamina: 5, physical_speed_agility: 5, physical_strength: 5,
    mental_discipline: 5, mental_teamwork: 5, mental_fighting_spirit: 5,
    coach_notes: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, sRes] = await Promise.all([
        fetch(`/api/tenants/${tenantId}/assessments`),
        fetch(`/api/tenants/${tenantId}/students?limit=100`),
      ]);
      const [aData, sData] = await Promise.all([aRes.json(), sRes.json()]);
      if (aData.success) setAssessments(aData.data);
      if (sData.success) setStudents(sData.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSubmit() {
    if (!selectedStudent) return;
    try {
      const res = await fetch(`/api/tenants/${tenantId}/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: selectedStudent, ...formData }),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        fetchData();
      }
    } catch {
      // ignore
    }
  }

  const renderScore = (val: number) => (
    <span className={`font-mono text-xs font-bold ${val >= 8 ? 'text-green-400' : val >= 5 ? 'text-accent' : 'text-red-400'}`}>
      {val}
    </span>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair italic text-3xl text-white mb-1">Penilaian 4 PILAR</h1>
          <p className="text-text-secondary text-sm">{assessments.length} penilaian tercatat</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
          + Penilaian Baru
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={8} />
      ) : assessments.length === 0 ? (
        <EmptyState
          title="Belum ada penilaian"
          description="Mulai menilai siswa dengan sistem 4 PILAR"
          action={<button onClick={() => setShowForm(true)} className="btn-primary">+ Penilaian Pertama</button>}
        />
      ) : (
        <div className="space-y-4">
          {assessments.map((a) => (
            <div key={a.id} className="card-hover">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white font-semibold">{a.student_name}</p>
                  <p className="text-text-secondary text-xs">Coach: {a.coach_name} • {a.assessment_date} • {a.assessment_period}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-3">
                <div className="text-center">
                  <p className="text-text-secondary text-[10px] uppercase mb-1">Teknik</p>
                  <p className="text-white font-bold">{pillarAvg(a, 'technical')}</p>
                </div>
                <div className="text-center">
                  <p className="text-text-secondary text-[10px] uppercase mb-1">Taktik</p>
                  <p className="text-white font-bold">{pillarAvg(a, 'tactical')}</p>
                </div>
                <div className="text-center">
                  <p className="text-text-secondary text-[10px] uppercase mb-1">Fisik</p>
                  <p className="text-white font-bold">{pillarAvg(a, 'physical')}</p>
                </div>
                <div className="text-center">
                  <p className="text-text-secondary text-[10px] uppercase mb-1">Mental</p>
                  <p className="text-white font-bold">{pillarAvg(a, 'mental')}</p>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {['first_touch', 'passing', 'dribbling', 'shooting', 'positioning', 'decision_making', 'stamina', 'speed_agility', 'strength', 'discipline', 'teamwork', 'fighting_spirit'].map((field) => (
                  <div key={field} className="text-center text-[10px] text-text-secondary">
                    {renderScore(Number((a as unknown as Record<string, unknown>)[`technical_${field}`] || (a as unknown as Record<string, unknown>)[`tactical_${field}`] || (a as unknown as Record<string, unknown>)[`physical_${field}`] || (a as unknown as Record<string, unknown>)[`mental_${field}`]) || '-' as unknown as number)}
                    <span className="block">{field.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
              {a.coach_notes && (
                <p className="mt-3 text-text-secondary text-xs italic border-t border-border pt-2">📝 {a.coach_notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Assessment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-playfair italic text-2xl text-white mb-4">Penilaian 4 PILAR</h3>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div>
                <label className="label-text">Siswa *</label>
                <select className="input-field" value={selectedStudent} onChange={(e) => setSelectedStudent(Number(e.target.value))}>
                  <option value={0}>Pilih Siswa</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.age_group})</option>)}
                </select>
              </div>
              <div>
                <label className="label-text">Tanggal</label>
                <input type="date" className="input-field" value={formData.assessment_date} onChange={(e) => setFormData((f) => ({ ...f, assessment_date: e.target.value }))} />
              </div>
              <div>
                <label className="label-text">Periode</label>
                <input className="input-field" placeholder="cth: Juni 2024 W1" value={formData.assessment_period} onChange={(e) => setFormData((f) => ({ ...f, assessment_period: e.target.value }))} />
              </div>
            </div>

            {/* 4 Pillars */}
            {[
              { name: 'Teknik', color: 'text-blue-400', fields: ['first_touch', 'passing', 'dribbling', 'shooting'] },
              { name: 'Taktik', color: 'text-yellow-400', fields: ['positioning', 'decision_making'] },
              { name: 'Fisik', color: 'text-orange-400', fields: ['stamina', 'speed_agility', 'strength'] },
              { name: 'Mental', color: 'text-green-400', fields: ['discipline', 'teamwork', 'fighting_spirit'] },
            ].map((pillar) => (
              <div key={pillar.name} className="mb-4">
                <h4 className={`font-outfit font-semibold text-sm mb-2 ${pillar.color}`}>PILAR {pillar.name.toUpperCase()}</h4>
                <div className="grid grid-cols-4 gap-3">
                  {pillar.fields.map((f) => {
                    const key = `${['technical', 'tactical', 'physical', 'mental'][['Teknik', 'Taktik', 'Fisik', 'Mental'].indexOf(pillar.name)]}_${f}`;
                    return (
                      <div key={f}>
                        <label className="text-text-secondary text-[10px] capitalize">{f.replace('_', ' ')}</label>
                        <input
                          type="range"
                          min="1" max="10"
                          value={(formData as Record<string, number>)[key]}
                          onChange={(e) => setFormData((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                          className="w-full accent-accent"
                        />
                        <span className="text-accent text-xs font-mono">{(formData as Record<string, number>)[key]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="mb-4">
              <label className="label-text">Catatan Pelatih</label>
              <textarea className="input-field min-h-[80px]" value={formData.coach_notes} onChange={(e) => setFormData((f) => ({ ...f, coach_notes: e.target.value }))} />
            </div>

            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setShowForm(false)}>Batal</button>
              <button className="btn-primary flex-1" onClick={handleSubmit}>Simpan Penilaian</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
