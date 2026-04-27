import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(/*turbopackIgnore: true*/ process.cwd(), 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-zip-compressed',
]);

async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export interface StoredFile {
  storedName: string;
  filename: string;
  mimeType: string;
  size: number;
}

export async function storeUploadedFile(file: File): Promise<{ error: string } | StoredFile> {
  if (file.size > MAX_FILE_SIZE) {
    return { error: `File "${file.name}" exceeds 10 MB limit.` };
  }

  const mimeType = file.type || 'application/octet-stream';
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return { error: `File type "${mimeType}" is not allowed.` };
  }

  await ensureUploadDir();

  const ext = path.extname(file.name).toLowerCase().slice(1);
  const storedName = `${randomUUID()}${ext ? `.${ext}` : ''}`;
  const filePath = path.join(UPLOAD_DIR, storedName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return {
    storedName,
    filename: file.name,
    mimeType,
    size: file.size,
  };
}

export async function readUploadedFile(storedName: string): Promise<Buffer | null> {
  // Prevent path traversal
  const safeName = path.basename(storedName);
  const filePath = path.join(UPLOAD_DIR, safeName);

  if (!filePath.startsWith(UPLOAD_DIR)) {
    return null;
  }

  try {
    return await readFile(filePath);
  } catch {
    return null;
  }
}

export { UPLOAD_DIR };
