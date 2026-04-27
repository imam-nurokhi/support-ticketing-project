'use client';
import type { Priority } from '@/lib/types';

const priorityConfig: Record<Priority, { label: string; className: string; dotClass: string; pulse?: boolean }> = {
  LOW: { label: 'Low', className: 'bg-slate-100 text-slate-600 border-slate-200', dotClass: 'bg-slate-400' },
  MEDIUM: { label: 'Medium', className: 'bg-sky-100 text-sky-700 border-sky-200', dotClass: 'bg-sky-500' },
  HIGH: { label: 'High', className: 'bg-orange-100 text-orange-700 border-orange-200', dotClass: 'bg-orange-500' },
  URGENT: { label: 'Urgent', className: 'bg-rose-100 text-rose-700 border-rose-200', dotClass: 'bg-rose-500', pulse: true },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = priorityConfig[priority];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.pulse ? (
        <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dotClass}`} />
        </span>
      ) : (
        <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${config.dotClass}`} />
      )}
      {config.label}
    </span>
  );
}
