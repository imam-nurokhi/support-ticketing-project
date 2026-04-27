import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import type { TicketStatus } from '@/lib/types';
import { sendStatusChangedEmails } from '@/lib/email';

const statusMap: Record<string, TicketStatus> = {
  open: 'OPEN',
  in_progress: 'IN_PROGRESS',
  waiting_on_customer: 'WAITING_ON_CUSTOMER',
  resolved: 'RESOLVED',
  closed: 'CLOSED',
};

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'SUPPORT_AGENT' && user.role !== 'ADMIN')) {
    return Response.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const body = await request.json();
  const { status } = body as { status?: string };

  if (!status || !statusMap[status]) {
    return Response.json({ error: 'Invalid status value.' }, { status: 400 });
  }

  const { id } = await context.params;
  const prismaStatus = statusMap[status];

  const existingTicket = await db.ticket.findUnique({
    where: { id },
    include: { author: true, assignee: true },
  });

  if (!existingTicket) {
    return Response.json({ error: 'Ticket not found.' }, { status: 404 });
  }

  const closedAt = ['RESOLVED', 'CLOSED'].includes(prismaStatus)
    ? (existingTicket.closedAt ?? new Date())
    : null;

  await db.ticket.update({
    where: { id },
    data: {
      status: prismaStatus,
      closedAt,
      auditLogs: {
        create: {
          userId: user.id,
          action: 'STATUS_CHANGED',
          oldValue: existingTicket.status,
          newValue: prismaStatus,
        },
      },
    },
  });

  // Send email notification asynchronously
  sendStatusChangedEmails({
    ticketId: existingTicket.ticketId,
    ticketDbId: existingTicket.id,
    title: existingTicket.title,
    oldStatus: existingTicket.status,
    newStatus: prismaStatus,
    changedByName: user.name,
    customerName: existingTicket.author.name,
    customerEmail: existingTicket.author.email,
    assigneeName: existingTicket.assignee?.name ?? null,
    assigneeEmail: existingTicket.assignee?.email ?? null,
  }).catch((err) => console.error('[Email] sendStatusChangedEmails error:', err));

  return Response.json({ success: true });
}
