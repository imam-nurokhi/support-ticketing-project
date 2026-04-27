import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { serializeTicket, ticketInclude } from '@/lib/tickets';
import { sendCommentEmails } from '@/lib/email';

const commentSchema = z.object({
  message: z.string().trim().min(1).max(5000),
  isInternalNote: z.boolean().optional().default(false),
  attachments: z.array(z.object({
    storedName: z.string(),
    filename: z.string(),
    mimeType: z.string(),
    size: z.number(),
  })).max(5).optional().default([]),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const payload = commentSchema.safeParse(await request.json());

  if (!payload.success) {
    return Response.json({ error: 'Invalid comment payload.' }, { status: 400 });
  }

  const { id } = await context.params;
  const ticket = await db.ticket.findUnique({
    where: { id },
    include: { author: true, assignee: true },
  });

  if (!ticket) {
    return Response.json({ error: 'Ticket not found.' }, { status: 404 });
  }

  if (user.role === 'CUSTOMER' && ticket.authorId !== user.id) {
    return Response.json({ error: 'Forbidden.' }, { status: 403 });
  }

  if (user.role === 'CUSTOMER' && payload.data.isInternalNote) {
    return Response.json({ error: 'Customers cannot add internal notes.' }, { status: 403 });
  }

  if (user.role === 'CUSTOMER' && ['RESOLVED', 'CLOSED'].includes(ticket.status)) {
    return Response.json({ error: 'Closed tickets cannot receive customer replies.' }, { status: 400 });
  }

  let nextStatus = ticket.status;

  if (user.role === 'CUSTOMER' && ticket.status === 'WAITING_ON_CUSTOMER') {
    nextStatus = 'IN_PROGRESS';
  }

  if ((user.role === 'SUPPORT_AGENT' || user.role === 'ADMIN') && !payload.data.isInternalNote) {
    nextStatus = 'WAITING_ON_CUSTOMER';
  }

  const comment = await db.ticketComment.create({
    data: {
      ticketId: ticket.id,
      authorId: user.id,
      message: payload.data.message,
      isInternalNote: payload.data.isInternalNote,
      attachments: payload.data.attachments.length > 0 ? {
        create: payload.data.attachments.map((att) => ({
          ticketId: ticket.id,
          filename: att.filename,
          storedName: att.storedName,
          mimeType: att.mimeType,
          size: att.size,
          uploaderId: user.id,
        })),
      } : undefined,
    },
  });

  const updatedTicket = await db.ticket.update({
    where: { id: ticket.id },
    data: {
      status: nextStatus,
      auditLogs: {
        create: {
          userId: user.id,
          action: payload.data.isInternalNote ? 'INTERNAL_NOTE_ADDED' : 'COMMENT_ADDED',
          newValue: nextStatus !== ticket.status ? nextStatus : null,
        },
      },
    },
    include: ticketInclude,
  });

  // Send email notifications asynchronously
  sendCommentEmails({
    ticketId: ticket.ticketId,
    ticketDbId: ticket.id,
    title: ticket.title,
    message: payload.data.message,
    isInternalNote: payload.data.isInternalNote,
    authorName: user.name,
    authorRole: user.role,
    customerName: ticket.author.name,
    customerEmail: ticket.author.email,
    assigneeName: ticket.assignee?.name ?? null,
    assigneeEmail: ticket.assignee?.email ?? null,
    attachmentCount: payload.data.attachments.length,
  }).catch((err) => console.error('[Email] sendCommentEmails error:', err));

  return Response.json({ ticket: serializeTicket(updatedTicket), commentId: comment.id }, { status: 201 });
}
