'use client';

import { useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

interface Academy {
  id: number; name: string; slug: string; sport_type: string;
  address: string; lat: number; lng: number;
}

export function AcademyMap({ academies, className = '' }: { academies: Academy[]; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const mapRef = useRef<unknown>(null);
  const markerLayerRef = useRef<unknown[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;

    async function initMap() {
      const L = (await import('leaflet')).default;

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (cancelled || !containerRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const map = L.map(containerRef.current).setView([-2.5, 118], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const bounds = L.latLngBounds([]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const markers: any[] = [];

      academies.forEach((a) => {
        if (!a.lat || !a.lng) return;
        const m = L.marker([a.lat, a.lng])
          .addTo(map)
          .bindPopup(
            `<div style="font-family:sans-serif;font-size:13px">
              <strong>${a.name}</strong><br/>
              <span style="color:#666">${(a.sport_type || '').replace('_', ' ')}</span><br/>
              <span style="font-size:11px">${a.address || ''}</span><br/>
              <a href="/discovery/${a.slug}" style="color:#CCFF00;font-size:11px">Lihat Profil →</a>
            </div>`,
          );
        markers.push(m);
        bounds.extend([a.lat, a.lng]);
      });

      if (markers.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }

      mapRef.current = map;
      markerLayerRef.current = markers;
      setLoaded(true);
    }

    initMap();

    return () => {
      cancelled = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m = mapRef.current as any;
      if (m && m.remove) m.remove();
    };
  }, [academies]);

  return (
    <div className={className}>
      {!loaded && <Skeleton className="h-[400px] w-full rounded-xl" />}
      <div ref={containerRef} className="h-[400px] rounded-xl border border-border" />
    </div>
  );
}
