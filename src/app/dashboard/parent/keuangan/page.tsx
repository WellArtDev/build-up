'use client';

export default function ParentFinancePage() {
  const transactions = [
    { id: 1, invoice: 'INV-001-0001', date: '2024-06-08', amount: 150000, status: 'paid' },
    { id: 2, invoice: 'INV-001-0002', date: '2024-07-05', amount: 150000, status: 'pending' },
  ];

  const statusBadge = (s: string) => ({
    paid: 'badge-success', pending: 'badge-warning', overdue: 'badge-danger',
  }[s] || 'badge-info');

  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
  const total = transactions.reduce((s, t) => s + t.amount, 0);
  const paid = transactions.filter((t) => t.status === 'paid').reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <h1 className="font-playfair italic text-3xl text-white mb-8">Keuangan SPP</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Tagihan', value: fmt(total), color: 'text-white' },
          { label: 'Sudah Dibayar', value: fmt(paid), color: 'text-green-400' },
          { label: 'Menunggu', value: fmt(total - paid), color: 'text-yellow-400' },
        ].map((c) => (
          <div key={c.label} className="card-hover text-center py-4">
            <p className="text-text-secondary text-xs mb-1">{c.label}</p>
            <p className={`font-outfit font-bold text-xl ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-text-secondary text-xs uppercase">Invoice</th>
              <th className="text-left py-3 px-4 text-text-secondary text-xs uppercase">Tanggal</th>
              <th className="text-right py-3 px-4 text-text-secondary text-xs uppercase">Jumlah</th>
              <th className="text-center py-3 px-4 text-text-secondary text-xs uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b border-border/50">
                <td className="py-3 px-4 text-accent font-mono text-xs">{t.invoice}</td>
                <td className="py-3 px-4 text-text-secondary text-xs">{t.date}</td>
                <td className="py-3 px-4 text-white font-medium text-right text-xs">{fmt(t.amount)}</td>
                <td className="py-3 px-4 text-center"><span className={statusBadge(t.status)}>{t.status === 'paid' ? 'Lunas' : 'Pending'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment instructions */}
      <div className="card mt-8">
        <h3 className="font-outfit font-semibold text-white mb-3">Cara Pembayaran</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-canvas rounded-lg p-4 border border-border">
            <p className="text-white font-medium text-sm mb-1">QRIS</p>
            <p className="text-text-secondary text-xs">Scan QR code dari aplikasi bank/e-wallet Anda</p>
          </div>
          <div className="bg-canvas rounded-lg p-4 border border-border">
            <p className="text-white font-medium text-sm mb-1">Transfer Bank</p>
            <p className="text-text-secondary text-xs">BCA 1234567890 a.n. SSB Garuda Muda</p>
          </div>
        </div>
      </div>
    </div>
  );
}
