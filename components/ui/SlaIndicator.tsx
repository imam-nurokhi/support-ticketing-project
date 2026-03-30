import { formatDistanceToNow } from '@/lib/utils';

interface SlaIndicatorProps {
  createdAt: Date;
  status: string;
}

export function SlaIndicator({ createdAt, status }: SlaIndicatorProps) {
  const hoursSince = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  const isResolved = status === 'RESOLVED' || status === 'CLOSED';

  if (isResolved) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600">
        <span className="h-2 w-2 rounded-full bg-green-500"></span>
        Resolved
      </span>
    );
  }

  const colorClass = hoursSince < 4 ? 'text-green-600' : hoursSince < 8 ? 'text-amber-600' : 'text-red-600';
  const dotClass = hoursSince < 4 ? 'bg-green-500' : hoursSince < 8 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <span className={`inline-flex items-center gap-1 text-xs ${colorClass}`}>
      <span className={`h-2 w-2 rounded-full ${dotClass}`}></span>
      {formatDistanceToNow(new Date(createdAt))} ago
    </span>
  );
}
