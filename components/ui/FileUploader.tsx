'use client';

import { useRef, useState } from 'react';
import { Paperclip, X, AlertCircle } from 'lucide-react';

export interface UploadedFile {
  storedName: string;
  filename: string;
  mimeType: string;
  size: number;
}

interface FileUploaderProps {
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  className?: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('word')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📊';
  if (mimeType.includes('zip')) return '🗜️';
  return '📎';
}

export default function FileUploader({ onFilesChange, maxFiles = 5, className = '' }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  async function handleFiles(selected: FileList | null) {
    if (!selected || selected.length === 0) return;

    const remaining = maxFiles - files.length;
    if (remaining <= 0) {
      setError(`Maximum ${maxFiles} files allowed.`);
      return;
    }

    const filesToUpload = Array.from(selected).slice(0, remaining);
    setUploading(true);
    setError('');

    const formData = new FormData();
    for (const file of filesToUpload) {
      formData.append('files', file);
    }

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Upload failed.');
        return;
      }

      const updated = [...files, ...data.files];
      setFiles(updated);
      onFilesChange(updated);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function removeFile(storedName: string) {
    const updated = files.filter((f) => f.storedName !== storedName);
    setFiles(updated);
    onFilesChange(updated);
  }

  return (
    <div className={className}>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        className={`relative border-2 border-dashed rounded-xl p-4 transition-colors cursor-pointer text-center ${
          dragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
        } ${files.length >= maxFiles ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Upload files"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
        />
        <div className="flex flex-col items-center gap-2 py-2">
          {uploading ? (
            <svg className="h-6 w-6 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <Paperclip className="h-4 w-4 text-slate-500" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-slate-600">
              {uploading ? 'Uploading…' : 'Attach files'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Drag & drop or click — images, PDF, Word, Excel, ZIP (max 10 MB each, {maxFiles} files)
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-2 flex items-start gap-1.5 text-xs text-rose-600">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {files.map((file) => (
            <div
              key={file.storedName}
              className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
            >
              <span className="text-base flex-shrink-0">{fileIcon(file.mimeType)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate">{file.filename}</p>
                <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFile(file.storedName); }}
                className="flex-shrink-0 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                aria-label={`Remove ${file.filename}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
