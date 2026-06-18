'use client';

import { useState, useCallback } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';

interface Student { id: number; name: string; age_group: string; position: string; }
interface Coach { id: number; name: string; specialization: string; assignedStudents: Student[]; }

/**
 * Drag-drop coach assignment board.
 * Students from unassigned pool can be dragged to coach columns.
 */
export function DragDropBoard({
  coaches,
  students,
  onAssign,
}: {
  coaches: Coach[];
  students: Student[];
  onAssign: (studentId: number, coachId: number) => void;
}) {
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  const handleDragStart = useCallback((studentId: number) => {
    setDragging(studentId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragging(null);
    setDragOver(null);
  }, []);

  const handleDrop = useCallback(
    (coachId: number) => {
      if (dragging != null) {
        onAssign(dragging, coachId);
        setDragging(null);
        setDragOver(null);
      }
    },
    [dragging, onAssign],
  );

  const assignedIds = new Set(coaches.flatMap((c) => c.assignedStudents.map((s) => s.id)));
  const unassigned = students.filter((s) => !assignedIds.has(s.id));

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[300px]">
      {/* Unassigned pool */}
      <div className="min-w-[200px] flex-shrink-0">
        <h4 className="font-outfit font-semibold text-text-secondary text-sm mb-2">
          ⏳ Belum Ditugaskan ({unassigned.length})
        </h4>
        <div className="space-y-1.5 bg-canvas rounded-lg p-3 border border-border min-h-[200px]">
          {unassigned.map((s) => (
            <div
              key={s.id}
              draggable
              onDragStart={() => handleDragStart(s.id)}
              onDragEnd={handleDragEnd}
              className={`bg-surface rounded-lg p-2.5 border border-border cursor-grab active:cursor-grabbing hover:border-accent/50 transition-all text-xs ${
                dragging === s.id ? 'opacity-40' : ''
              }`}
            >
              <p className="text-white font-medium">{s.name}</p>
              <p className="text-text-secondary/60">{s.age_group} • {s.position || '-'}</p>
            </div>
          ))}
          {unassigned.length === 0 && <EmptyState title="Semua siswa ditugaskan" />}
        </div>
      </div>

      {/* Coach columns */}
      {coaches.map((c) => (
        <div
          key={c.id}
          className="min-w-[200px] flex-shrink-0"
          onDragOver={(e) => { e.preventDefault(); setDragOver(c.id); }}
          onDragLeave={() => setDragOver(null)}
          onDrop={() => handleDrop(c.id)}
        >
          <h4 className="font-outfit font-semibold text-white text-sm mb-2">
            🧑‍🏫 {c.name} ({c.assignedStudents.length})
          </h4>
          <div
            className={`space-y-1.5 rounded-lg p-3 border min-h-[200px] transition-all ${
              dragOver === c.id ? 'border-accent bg-accent/5' : 'border-border bg-canvas'
            }`}
          >
            {c.assignedStudents.map((s) => (
              <div key={s.id} className="bg-surface rounded-lg p-2.5 border border-border text-xs">
                <p className="text-white font-medium">{s.name}</p>
                <p className="text-text-secondary/60">{s.age_group} • {s.position || '-'}</p>
              </div>
            ))}
            {c.assignedStudents.length === 0 && (
              <p className="text-text-secondary/40 text-xs text-center py-8">Drop siswa di sini</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
