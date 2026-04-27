import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { readUploadedFile } from '@/lib/upload';

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const user = await getCurrentUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { filename } = await context.params;

  // Find attachment in database to verify access
  const attachment = await db.ticketAttachment.findUnique({
    where: { storedName: filename },
    include: {
      ticket: {
        select: { authorId: true, assigneeId: true },
      },
    },
  });

  if (!attachment) {
    return new Response('Not found', { status: 404 });
  }

  // Access control: customer can only see attachments on their own tickets
  if (user.role === 'CUSTOMER' && attachment.ticket.authorId !== user.id) {
    return new Response('Forbidden', { status: 403 });
  }

  const buffer = await readUploadedFile(filename);
  if (!buffer) {
    return new Response('File not found', { status: 404 });
  }

  const safeName = encodeURIComponent(attachment.filename);

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': attachment.mimeType,
      'Content-Length': String(buffer.length),
      'Content-Disposition': `inline; filename="${safeName}"`,
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
