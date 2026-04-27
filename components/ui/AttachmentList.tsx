import type { AttachmentView } from '@/lib/types';

function fileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('word')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📊';
  if (mimeType.includes('zip')) return '🗜️';
  return '📎';
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentList({ attachments, dark = false }: { attachments: AttachmentView[]; dark?: boolean }) {
  if (attachments.length === 0) return null;

  return (
    <div className="mt-2.5 flex flex-col gap-1.5">
      {attachments.map((att) => {
        return (
          <a
            key={att.id}
            href={`/api/uploads/${encodeURIComponent(att.storedName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              dark
                ? 'bg-blue-700/40 text-blue-100 hover:bg-blue-700/60'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{fileIcon(att.mimeType)}</span>
            <span className="truncate flex-1">{att.filename}</span>
            <span className={`flex-shrink-0 ${dark ? 'text-blue-300' : 'text-slate-400'}`}>{formatBytes(att.size)}</span>
          </a>
        );
      })}
    </div>
  );
}
