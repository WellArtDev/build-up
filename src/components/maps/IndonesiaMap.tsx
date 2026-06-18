'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

interface MapAcademy {
  id: number; name: string; slug: string; sport_type: string; address: string;
  lat: number; lng: number;
}

const CITY_COORDS: Record<string, [number, number]> = {
  jakarta: [-6.2088, 106.8456],
  surabaya: [-7.2575, 112.7521],
  bandung: [-6.9175, 107.6191],
  medan: [3.5952, 98.6722],
  semarang: [-6.9932, 110.4203],
  yogyakarta: [-7.7956, 110.3695],
  makassar: [-5.1477, 119.4327],
  palembang: [-2.9761, 104.7754],
  denpasar: [-8.6705, 115.2126],
  malang: [-7.9666, 112.6326],
};

function guessCoordsFromAddress(address: string): [number, number] | null {
  if (!address) return null;
  const lower = address.toLowerCase();
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (lower.includes(city)) return coords;
  }
  return null;
}

export function IndonesiaMap({ academies, className = '' }: { academies: MapAcademy[]; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);

  // Auto-detect user location
  const detectLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => { setLocating(false); },
      { enableHighAccuracy: false, timeout: 5000 },
    );
  }, []);

  // Auto-detect on mount
  useEffect(() => { detectLocation(); }, [detectLocation]);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

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
      const map = (L as any).map(containerRef.current).setView([-2.5, 118], 5);

      (L as any).tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Academy markers
      const allPoints: [number, number][] = [];
      const all = [...academies];

      // Add user location marker if available
      if (userLocation) {
        allPoints.push(userLocation);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userIcon = (L as any).divIcon({
          html: '<div style="background:#3B82F6;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(59,130,246,0.6)"></div>',
          className: '',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        (L as any).marker(userLocation, { icon: userIcon })
          .addTo(map)
          .bindPopup('<div style="font-family:sans-serif;font-size:12px"><strong>📍 Lokasi Anda</strong></div>');
      }

      // Academy pins
      all.forEach((a) => {
        const coords: [number, number] = a.lat && a.lng ? [a.lat, a.lng] : guessCoordsFromAddress(a.address) || [-6.2, 106.8];
        if (coords) allPoints.push(coords);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const icon = (L as any).divIcon({
          html: `<div style="background:#CCFF00;width:12px;height:12px;border-radius:50%;border:2px solid #0A0A0C;box-shadow:0 0 8px rgba(204,255,0,0.5)"></div>`,
          className: '',
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        (L as any).marker(coords, { icon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:sans-serif;font-size:12px;min-width:140px">
              <strong>${a.name}</strong><br/>
              <span style="color:#666">${(a.sport_type || '').replace('_', ' ')}</span><br/>
              <span style="font-size:10px">📍 ${a.address || ''}</span><br/>
              <a href="/t/${a.slug}" style="color:#CCFF00;background:#0A0A0C;padding:2px 8px;border-radius:4px;font-size:10px;text-decoration:none;display:inline-block;margin-top:4px">Lihat →</a>
            </div>`,
          );
      });

      if (allPoints.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bounds = (L as any).latLngBounds(allPoints.map((p: [number, number]) => (L as any).latLng(p[0], p[1])));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }

      setLoaded(true);
    }

    initMap();
    return () => { cancelled = true; };
  }, [academies, userLocation]);

  return (
    <div className={className}>
      {!loaded && <Skeleton className="h-[400px] w-full rounded-xl" />}
      <div className="relative">
        <div ref={containerRef} className="h-[400px] rounded-xl border border-border" />
        {!userLocation && (
          <button onClick={detectLocation} className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-surface border border-border rounded-full px-4 py-2 text-xs text-text-secondary hover:text-white hover:border-accent transition-all shadow-lg">
            {locating ? '📍 Mendeteksi...' : '📍 Deteksi Lokasi Saya'}
          </button>
        )}
        <div className="absolute bottom-3 right-3 z-[1000] bg-surface/90 backdrop-blur rounded-lg px-3 py-1.5 border border-border text-xs text-text-secondary">
          {academies.length} akademi ditemukan
        </div>
      </div>
    </div>
  );
}
