import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import {
  BarChart3,
  Inbox,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from 'lucide-react';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import Image from 'next/image';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/agent' },
  { icon: Inbox, label: 'All Tickets', href: '/agent/tickets' },
  { icon: Users, label: 'Customers', href: '/agent/customers' },
  { icon: BarChart3, label: 'Reports', href: '/agent/reports' },
  { icon: Settings, label: 'Settings', href: '/agent/settings' },
];

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

  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const tabs = ['All', 'Open', 'In Progress', 'Closed'];

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 bg-slate-950 border-r border-slate-800 flex-col h-screen sticky top-0">
        {/* Logo */}
        <div className="p-4 border-b border-slate-800 flex items-center">
          <Link href="/agent" className="flex items-center gap-2.5">
            <Image src="/nexora-logo.png" alt="Nexora" width={80} height={24} className="object-contain" />
            <div>
              <div className="font-bold text-white text-sm leading-tight">Support</div>
              <div className="text-blue-400 text-xs">Agent Portal</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === '/agent'
                ? false
                : true && item.href === '/agent/tickets';
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User block */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-semibold truncate">{user.name}</div>
              <div className="text-slate-500 text-xs truncate">
                {user.role === 'ADMIN' ? 'Administrator' : 'Support Agent'}
              </div>
            </div>
          </div>
          <div className="mt-1 flex flex-col gap-0.5">
            {user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="flex items-center gap-2 text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <BarChart3 className="h-3.5 w-3.5 flex-shrink-0" />
                Admin Dashboard
              </Link>
            )}
            <Link
              href="/help"
              className="flex items-center gap-2 text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5 flex-shrink-0" />
              Customer View
            </Link>
            <LogoutButton className="text-left text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors w-full" />
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-slate-50 min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">All Tickets</h1>
              <p className="text-slate-500 text-xs sm:text-sm hidden sm:block">
                {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <Link
              href="/help/tickets/new"
              className="flex-shrink-0 flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              New Ticket
            </Link>
          </div>
        </header>

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
      </main>
    </div>
  );
}
