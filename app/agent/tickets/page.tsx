import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import AgentSidebarLayout from '@/components/agent/AgentSidebarLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';

const STATUS_FILTER_MAP: Record<string, string[]> = {
  Open: ['OPEN'],
  'In Progress': ['IN_PROGRESS'],
  Closed: ['CLOSED', 'RESOLVED'],
};

export default async function AgentTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireUser(['SUPPORT_AGENT', 'ADMIN']);
  const { status: statusFilter } = await searchParams;

  const whereStatus =
    statusFilter && STATUS_FILTER_MAP[statusFilter]
      ? { status: { in: STATUS_FILTER_MAP[statusFilter] } }
      : {};

  const tickets = await db.ticket.findMany({
    where: whereStatus,
    include: { author: true, assignee: true },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  });

  const tabs = ['All', 'Open', 'In Progress', 'Closed'];

  return (
    <AgentSidebarLayout
      user={user}
      title="All Tickets"
      subtitle={`${tickets.length} ticket${tickets.length !== 1 ? 's' : ''} found`}
      actions={
        <Link
          href="/help/tickets/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          New Ticket
        </Link>
      }
    >
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Filter tabs */}
        <div className="flex items-center gap-1.5 flex-wrap mb-6">
          {tabs.map((tab) => {
            const isActive = (tab === 'All' && !statusFilter) || statusFilter === tab;
            const href = tab === 'All' ? '/agent/tickets' : `/agent/tickets?status=${encodeURIComponent(tab)}`;
            return (
              <Link
                key={tab}
                href={href}
                className={`text-sm px-4 py-2 rounded-lg transition-colors font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200 bg-white border border-slate-200'
                }`}
              >
                {tab}
              </Link>
            );
          })}
        </div>

        {/* Tickets table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 sm:px-6 py-3 text-left font-medium">Ticket ID</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium">Title</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium">Priority</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium">Customer</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium">Assignee</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                      No tickets found.
                    </td>
                  </tr>
                )}
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                  >
                    <td className="px-4 sm:px-6 py-3.5 text-xs font-mono text-slate-400 whitespace-nowrap">
                      <Link href={`/agent/tickets/${ticket.id}`} className="hover:text-blue-600 transition-colors">
                        {ticket.ticketId}
                      </Link>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5">
                      <Link href={`/agent/tickets/${ticket.id}`} className="block">
                        <div className="font-medium text-slate-900 text-sm max-w-[220px] truncate group-hover:text-blue-700 transition-colors">
                          {ticket.title}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{ticket.department}</div>
                      </Link>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                      <StatusBadge status={ticket.status as never} />
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                      <PriorityBadge priority={ticket.priority as never} />
                    </td>
                    <td className="px-4 sm:px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-semibold text-slate-600 flex-shrink-0">
                          {ticket.author.name.charAt(0)}
                        </div>
                        <span className="text-sm text-slate-700 truncate max-w-[100px]">
                          {ticket.author.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5">
                      {ticket.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-700 flex-shrink-0">
                            {ticket.assignee.name.charAt(0)}
                          </div>
                          <span className="text-sm text-slate-700 truncate max-w-[100px]">
                            {ticket.assignee.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap text-xs text-slate-400">
                      {new Date(ticket.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AgentSidebarLayout>
  );
}
