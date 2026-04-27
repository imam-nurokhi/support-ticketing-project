import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendAssignedEmail } from '@/lib/email';

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

  const existingTicket = await db.ticket.findUnique({
    where: { id },
    include: { author: true },
  });

  if (!existingTicket) {
    return Response.json({ error: 'Ticket not found.' }, { status: 404 });
  }

  let assignee = null;
  if (assigneeId !== null) {
    assignee = await db.user.findUnique({ where: { id: assigneeId } });
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

  // Send assignment email notification to the new assignee asynchronously
  if (assigneeId && assignee && assigneeId !== existingTicket.assigneeId) {
    sendAssignedEmail({
      ticketId: existingTicket.ticketId,
      ticketDbId: existingTicket.id,
      title: existingTicket.title,
      customerName: existingTicket.author.name,
      customerEmail: existingTicket.author.email,
      assigneeName: assignee.name,
      assigneeEmail: assignee.email,
      assignedByName: user.name,
    }).catch((err) => console.error('[Email] sendAssignedEmail error:', err));
  }

  return Response.json({ success: true });
}
