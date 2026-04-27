import { redirect, notFound } from 'next/navigation';
import AgentTicketDetail from './AgentTicketDetail';
import { getCurrentUser } from '@/lib/auth';
import { getTicketById } from '@/lib/tickets';
import { db } from '@/lib/db';

export default async function AgentTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role === 'CUSTOMER') {
    redirect('/');
  }

  const { id } = await params;
  const [ticket, agents] = await Promise.all([
    getTicketById(id),
    db.user.findMany({
      where: { role: { in: ['SUPPORT_AGENT', 'ADMIN'] } },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  if (!ticket) notFound();

  return <AgentTicketDetail ticket={ticket} currentUser={user} agents={agents} />;
}
