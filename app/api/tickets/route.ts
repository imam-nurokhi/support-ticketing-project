import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getAdminDashboardData, getAgentTickets, getCustomerTickets, serializeTicket, ticketInclude, toTicketId } from '@/lib/tickets';
import { PRIORITIES } from '@/lib/types';

const createTicketSchema = z.object({
  department: z.string().trim().min(2).max(60),
  title: z.string().trim().min(5).max(140),
  description: z.string().trim().min(10).max(5000),
  priority: z.enum(PRIORITIES),
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
    },
    include: ticketInclude,
  });

  return Response.json({ ticket: serializeTicket(ticket) }, { status: 201 });
}
