import { redirect, notFound } from 'next/navigation';
import AgentTicketDetail from './AgentTicketDetail';
import { getCurrentUser } from '@/lib/auth';
import { getTicketById } from '@/lib/tickets';

export default async function AgentTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role === 'CUSTOMER') {
    redirect('/');
  }

  const { id } = await params;
  const ticket = await getTicketById(id);
  if (!ticket) notFound();

  return <AgentTicketDetail ticket={ticket} currentUser={user} />;
}
