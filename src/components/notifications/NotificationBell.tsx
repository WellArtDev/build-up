'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Notification {
  id: number;
  title: string;
  content: string;
  priority: string;
  created_at: string;
  read: boolean;
}

export function NotificationBell({ tenantId }: { tenantId: string }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch(`/api/tenants/${tenantId}/announcements`);
      const data = await res.json();
      if (data.success) {
        const all = data.data as Notification[];
        setNotifs(all.slice(0, 10));
        setUnread(all.filter((n) => !n.read).length);
      }
    } catch { /* ignore */ }
  }, [tenantId]);

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifs]);

  const markRead = (id: number) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 text-text-secondary hover:text-white transition-colors">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-accent text-canvas text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-border">
              <p className="font-outfit font-semibold text-white text-sm">🔔 Notifikasi</p>
            </div>
            {notifs.length === 0 ? (
              <div className="p-6 text-center text-text-secondary text-sm">Belum ada notifikasi</div>
            ) : (
              notifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`px-4 py-3 border-b border-border/50 hover:bg-accent/5 cursor-pointer transition-all ${
                    !n.read ? 'border-l-2 border-l-accent' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white text-xs font-medium">{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1" />}
                  </div>
                  <p className="text-text-secondary text-[11px] mt-0.5 line-clamp-2">{n.content}</p>
                  <p className="text-text-secondary/50 text-[10px] mt-1">{new Date(n.created_at).toLocaleDateString('id-ID')}</p>
                </div>
              ))
            )}
            <Link
              href={`/dashboard/tenants/${tenantId}/announcements`}
              className="block p-3 text-center text-accent text-xs font-medium hover:bg-accent/5"
              onClick={() => setOpen(false)}
            >
              Lihat Semua
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
