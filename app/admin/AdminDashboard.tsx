'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  BarChart3,
  ExternalLink,
  Filter,
  Inbox,
  LoaderCircle,
  Medal,
  Menu,
  Search,
  Shield,
  Star,
  Trophy,
  UserRound,
  X,
} from 'lucide-react';
import { LogoutButton } from '@/components/auth/LogoutButton';
import type {
  AdminDashboardTicket,
  AgentPerformance,
  DashboardSummary,
  SessionUser,
  TicketView,
} from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface DashboardPayload {
  currentUser: SessionUser;
  tickets: AdminDashboardTicket[];
  details: TicketView[];
  summary: DashboardSummary;
  agentPerformance: AgentPerformance[];
}

const perPage = 20;

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  pending: 'bg-sky-100 text-sky-700',
  closed: 'bg-emerald-100 text-emerald-700',
  hold: 'bg-slate-100 text-slate-600',
};

const PRIORITY_STYLES: Record<string, string> = {
  URGENT: 'bg-rose-100 text-rose-700 font-semibold',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-slate-100 text-slate-600',
  LOW: 'bg-slate-50 text-slate-500',
};

export default function AdminDashboard({ user }: { user: SessionUser }) {
  const [payload, setPayload] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const res = await fetch('/api/admin/dashboard', { credentials: 'include' });
      const data = await res.json();
      if (!mounted) return;
      if (!res.ok) { setError(data.error ?? 'Unable to load dashboard.'); return; }
      setPayload(data);
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filteredTickets = useMemo(() => {
    if (!payload) return [];
    const q = search.trim().toLowerCase();
    return payload.tickets.filter((t) => {
      if (status && t.status !== status) return false;
      if (category && t.department !== category) return false;
      if (!q) return true;
      return [t.ticketId, t.title, t.requester, t.assignee ?? '', t.preview].join(' ').toLowerCase().includes(q);
    });
  }, [category, payload, search, status]);

  const pagedTickets = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredTickets.slice(start, start + perPage);
  }, [filteredTickets, page]);

  const selectedTicket = useMemo(
    () => payload?.details.find((t) => t.id === selectedId) ?? null,
    [payload, selectedId],
  );

  function openTicket(id: string) {
    setSelectedId(id);
    setModalOpen(true);
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <p className="text-lg font-semibold">Dashboard unavailable</p>
          <p className="mt-2 text-sm text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
        <div className="flex items-center gap-3 text-sm">
          <LoaderCircle className="h-5 w-5 animate-spin text-blue-400" />
          Loading admin dashboard…
        </div>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / perPage));
  const topAgent = payload.agentPerformance[0];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="grid min-h-screen lg:grid-cols-[260px_minmax(0,1fr)_340px]">

        {/* ── Left sidebar ─────────────────────────────────────── */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[260px] border-r border-slate-800 bg-slate-950 p-6 flex flex-col transition-transform duration-300 ease-in-out lg:relative lg:inset-auto lg:translate-x-0 lg:z-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Close button (mobile only) */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex-shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-white">Admin Console</div>
              <div className="text-xs text-slate-400">Support by Nexora</div>
            </div>
          </div>

          {/* Nexora logo image */}
          <div className="mt-5 px-1">
            <Image src="/nexora-logo.png" alt="Nexora" width={140} height={42} className="object-contain opacity-90" />
          </div>

          <nav className="mt-6 space-y-1.5 text-sm">
            <Link href="/admin" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 font-medium text-white shadow-sm">
              <BarChart3 className="h-4 w-4" /> Overview
            </Link>
            <Link href="/agent" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-slate-300 transition hover:bg-slate-800 hover:text-white">
              <Inbox className="h-4 w-4" /> Agent workspace
            </Link>
            <Link href="/help" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-slate-300 transition hover:bg-slate-800 hover:text-white">
              <UserRound className="h-4 w-4" /> Customer portal
            </Link>
          </nav>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Authenticated as</div>
            <div className="font-medium text-white">{user.name}</div>
            <div className="text-sm text-slate-400">{user.email}</div>
            <LogoutButton className="mt-3 w-full rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-blue-500 hover:bg-slate-800" />
          </div>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-3">Live summary</div>
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Tickets" value={String(payload.summary.total)} />
              <StatCard label="Resolved" value={`${payload.summary.resolveRate}%`} />
              <StatCard label="Open" value={String(payload.summary.byStatus.open)} />
              <StatCard label="Pending" value={String(payload.summary.byStatus.pending)} />
            </div>
          </div>
        </aside>

        {/* ── Main content ──────────────────────────────────────── */}
        <main className="bg-slate-50 text-slate-900 overflow-auto">
          {/* Header */}
          <div className="border-b border-slate-200 bg-white px-4 sm:px-6 py-5 sticky top-0 z-10 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                {/* Mobile hamburger for left sidebar */}
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex-shrink-0"
                  aria-label="Open sidebar"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Support Admin</h1>
                  <p className="mt-0.5 text-sm text-slate-500 hidden sm:block">Ticket management and analytics for Support by Nexora.</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-[200px] sm:min-w-[260px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search tickets, requester…"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">All categories</option>
                    {payload.summary.byCategory.map((item) => (
                      <option key={item.name} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                  {/* Mobile insights toggle */}
                  <button
                    type="button"
                    onClick={() => setInsightsOpen((o) => !o)}
                    className="xl:hidden flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100 transition"
                    aria-label="Toggle insights"
                  >
                    <Filter className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 py-6">
            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5 mb-6">
              <SummaryCard label="Total tickets" value={String(payload.summary.total)} tone="slate" />
              <SummaryCard label="Open" value={String(payload.summary.byStatus.open)} tone="blue" />
              <SummaryCard label="In progress" value={String(payload.summary.byStatus.in_progress)} tone="amber" />
              <SummaryCard label="Pending" value={String(payload.summary.byStatus.pending)} tone="sky" />
              <SummaryCard label="Resolve rate" value={`${payload.summary.resolveRate}%`} tone="green" />
            </div>

            {/* Ticket table */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">All tickets</h2>
                  <p className="text-sm text-slate-500">{filteredTickets.length} matching tickets — click any row to preview</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'All', value: '' },
                    { label: 'Open', value: 'open' },
                    { label: 'In Progress', value: 'in_progress' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Closed', value: 'closed' },
                  ].map((chip) => (
                    <button
                      key={chip.value || 'all'}
                      type="button"
                      onClick={() => { setStatus(chip.value); setPage(1); }}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        status === chip.value
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-400 bg-slate-50">
                      <th className="px-5 py-3 font-medium">Ticket</th>
                      <th className="px-5 py-3 font-medium">Requester</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Priority</th>
                      <th className="px-5 py-3 font-medium">Category</th>
                      <th className="px-5 py-3 font-medium">Updated</th>
                      <th className="px-5 py-3 font-medium w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pagedTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        onClick={() => openTicket(ticket.id)}
                        className={`group cursor-pointer transition-colors hover:bg-blue-50/60 ${
                          selectedId === ticket.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">{ticket.title}</div>
                          <div className="mt-0.5 font-mono text-xs text-slate-400">{ticket.ticketId}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-slate-800">{ticket.requester}</div>
                          <div className="mt-0.5 text-xs text-slate-400">{ticket.assignee ?? 'Unassigned'}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[ticket.status] ?? 'bg-slate-100 text-slate-600'}`}>
                            {ticket.statusLabel}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`rounded-full px-2.5 py-1 text-xs ${PRIORITY_STYLES[ticket.priority] ?? ''}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 text-xs">{ticket.department}</td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">{formatDate(ticket.updatedAt)}</td>
                        <td className="px-5 py-3.5">
                          <ExternalLink className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-sm">
                <div className="text-slate-400 text-xs">Page {page} of {totalPages} · {filteredTickets.length} tickets</div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((c) => Math.max(1, c - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((c) => Math.min(totalPages, c + 1))}
                    disabled={page === totalPages}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* ── Right insights sidebar ────────────────────────────── */}
        <aside className={`border-t xl:border-t-0 xl:border-l border-slate-800 bg-slate-950/80 p-5 text-slate-200 overflow-y-auto ${insightsOpen ? 'block' : 'hidden xl:block'}`}>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500 mb-5">
            <Filter className="h-4 w-4" /> Insights
          </div>

          <div className="space-y-6">

            {/* Top agent highlight */}
            {topAgent && (
              <section>
                <h2 className="mb-3 flex items-center gap-1.5 text-xs uppercase tracking-wide text-slate-500">
                  <Trophy className="h-3.5 w-3.5 text-amber-400" /> Top Performer
                </h2>
                <div className="rounded-2xl bg-gradient-to-br from-blue-900/60 to-violet-900/60 border border-blue-700/30 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {topAgent.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">{topAgent.name}</div>
                      <div className="text-xs text-slate-400 truncate">{topAgent.email}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="rounded-xl bg-slate-900/60 px-2 py-2">
                      <div className="text-lg font-bold text-white">{topAgent.total}</div>
                      <div className="text-xs text-slate-500">Total</div>
                    </div>
                    <div className="rounded-xl bg-emerald-900/40 px-2 py-2">
                      <div className="text-lg font-bold text-emerald-400">{topAgent.closed}</div>
                      <div className="text-xs text-slate-500">Resolved</div>
                    </div>
                    <div className="rounded-xl bg-amber-900/40 px-2 py-2">
                      <div className="text-lg font-bold text-amber-400">{topAgent.resolveRate}%</div>
                      <div className="text-xs text-slate-500">Rate</div>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                      style={{ width: `${topAgent.resolveRate}%` }}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* All agent performance */}
            <section>
              <h2 className="mb-3 flex items-center gap-1.5 text-xs uppercase tracking-wide text-slate-500">
                <Medal className="h-3.5 w-3.5 text-blue-400" /> Agent Performance
              </h2>
              <div className="space-y-2">
                {payload.agentPerformance.map((agent, idx) => (
                  <div key={agent.id} className="rounded-xl bg-slate-900 p-3">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-xs text-slate-400 font-medium flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-white truncate">{agent.name}</div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Star className="h-3 w-3 text-amber-400" />
                        <span className="text-xs text-amber-400 font-medium">{agent.resolveRate}%</span>
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs text-slate-500 mb-1.5">
                      <span>{agent.total} total</span>
                      <span className="text-emerald-500">{agent.closed} closed</span>
                      <span className="text-blue-400">{agent.open} open</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                        style={{ width: `${Math.max(4, agent.resolveRate)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <Panel title="Top categories">
              {payload.summary.byCategory.slice(0, 6).map((item) => (
                <BarRow key={item.name} label={item.name} value={item.count} max={payload.summary.byCategory[0]?.count ?? 1} />
              ))}
            </Panel>

            <Panel title="Monthly volume">
              {payload.summary.byMonth.slice(-6).map((item) => (
                <BarRow
                  key={item.month}
                  label={item.label}
                  value={item.count}
                  max={Math.max(...payload.summary.byMonth.map((e) => e.count), 1)}
                />
              ))}
            </Panel>

            <Panel title="Top requesters">
              {payload.summary.topRequesters.slice(0, 6).map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-xl bg-slate-900 px-3 py-2 text-xs">
                  <span className="text-slate-300 truncate mr-2">{item.name}</span>
                  <span className="text-slate-400 flex-shrink-0">{item.count}</span>
                </div>
              ))}
            </Panel>
          </div>
        </aside>
      </div>

      {/* ── Ticket preview modal ──────────────────────────────────── */}
      {modalOpen && selectedTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-start justify-between gap-4 rounded-t-2xl z-10">
              <div className="min-w-0">
                <div className="font-mono text-xs text-slate-400 mb-1">{selectedTicket.ticketId}</div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">{selectedTicket.title}</h2>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                <Link
                  href={`/agent/tickets/${selectedTicket.id}`}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" /> Open
                </Link>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-5">
              {/* Status + Priority + Category */}
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[selectedTicket.status.toLowerCase().replace(/_/g, '_')] ?? 'bg-slate-100 text-slate-600'}`}>
                  {selectedTicket.status.replace(/_/g, ' ')}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs ${PRIORITY_STYLES[selectedTicket.priority] ?? ''}`}>
                  {selectedTicket.priority}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{selectedTicket.department}</span>
              </div>

              {/* Meta info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <div className="text-xs text-slate-400 mb-1">Customer</div>
                  <div className="font-medium text-slate-900">{selectedTicket.author.name}</div>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <div className="text-xs text-slate-400 mb-1">Assigned to</div>
                  <div className="font-medium text-slate-900">{selectedTicket.assignee?.name ?? 'Unassigned'}</div>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <div className="text-xs text-slate-400 mb-1">Created</div>
                  <div className="font-medium text-slate-900">{formatDate(selectedTicket.createdAt)}</div>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <div className="text-xs text-slate-400 mb-1">Updated</div>
                  <div className="font-medium text-slate-900">{formatDate(selectedTicket.updatedAt)}</div>
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Description</div>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line line-clamp-6">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Comments */}
              {selectedTicket.comments.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
                    Latest activity ({selectedTicket.comments.length} replies)
                  </div>
                  <div className="space-y-3">
                    {selectedTicket.comments.slice(-3).reverse().map((comment) => (
                      <div
                        key={comment.id}
                        className={`rounded-xl border p-3.5 ${
                          comment.isInternalNote
                            ? 'border-amber-200 bg-amber-50'
                            : 'border-slate-100 bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-slate-700">{comment.author.name}</span>
                          <span className="text-xs text-slate-400">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">{comment.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Open full page link */}
              <Link
                href={`/agent/tickets/${selectedTicket.id}`}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Open full ticket
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: 'slate' | 'blue' | 'amber' | 'sky' | 'green' }) {
  const tones = {
    slate: 'bg-slate-900 text-white',
    blue:  'bg-blue-600 text-white',
    amber: 'bg-amber-500 text-white',
    sky:   'bg-sky-600 text-white',
    green: 'bg-emerald-600 text-white',
  };
  return (
    <div className={`rounded-2xl p-5 ${tones[tone]}`}>
      <div className="text-sm opacity-75">{label}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xs uppercase tracking-wide text-slate-500">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const width = `${Math.max(4, Math.round((value / Math.max(1, max)) * 100))}%`;
  return (
    <div className="rounded-xl bg-slate-900 p-3">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-slate-300 truncate mr-2">{label}</span>
        <span className="text-slate-400 flex-shrink-0">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800">
        <div className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500" style={{ width }} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1.5 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}
