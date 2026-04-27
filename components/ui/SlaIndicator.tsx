'use client';

import { useState } from 'react';
import { formatDistanceToNow } from '@/lib/utils';

interface SlaIndicatorProps {
  createdAt: Date | string;
  status: string;
}

export function SlaIndicator({ createdAt, status }: SlaIndicatorProps) {
  const [now] = useState(() => Date.now());
  const hoursSince = (now - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  const isResolved = status === 'RESOLVED' || status === 'CLOSED';

  if (isResolved) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-bold text-emerald-600">
          ✓
        </span>
        Resolved
      </span>
    );
  }

  if (hoursSince < 4) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
        On track · {formatDistanceToNow(new Date(createdAt))} ago
      </span>
    );
  }

  if (hoursSince < 8) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
        At risk · {formatDistanceToNow(new Date(createdAt))} ago
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600">
      <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
        <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
      </span>
      Overdue · {formatDistanceToNow(new Date(createdAt))} ago
    </span>
  );
}
