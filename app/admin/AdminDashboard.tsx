'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BarChart3, Filter, Inbox, LoaderCircle, Search, Shield, UserRound } from 'lucide-react';
import { LogoutButton } from '@/components/auth/LogoutButton';
import type { AdminDashboardTicket, DashboardSummary, SessionUser, TicketView } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface DashboardPayload {
  currentUser: SessionUser;
  tickets: AdminDashboardTicket[];
  details: TicketView[];
  summary: DashboardSummary;
}

const perPage = 20;

export default function AdminDashboard({ user }: { user: SessionUser }) {
  const [payload, setPayload] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      const response = await fetch('/api/admin/dashboard', {
        credentials: 'include',
      });

      const data = await response.json();

      if (!mounted) {
        return;
      }

      if (!response.ok) {
        setError(data.error ?? 'Unable to load dashboard.');
        return;
      }

      setPayload(data);
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredTickets = useMemo(() => {
    if (!payload) {
      return [];
    }

    const query = search.trim().toLowerCase();

    return payload.tickets.filter((ticket) => {
      if (status && ticket.status !== status) {
        return false;
      }

      if (category && ticket.department !== category) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [ticket.ticketId, ticket.title, ticket.requester, ticket.assignee ?? '', ticket.preview]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [category, payload, search, status]);

  const pagedTickets = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredTickets.slice(start, start + perPage);
  }, [filteredTickets, page]);

  const selectedTicket = useMemo(() => {
    return payload?.details.find((ticket) => ticket.id === selectedId) ?? null;
  }, [payload, selectedId]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <div className="text-lg font-semibold">Dashboard unavailable</div>
          <p className="mt-2 text-sm text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
        <div className="flex items-center gap-3 text-sm">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Loading admin dashboard...
        </div>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / perPage));

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[260px_minmax(0,1fr)_340px]">
        <aside className="border-r border-slate-800 bg-slate-950/80 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">Admin Console — Support</div>
              <div className="text-sm text-slate-400">by Nexora</div>
            </div>
          </div>

          <nav className="mt-8 space-y-2 text-sm">
            <Link href="/admin" className="flex items-center gap-3 rounded-2xl bg-violet-600 px-4 py-3 font-medium">
              <BarChart3 className="h-4 w-4" /> Overview
            </Link>
            <Link href="/agent" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-300 transition hover:bg-slate-900">
              <Inbox className="h-4 w-4" /> Agent workspace
            </Link>
            <Link href="/help" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-300 transition hover:bg-slate-900">
              <UserRound className="h-4 w-4" /> Customer portal
            </Link>
          </nav>

          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">Authenticated as</div>
            <div className="mt-2 font-medium">{user.name}</div>
            <div className="text-sm text-slate-400">{user.email}</div>
            <LogoutButton className="mt-4 w-full rounded-2xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800" />
          </div>

          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">Live summary</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <StatCard label="Tickets" value={String(payload.summary.total)} />
              <StatCard label="Resolved" value={`${payload.summary.resolveRate}%`} />
              <StatCard label="Open" value={String(payload.summary.byStatus.open)} />
              <StatCard label="Pending" value={String(payload.summary.byStatus.pending)} />
            </div>
          </div>
        </aside>

        <main className="bg-slate-50 text-slate-900">
          <div className="border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Support Admin</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Ticket management and analytics for Support by Nexora.
                  </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-[280px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search tickets, requester, or preview"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
                <select
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value);
                    setPage(1);
                  }}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                >
                  <option value="">All categories</option>
                  {payload.summary.byCategory.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <SummaryCard label="Total tickets" value={String(payload.summary.total)} tone="slate" />
              <SummaryCard label="Open" value={String(payload.summary.byStatus.open)} tone="violet" />
              <SummaryCard label="In progress" value={String(payload.summary.byStatus.in_progress)} tone="amber" />
              <SummaryCard label="Pending" value={String(payload.summary.byStatus.pending)} tone="sky" />
              <SummaryCard label="Resolve rate" value={`${payload.summary.resolveRate}%`} tone="green" />
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white">
              <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-semibold">All tickets</h2>
                  <p className="text-sm text-slate-500">{filteredTickets.length} matching tickets</p>
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
                      onClick={() => {
                        setStatus(chip.value);
                        setPage(1);
                      }}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        status === chip.value ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-6 py-3 font-medium">Ticket</th>
                      <th className="px-6 py-3 font-medium">Requester</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Priority</th>
                      <th className="px-6 py-3 font-medium">Category</th>
                      <th className="px-6 py-3 font-medium">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className={`cursor-pointer transition hover:bg-violet-50/30 ${selectedId === ticket.id ? 'bg-violet-50' : ''}`}
                        onClick={() => setSelectedId(ticket.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{ticket.title}</div>
                          <div className="mt-1 text-xs font-mono text-slate-400">{ticket.ticketId}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{ticket.requester}</div>
                          <div className="mt-1 text-xs text-slate-400">{ticket.assignee ?? 'Unassigned'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            {ticket.statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4">{ticket.priority}</td>
                        <td className="px-6 py-4">{ticket.department}</td>
                        <td className="px-6 py-4 text-slate-500">{formatDate(ticket.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-sm">
                <div className="text-slate-500">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page === 1}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={page === totalPages}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside className="border-l border-slate-800 bg-slate-950/80 p-6 text-slate-200">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
            <Filter className="h-4 w-4" /> Insights
          </div>

          <div className="mt-6 space-y-6">
            <Panel title="Top categories">
              {payload.summary.byCategory.slice(0, 6).map((item) => (
                <BarRow key={item.name} label={item.name} value={item.count} max={payload.summary.byCategory[0]?.count ?? 1} />
              ))}
            </Panel>

            <Panel title="Monthly volume">
              {payload.summary.byMonth.slice(-6).map((item) => (
                <BarRow key={item.month} label={item.label} value={item.count} max={Math.max(...payload.summary.byMonth.map((entry) => entry.count), 1)} />
              ))}
            </Panel>

            <Panel title="Top requesters">
              {payload.summary.topRequesters.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-2xl bg-slate-900 px-3 py-2 text-sm">
                  <span>{item.name}</span>
                  <span className="text-slate-400">{item.count}</span>
                </div>
              ))}
            </Panel>

            <Panel title="Ticket detail">
              {selectedTicket ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-mono text-slate-500">{selectedTicket.ticketId}</div>
                    <div className="mt-1 text-base font-semibold text-white">{selectedTicket.title}</div>
                    <div className="mt-2 text-sm text-slate-400">{selectedTicket.description}</div>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <DetailRow label="Requester" value={selectedTicket.author.name} />
                    <DetailRow label="Status" value={selectedTicket.status} />
                    <DetailRow label="Priority" value={selectedTicket.priority} />
                    <DetailRow label="Category" value={selectedTicket.department} />
                    <DetailRow label="Updated" value={formatDate(selectedTicket.updatedAt)} />
                  </div>
                  <div>
                    <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">Latest activity</div>
                    <div className="space-y-2">
                      {selectedTicket.comments.slice(-3).reverse().map((comment) => (
                        <div key={comment.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
                          <div className="text-xs text-slate-500">
                            {comment.author.name} · {formatDate(comment.createdAt)}
                          </div>
                          <div className="mt-1 text-sm text-slate-200">{comment.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-800 px-4 py-6 text-sm text-slate-500">
                  Pick a ticket from the table to inspect the imported thread.
                </div>
              )}
            </Panel>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'slate' | 'violet' | 'amber' | 'sky' | 'green';
}) {
  const tones = {
    slate: 'bg-slate-900 text-white',
    violet: 'bg-violet-600 text-white',
    amber: 'bg-amber-500 text-white',
    sky: 'bg-sky-600 text-white',
    green: 'bg-emerald-600 text-white',
  };

  return (
    <div className={`rounded-3xl p-5 ${tones[tone]}`}>
      <div className="text-sm opacity-80">{label}</div>
      <div className="mt-3 text-3xl font-bold">{value}</div>
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
  const width = `${Math.max(10, Math.round((value / Math.max(1, max)) * 100))}%`;

  return (
    <div className="rounded-2xl bg-slate-900 p-3">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="text-slate-400">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800">
        <div className="h-2 rounded-full bg-violet-500" style={{ width }} />
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-900 px-3 py-2">
      <span className="text-slate-400">{label}</span>
      <span className="text-right text-white">{value}</span>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 px-3 py-3">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}
