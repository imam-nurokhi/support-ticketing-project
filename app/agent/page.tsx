import Link from 'next/link';
import { getTicketsForAgent, getTicketStats } from '@/lib/mock-data';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { SlaIndicator } from '@/components/ui/SlaIndicator';
import { Headphones, LayoutDashboard, Inbox, Settings, Users, BarChart3, LogOut, ArrowUpRight } from 'lucide-react';

export default function AgentDashboardPage() {
  const tickets = getTicketsForAgent();
  const stats = getTicketStats();

  const statCards = [
    { label: 'Open', value: stats.open, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { label: 'In Progress', value: stats.inProgress, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { label: 'Waiting', value: stats.waitingOnCustomer, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    { label: 'Resolved', value: stats.resolved, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    { label: 'Urgent', value: stats.urgent, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    { label: 'Unassigned', value: stats.unassigned, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Headphones className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Resolv</div>
              <div className="text-slate-400 text-xs">Agent Portal</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', href: '/agent', active: true },
            { icon: Inbox, label: 'All Tickets', href: '/agent', active: false },
            { icon: Users, label: 'Customers', href: '/agent', active: false },
            { icon: BarChart3, label: 'Reports', href: '/agent', active: false },
            { icon: Settings, label: 'Settings', href: '/agent', active: false },
          ].map((item) => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${item.active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="h-7 w-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">C</div>
            <div>
              <div className="text-white text-xs font-medium">Carol Davis</div>
              <div className="text-slate-500 text-xs">Support Agent</div>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded hover:bg-slate-800 mt-1">
            <LogOut className="h-3.5 w-3.5" /> Customer View
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-slate-50">
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-500 text-sm">Welcome back, Carol. Here&apos;s what needs your attention.</p>
            </div>
            <Link href="/help/tickets/new" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              New Ticket
            </Link>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {statCards.map((stat) => (
              <div key={stat.label} className={`${stat.bg} ${stat.border} border rounded-xl p-4`}>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-slate-600 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Tickets Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">All Tickets</h2>
              <div className="flex items-center gap-2">
                {['All', 'Assigned to Me', 'Unassigned', 'Urgent'].map((filter) => (
                  <button key={filter} className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${filter === 'All' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                    {filter}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100">
                    <th className="px-6 py-3 text-left font-medium">Ticket ID</th>
                    <th className="px-6 py-3 text-left font-medium">Subject</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-left font-medium">Priority</th>
                    <th className="px-6 py-3 text-left font-medium">Customer</th>
                    <th className="px-6 py-3 text-left font-medium">Assignee</th>
                    <th className="px-6 py-3 text-left font-medium">SLA</th>
                    <th className="px-6 py-3 text-left font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">{ticket.ticketId}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 text-sm max-w-xs truncate">{ticket.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{ticket.department}</div>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={ticket.status} /></td>
                      <td className="px-6 py-4"><PriorityBadge priority={ticket.priority} /></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-semibold text-slate-600">
                            {ticket.author.name.charAt(0)}
                          </div>
                          <span className="text-sm text-slate-700">{ticket.author.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {ticket.assignee ? (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-700">
                              {ticket.assignee.name.charAt(0)}
                            </div>
                            <span className="text-sm text-slate-700">{ticket.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4"><SlaIndicator createdAt={ticket.createdAt} status={ticket.status} /></td>
                      <td className="px-6 py-4">
                        <Link href={`/agent/tickets/${ticket.id}`} className="text-blue-600 hover:text-blue-700">
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
      </main>
    </div>
  );
}
