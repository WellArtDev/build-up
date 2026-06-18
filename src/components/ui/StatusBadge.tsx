const STATUS_MAP: Record<string, string> = {
  active: 'badge badge-success',
  present: 'badge badge-success',
  paid: 'badge badge-success',
  completed: 'badge badge-success',
  online: 'badge badge-success',
  Aktif: 'badge badge-success',

  pending: 'badge badge-warning',
  trial: 'badge badge-info',
  upcoming: 'badge badge-info',
  ongoing: 'badge badge-warning',
  info: 'badge badge-info',

  suspended: 'badge badge-danger',
  absent: 'badge badge-danger',
  overdue: 'badge badge-danger',
  cancelled: 'badge badge-info',
  downgraded: 'badge badge-danger',
  offline: 'badge badge-warning',

  alumni: 'badge badge-info',
  excused: 'badge badge-info',
  late: 'badge badge-warning',

  normal: 'badge badge-info',
  high: 'badge badge-warning',
  urgent: 'badge badge-danger',
  low: 'badge badge-success',
};

export function StatusBadge({ status, className = '' }: { status: string; className?: string }) {
  const cls = STATUS_MAP[status] || 'badge badge-info';
  return <span className={`${cls} ${className}`}>{status}</span>;
}
