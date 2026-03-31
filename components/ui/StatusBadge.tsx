import { TicketStatus } from '@/lib/mock-data';

const statusConfig: Record<TicketStatus, { label: string; className: string }> = {
  OPEN: { label: 'Open', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  WAITING_ON_CUSTOMER: { label: 'Waiting', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  RESOLVED: { label: 'Resolved', className: 'bg-green-100 text-green-700 border-green-200' },
  CLOSED: { label: 'Closed', className: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
}
