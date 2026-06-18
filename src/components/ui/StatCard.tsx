export function StatCard({ label, value, sub, trend, onClick }: {
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down';
  onClick?: () => void;
}) {
  return (
    <div className={`card-hover ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <p className="text-text-secondary text-xs font-outfit tracking-wide uppercase mb-2">{label}</p>
      <p className="font-outfit font-bold text-3xl text-white mb-1">{value}</p>
      <div className="flex items-center gap-2">
        {trend && (
          <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? '↑' : '↓'}
          </span>
        )}
        {sub && <p className="text-text-secondary/60 text-xs">{sub}</p>}
      </div>
    </div>
  );
}
