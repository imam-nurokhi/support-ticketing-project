import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'SUPPORT_AGENT' && user.role !== 'ADMIN')) {
    return Response.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const body = await request.json();
  const { assigneeId } = body as { assigneeId?: string | null };

  if (assigneeId === undefined) {
    return Response.json({ error: 'assigneeId is required.' }, { status: 400 });
  }

  const { id } = await context.params;

  const existingTicket = await db.ticket.findUnique({ where: { id } });

  if (!existingTicket) {
    return Response.json({ error: 'Ticket not found.' }, { status: 404 });
  }

  if (assigneeId !== null) {
    const assignee = await db.user.findUnique({ where: { id: assigneeId } });
    if (!assignee || (assignee.role !== 'SUPPORT_AGENT' && assignee.role !== 'ADMIN')) {
      return Response.json({ error: 'Invalid assignee.' }, { status: 400 });
    }
  }

  await db.ticket.update({
    where: { id },
    data: {
      assigneeId,
      auditLogs: {
        create: {
          userId: user.id,
          action: 'ASSIGNEE_CHANGED',
          oldValue: existingTicket.assigneeId,
          newValue: assigneeId,
        },
      },
    },
  });

  return Response.json({ success: true });
}
