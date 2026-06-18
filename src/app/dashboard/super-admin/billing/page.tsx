'use client';

import { useState, useEffect } from 'react';
import { TableSkeleton } from '@/components/ui/Skeleton';

interface BillingRow { tenant: string; tier: string; status: string; revenue: number; }

export default function SuperAdminBillingPage() {
  const [loading, setLoading] = useState(true);
  const [rows] = useState<BillingRow[]>([
    { tenant: 'SSB Garuda Muda', tier: 'starter', status: 'trial', revenue: 150000 },
  ]);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 400); return () => clearTimeout(t); }, []);

  return (
    <div>
      <h1 className="font-playfair italic text-3xl text-white mb-8">Keuangan Platform</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[{ label: 'Total Revenue', value: 'Rp 150rb' }, { label: 'Tenant Aktif', value: '1' }, { label: 'Dalam Trial', value: '1' }].map((c) => (
          <div key={c.label} className="card-hover text-center py-4">
            <p className="text-text-secondary text-xs mb-1">{c.label}</p>
            <p className="font-outfit font-bold text-2xl text-white">{c.value}</p>
          </div>
        ))}
      </div>
      {loading ? <TableSkeleton rows={2} cols={4} /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-text-secondary text-xs uppercase">Tenant</th>
                <th className="text-left py-3 px-4 text-text-secondary text-xs uppercase">Paket</th>
                <th className="text-left py-3 px-4 text-text-secondary text-xs uppercase">Status</th>
                <th className="text-right py-3 px-4 text-text-secondary text-xs uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 px-4 text-white text-xs">{r.tenant}</td>
                  <td className="py-3 px-4 text-text-secondary text-xs capitalize">{r.tier}</td>
                  <td className="py-3 px-4"><span className="badge badge-info">{r.status}</span></td>
                  <td className="py-3 px-4 text-white text-right text-xs">Rp {r.revenue.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
