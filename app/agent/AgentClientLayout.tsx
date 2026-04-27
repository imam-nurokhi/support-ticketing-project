'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import AgentSidebarLayout from '@/components/agent/AgentSidebarLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { SlaIndicator } from '@/components/ui/SlaIndicator';
import type { DashboardSummary, SessionUser, TicketView } from '@/lib/types';

interface AgentClientLayoutProps {
  user: SessionUser;
  tickets: TicketView[];
  summary: DashboardSummary;
}

const filterTabs = ['All', 'Assigned to Me', 'Unassigned', 'Urgent'];

export default function AgentClientLayout({ user, tickets, summary }: AgentClientLayoutProps) {
  const [activeFilter, setActiveFilter] = useState('All');

  const statCards = [
    { label: 'Open', value: summary.byStatus.open, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { label: 'In Progress', value: summary.byStatus.in_progress, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { label: 'Waiting', value: summary.byStatus.pending, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
    { label: 'Resolved', value: summary.byStatus.closed, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { label: 'Urgent', value: tickets.filter((t) => t.priority === 'URGENT').length, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
    { label: 'Unassigned', value: tickets.filter((t) => !t.assignee).length, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
  ];

  const filteredTickets = tickets.filter((t) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Assigned to Me') return t.assignee?.id === user.id;
    if (activeFilter === 'Unassigned') return !t.assignee;
    if (activeFilter === 'Urgent') return t.priority === 'URGENT';
    return true;
  });

  return (
    <AgentSidebarLayout
      user={user}
      title="Dashboard"
      subtitle={`Welcome back, ${user.name}. Here's what needs your attention.`}
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
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className={`${stat.bg} ${stat.border} border rounded-xl p-3 sm:p-4`}>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-slate-600 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <h2 className="font-semibold text-slate-900 text-sm sm:text-base">All Tickets</h2>
            <div className="flex items-center gap-1.5 flex-wrap">
              {filterTabs.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${
                    activeFilter === filter
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 bg-slate-50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 sm:px-6 py-3 text-left font-medium">Ticket ID</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium">Subject</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium">Priority</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium">Customer</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium">Assignee</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium">SLA</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400 text-sm">
                      No tickets found.
                    </td>
                  </tr>
                )}
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-4 sm:px-6 py-3.5 text-xs font-mono text-slate-400 whitespace-nowrap">
                      {ticket.ticketId}
                    </td>
                    <td className="px-4 sm:px-6 py-3.5">
                      <div className="font-medium text-slate-900 text-sm max-w-[200px] truncate">
                        {ticket.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{ticket.department}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                      <PriorityBadge priority={ticket.priority} />
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
                    <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                      <SlaIndicator createdAt={ticket.createdAt} status={ticket.status} />
                    </td>
                    <td className="px-4 sm:px-6 py-3.5">
                      <Link
                        href={`/agent/tickets/${ticket.id}`}
                        className="text-slate-300 group-hover:text-blue-600 transition-colors"
                        aria-label="Open ticket"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
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
