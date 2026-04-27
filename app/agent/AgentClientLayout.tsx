'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  ArrowUpRight,
  BarChart3,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { SlaIndicator } from '@/components/ui/SlaIndicator';
import type { DashboardSummary, SessionUser, TicketView } from '@/lib/types';

interface AgentClientLayoutProps {
  user: SessionUser;
  tickets: TicketView[];
  summary: DashboardSummary;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/agent' },
  { icon: Inbox, label: 'All Tickets', href: '/agent/tickets' },
  { icon: Users, label: 'Customers', href: '/agent/customers' },
  { icon: BarChart3, label: 'Reports', href: '/agent/reports' },
  { icon: Settings, label: 'Settings', href: '/agent/settings' },
];

const filterTabs = ['All', 'Assigned to Me', 'Unassigned', 'Urgent'];

export default function AgentClientLayout({ user, tickets, summary }: AgentClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const pathname = usePathname();

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const statCards = [
    { label: 'Open', value: summary.byStatus.open, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { label: 'In Progress', value: summary.byStatus.in_progress, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { label: 'Waiting', value: summary.byStatus.pending, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
    { label: 'Resolved', value: summary.byStatus.closed, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { label: 'Urgent', value: tickets.filter((t) => t.priority === 'URGENT').length, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
    { label: 'Unassigned', value: tickets.filter((t) => !t.assignee).length, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
  ];

  const sidebar = (
    <aside className="w-60 bg-slate-950 border-r border-slate-800 flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/nexora-logo.png" alt="Nexora" width={80} height={24} className="object-contain" />
          <div>
            <div className="font-bold text-white text-sm leading-tight">Support</div>
            <div className="text-blue-400 text-xs">Agent Portal</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="md:hidden text-slate-400 hover:text-white p-1 rounded"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
            const isActive =
              item.href === '/agent'
                ? pathname === '/agent'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
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
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2 text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <BarChart3 className="h-3.5 w-3.5 flex-shrink-0" />
              Admin Dashboard
            </Link>
          )}
          <Link
            href="/help"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5 flex-shrink-0" />
            Customer View
          </Link>
          <LogoutButton className="text-left text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors w-full" />
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — fixed on mobile overlay, static on md+ */}
      <div
        className={`fixed inset-y-0 left-0 z-40 flex flex-col transition-transform duration-300 md:relative md:inset-auto md:translate-x-0 md:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:flex`}
      >
        {sidebar}
      </div>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-slate-50 min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {/* Hamburger — mobile only */}
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex-shrink-0"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">Dashboard</h1>
                <p className="text-slate-500 text-xs sm:text-sm truncate hidden sm:block">
                  Welcome back, {user.name}. Here&apos;s what needs your attention.
                </p>
              </div>
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
                  {tickets.map((ticket) => (
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
      </main>
    </div>
  );
}
