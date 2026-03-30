import { getTicketById } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import AgentTicketDetail from './AgentTicketDetail';

export default async function AgentTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = getTicketById(id);
  if (!ticket) notFound();
  return <AgentTicketDetail ticket={ticket} />;
}
