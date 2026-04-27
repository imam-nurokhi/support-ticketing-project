import type { TicketStatus } from '@/lib/types';

const statusConfig: Record<TicketStatus, { label: string; className: string; dotClass: string }> = {
  OPEN: { label: 'Open', className: 'bg-violet-100 text-violet-700 border-violet-200', dotClass: 'bg-violet-500' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-amber-100 text-amber-700 border-amber-200', dotClass: 'bg-amber-500' },
  WAITING_ON_CUSTOMER: { label: 'Waiting', className: 'bg-sky-100 text-sky-700 border-sky-200', dotClass: 'bg-sky-500' },
  RESOLVED: { label: 'Resolved', className: 'bg-emerald-100 text-emerald-700 border-emerald-200', dotClass: 'bg-emerald-500' },
  CLOSED: { label: 'Closed', className: 'bg-slate-100 text-slate-500 border-slate-200', dotClass: 'bg-slate-400' },
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${config.dotClass}`} />
      {config.label}
    </span>
  );
}
