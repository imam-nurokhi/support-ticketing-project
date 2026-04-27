import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getAdminDashboardData, getAgentTickets, getCustomerTickets, serializeTicket, ticketInclude, toTicketId } from '@/lib/tickets';
import { PRIORITIES } from '@/lib/types';
import { sendTicketCreatedEmails } from '@/lib/email';

const createTicketSchema = z.object({
  department: z.string().trim().min(2).max(60),
  title: z.string().trim().min(5).max(140),
  description: z.string().trim().min(10).max(5000),
  priority: z.enum(PRIORITIES),
  attachments: z.array(z.object({
    storedName: z.string(),
    filename: z.string(),
    mimeType: z.string(),
    size: z.number(),
  })).max(5).optional().default([]),
});

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (user.role === 'ADMIN') {
    const { details } = await getAdminDashboardData();
    return Response.json({ tickets: details });
  }

  if (user.role === 'SUPPORT_AGENT') {
    const tickets = await getAgentTickets(user.id);
    return Response.json({ tickets });
  }

  const tickets = await getCustomerTickets(user.id);
  return Response.json({ tickets });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const payload = createTicketSchema.safeParse(await request.json());

  if (!payload.success) {
    return Response.json({ error: 'Invalid ticket payload.' }, { status: 400 });
  }

  const id = randomUUID().replace(/-/g, '');

  const ticket = await db.ticket.create({
    data: {
      ticketId: toTicketId(null, id),
      title: payload.data.title,
      description: payload.data.description,
      status: 'OPEN',
      priority: payload.data.priority,
      department: payload.data.department,
      authorId: user.id,
      requesterAvatarUrl: user.avatarUrl,
      comments: {
        create: {
          authorId: user.id,
          message: payload.data.description,
          isInternalNote: false,
        },
      },
      auditLogs: {
        create: {
          userId: user.id,
          action: 'CREATED',
          newValue: 'Ticket created',
        },
      },
      attachments: payload.data.attachments.length > 0 ? {
        create: payload.data.attachments.map((att) => ({
          filename: att.filename,
          storedName: att.storedName,
          mimeType: att.mimeType,
          size: att.size,
          uploaderId: user.id,
        })),
      } : undefined,
    },
    include: ticketInclude,
  });

  // Send email notifications asynchronously (don't block response)
  sendTicketCreatedEmails({
    ticketId: ticket.ticketId,
    ticketDbId: ticket.id,
    title: ticket.title,
    department: ticket.department,
    priority: ticket.priority,
    status: ticket.status,
    authorName: user.name,
    authorEmail: user.email,
  }).catch((err) => console.error('[Email] sendTicketCreatedEmails error:', err));

  return Response.json({ ticket: serializeTicket(ticket) }, { status: 201 });
}
