import { requireUser } from '@/lib/auth';
import { buildDashboardSummary, getAgentTickets } from '@/lib/tickets';
import AgentClientLayout from './AgentClientLayout';

export default async function AgentDashboardPage() {
  const user = await requireUser(['SUPPORT_AGENT', 'ADMIN'], '/agent');
  const tickets = await getAgentTickets(user.id, user.role === 'ADMIN');
  const summary = buildDashboardSummary(tickets);

  return <AgentClientLayout user={user} tickets={tickets} summary={summary} />;
}
