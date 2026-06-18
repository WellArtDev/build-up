'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface Transaction {
  id: number;
  student_id: number | null;
  student_name: string | null;
  type: string;
  amount: number;
  description: string;
  category: string;
  payment_method: string;
  status: string;
  due_date: string;
  paid_date: string | null;
  invoice_number: string;
}

interface Summary { total: number; paid: number; pending: number; overdue: number }

export default function FinancesPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'spp_payment', amount: 150000, description: '', category: 'SPP',
    payment_method: 'Transfer', student_id: '', due_date: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const q = typeFilter ? `?type=${typeFilter}` : '';
      const res = await fetch(`/api/tenants/${tenantId}/finances${q}`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data);
        setSummary(data.summary);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [tenantId, typeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleCreate() {
    try {
      const res = await fetch(`/api/tenants/${tenantId}/finances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, student_id: formData.student_id ? Number(formData.student_id) : null, amount: Number(formData.amount) }),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        fetchData();
      }
    } catch { /* ignore */ }
  }

  const statusBadge = (s: string) => ({
    paid: 'badge-success', pending: 'badge-warning', overdue: 'badge-danger', cancelled: 'badge-info',
  }[s] || 'badge-info');

  const typeLabel = (t: string) => ({ spp_payment: 'SPP', income: 'Pemasukan', expense: 'Pengeluaran' }[t] || t);

  const fmt = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair italic text-3xl text-white mb-1">Keuangan</h1>
          <p className="text-text-secondary text-sm">{transactions.length} transaksi</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">+ Transaksi</button>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: fmt(summary.total), color: 'text-white' },
            { label: 'Lunas', value: fmt(summary.paid), color: 'text-green-400' },
            { label: 'Pending', value: fmt(summary.pending), color: 'text-yellow-400' },
            { label: 'Telat', value: fmt(summary.overdue), color: 'text-red-400' },
          ].map((c) => (
            <div key={c.label} className="card-hover text-center py-3">
              <p className="text-text-secondary text-xs mb-1">{c.label}</p>
              <p className={`font-outfit font-bold text-lg ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="mb-4">
        <select className="input-field max-w-[160px]" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">Semua Tipe</option>
          <option value="spp_payment">SPP</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </select>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : transactions.length === 0 ? (
        <EmptyState title="Belum ada transaksi" description="Catat transaksi pertama Anda" action={<button onClick={() => setShowForm(true)} className="btn-primary">+ Transaksi</button>} />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 text-text-secondary text-xs uppercase">Invoice</th>
                <th className="text-left py-3 px-3 text-text-secondary text-xs uppercase">Tipe</th>
                <th className="text-left py-3 px-3 text-text-secondary text-xs uppercase">Deskripsi</th>
                <th className="text-left py-3 px-3 text-text-secondary text-xs uppercase">Siswa</th>
                <th className="text-right py-3 px-3 text-text-secondary text-xs uppercase">Jumlah</th>
                <th className="text-center py-3 px-3 text-text-secondary text-xs uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-accent/5">
                  <td className="py-3 px-3 text-accent font-mono text-xs">{t.invoice_number}</td>
                  <td className="py-3 px-3 text-text-secondary text-xs">{typeLabel(t.type)}</td>
                  <td className="py-3 px-3 text-white text-xs">{t.description || t.category}</td>
                  <td className="py-3 px-3 text-text-secondary text-xs">{t.student_name || '-'}</td>
                  <td className="py-3 px-3 text-white font-medium text-right">{fmt(t.amount)}</td>
                  <td className="py-3 px-3 text-center"><span className={statusBadge(t.status)}>{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md">
            <h3 className="font-playfair italic text-2xl text-white mb-4">Transaksi Baru</h3>
            <div className="space-y-3">
              <div>
                <label className="label-text">Tipe *</label>
                <select className="input-field" value={formData.type} onChange={(e) => setFormData((f) => ({ ...f, type: e.target.value }))}>
                  <option value="spp_payment">SPP</option>
                  <option value="income">Pemasukan</option>
                  <option value="expense">Pengeluaran</option>
                </select>
              </div>
              <div>
                <label className="label-text">Jumlah *</label>
                <input type="number" className="input-field" value={formData.amount} onChange={(e) => setFormData((f) => ({ ...f, amount: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="label-text">Deskripsi</label>
                <input className="input-field" value={formData.description} onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="label-text">Kategori</label>
                <input className="input-field" value={formData.category} onChange={(e) => setFormData((f) => ({ ...f, category: e.target.value }))} />
              </div>
              <div>
                <label className="label-text">Metode Bayar</label>
                <select className="input-field" value={formData.payment_method} onChange={(e) => setFormData((f) => ({ ...f, payment_method: e.target.value }))}>
                  <option value="Transfer">Transfer</option>
                  <option value="QRIS">QRIS</option>
                  <option value="Cash">Tunai</option>
                </select>
              </div>
              <div>
                <label className="label-text">Jatuh Tempo</label>
                <input type="date" className="input-field" value={formData.due_date} onChange={(e) => setFormData((f) => ({ ...f, due_date: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn-secondary flex-1" onClick={() => setShowForm(false)}>Batal</button>
              <button className="btn-primary flex-1" onClick={handleCreate}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
