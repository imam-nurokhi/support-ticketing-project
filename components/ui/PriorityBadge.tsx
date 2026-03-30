'use client';
import { Priority } from '@/lib/mock-data';

const priorityConfig: Record<Priority, { label: string; className: string; pulse?: boolean }> = {
  LOW: { label: 'Low', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  MEDIUM: { label: 'Medium', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  HIGH: { label: 'High', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  URGENT: { label: 'Urgent', className: 'bg-red-100 text-red-700 border-red-200', pulse: true },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = priorityConfig[priority];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      )}
      {config.label}
    </span>
  );
}
