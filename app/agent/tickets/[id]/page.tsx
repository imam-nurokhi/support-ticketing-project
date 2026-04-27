import { notFound } from 'next/navigation';
import AgentTicketDetail from './AgentTicketDetail';
import { requireUser } from '@/lib/auth';
import { getTicketForStaff } from '@/lib/tickets';

export default async function AgentTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(['SUPPORT_AGENT', 'ADMIN'], '/agent');
  const { id } = await params;
  const ticket = await getTicketForStaff(id);
  if (!ticket) notFound();
  return <AgentTicketDetail ticket={ticket} currentUser={user} />;
}
