import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getTicketForCustomer, getTicketForStaff, serializeTicket, ticketInclude } from '@/lib/tickets';
import { PRIORITIES, TICKET_STATUSES } from '@/lib/types';

const updateTicketSchema = z.object({
  status: z.enum(TICKET_STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  assigneeId: z.string().nullable().optional(),
});

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = await context.params;
  const ticket =
    user.role === 'CUSTOMER'
      ? await getTicketForCustomer(id, user.id)
      : await getTicketForStaff(id);

  if (!ticket) {
    return Response.json({ error: 'Ticket not found.' }, { status: 404 });
  }

  return Response.json({ ticket });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'SUPPORT_AGENT' && user.role !== 'ADMIN')) {
    return Response.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const payload = updateTicketSchema.safeParse(await request.json());

  if (!payload.success) {
    return Response.json({ error: 'Invalid ticket update.' }, { status: 400 });
  }

  const { id } = await context.params;
  const existingTicket = await db.ticket.findUnique({
    where: { id },
  });

  if (!existingTicket) {
    return Response.json({ error: 'Ticket not found.' }, { status: 404 });
  }

  if (payload.data.assigneeId) {
    const assignee = await db.user.findUnique({
      where: { id: payload.data.assigneeId },
    });

    if (!assignee || (assignee.role !== 'SUPPORT_AGENT' && assignee.role !== 'ADMIN')) {
      return Response.json({ error: 'Invalid assignee.' }, { status: 400 });
    }
  }

  const auditLogs = [];

  if (payload.data.status && payload.data.status !== existingTicket.status) {
    auditLogs.push({
      userId: user.id,
      action: 'STATUS_CHANGED',
      oldValue: existingTicket.status,
      newValue: payload.data.status,
    });
  }

  if (payload.data.priority && payload.data.priority !== existingTicket.priority) {
    auditLogs.push({
      userId: user.id,
      action: 'PRIORITY_CHANGED',
      oldValue: existingTicket.priority,
      newValue: payload.data.priority,
    });
  }

  if (payload.data.assigneeId !== undefined && payload.data.assigneeId !== existingTicket.assigneeId) {
    auditLogs.push({
      userId: user.id,
      action: 'ASSIGNEE_CHANGED',
      oldValue: existingTicket.assigneeId,
      newValue: payload.data.assigneeId,
    });
  }

  const closedAt =
    payload.data.status && ['RESOLVED', 'CLOSED'].includes(payload.data.status)
      ? existingTicket.closedAt ?? new Date()
      : payload.data.status
        ? null
        : existingTicket.closedAt;

  const ticket = await db.ticket.update({
    where: { id },
    data: {
      status: payload.data.status,
      priority: payload.data.priority,
      assigneeId: payload.data.assigneeId,
      closedAt,
      auditLogs: auditLogs.length > 0 ? { create: auditLogs } : undefined,
    },
    include: ticketInclude,
  });

  return Response.json({ ticket: serializeTicket(ticket) });
}
