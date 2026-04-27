import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import {
  BarChart3,
  Inbox,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from 'lucide-react';
import { LogoutButton } from '@/components/auth/LogoutButton';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/agent' },
  { icon: Inbox, label: 'All Tickets', href: '/agent/tickets' },
  { icon: Users, label: 'Customers', href: '/agent/customers' },
  { icon: BarChart3, label: 'Reports', href: '/agent/reports' },
  { icon: Settings, label: 'Settings', href: '/agent/settings' },
];

function BarChartRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 text-sm text-slate-600 flex-shrink-0 truncate">{label}</div>
      <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all flex items-center justify-end pr-2`}
          style={{ width: `${Math.max(pct, value > 0 ? 4 : 0)}%` }}
        >
          {pct >= 12 && <span className="text-white text-xs font-semibold">{value}</span>}
        </div>
      </div>
      {pct < 12 && <span className="text-slate-600 text-xs font-semibold w-6 text-right">{value}</span>}
    </div>
  );
}

export default async function AgentReportsPage() {
  const user = await requireUser(['SUPPORT_AGENT', 'ADMIN']);

  const [allTickets, agents] = await Promise.all([
    db.ticket.findMany({
      select: {
        status: true,
        priority: true,
        department: true,
        createdAt: true,
      },
    }),
    db.user.findMany({
      where: { role: { in: ['SUPPORT_AGENT', 'ADMIN'] } },
      select: {
        id: true,
        name: true,
        _count: { select: { assignedTickets: true } },
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  // Status breakdown
  const statusCounts: Record<string, number> = {};
  for (const t of allTickets) {
    statusCounts[t.status] = (statusCounts[t.status] ?? 0) + 1;
  }

  // Priority breakdown
  const priorityCounts: Record<string, number> = {};
  for (const t of allTickets) {
    priorityCounts[t.priority] = (priorityCounts[t.priority] ?? 0) + 1;
  }

  // Department breakdown
  const deptCounts: Record<string, number> = {};
  for (const t of allTickets) {
    deptCounts[t.department] = (deptCounts[t.department] ?? 0) + 1;
  }
  const topDepts = Object.entries(deptCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Monthly volume — last 6 months
  const now = new Date();
  const monthlyData: { label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const start = d;
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const count = allTickets.filter(
      (t) => new Date(t.createdAt) >= start && new Date(t.createdAt) < end,
    ).length;
    monthlyData.push({ label, count });
  }
  const maxMonthly = Math.max(...monthlyData.map((m) => m.count), 1);

  const maxStatus = Math.max(...Object.values(statusCounts), 1);
  const maxPriority = Math.max(...Object.values(priorityCounts), 1);
  const maxDept = Math.max(...topDepts.map(([, v]) => v), 1);
  const maxAgent = Math.max(...agents.map((a) => a._count.assignedTickets), 1);

  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const statusColors: Record<string, string> = {
    OPEN: 'bg-blue-500',
    IN_PROGRESS: 'bg-amber-500',
    PENDING: 'bg-sky-500',
    CLOSED: 'bg-emerald-500',
    RESOLVED: 'bg-emerald-400',
  };
  const priorityColors: Record<string, string> = {
    URGENT: 'bg-rose-500',
    HIGH: 'bg-orange-500',
    MEDIUM: 'bg-amber-400',
    LOW: 'bg-slate-400',
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 bg-slate-950 border-r border-slate-800 flex-col h-screen sticky top-0">
        <div className="p-4 border-b border-slate-800 flex items-center">
          <Link href="/agent" className="flex items-center gap-2.5">
            <Image src="/nexora-logo.png" alt="Nexora" width={80} height={24} className="object-contain" />
            <div>
              <div className="font-bold text-white text-sm leading-tight">Support</div>
              <div className="text-blue-400 text-xs">Agent Portal</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === '/agent/reports';
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
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 sticky top-0 z-10">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">Reports</h1>
            <p className="text-slate-500 text-xs sm:text-sm hidden sm:block">
              {allTickets.length} total tickets across all time
            </p>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total', value: allTickets.length, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
              { label: 'Open', value: statusCounts['OPEN'] ?? 0, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
              { label: 'In Progress', value: statusCounts['IN_PROGRESS'] ?? 0, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
              {
                label: 'Closed',
                value: (statusCounts['CLOSED'] ?? 0) + (statusCounts['RESOLVED'] ?? 0),
                color: 'text-emerald-600',
                bg: 'bg-emerald-50 border-emerald-200',
              },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} border rounded-xl p-4`}>
                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-slate-600 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tickets by Status */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Tickets by Status</h2>
              <div className="space-y-3">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <BarChartRow
                    key={status}
                    label={status.replace('_', ' ')}
                    value={count}
                    max={maxStatus}
                    color={statusColors[status] ?? 'bg-slate-400'}
                  />
                ))}
              </div>
            </div>

            {/* Tickets by Priority */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Tickets by Priority</h2>
              <div className="space-y-3">
                {['URGENT', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
                  <BarChartRow
                    key={p}
                    label={p}
                    value={priorityCounts[p] ?? 0}
                    max={maxPriority}
                    color={priorityColors[p] ?? 'bg-slate-400'}
                  />
                ))}
              </div>
            </div>

            {/* Monthly volume */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Monthly Volume (Last 6 Months)</h2>
              <div className="flex items-end gap-2 h-40">
                {monthlyData.map((m) => {
                  const heightPct = maxMonthly > 0 ? (m.count / maxMonthly) * 100 : 0;
                  return (
                    <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-slate-500 font-medium">{m.count}</span>
                      <div className="w-full bg-slate-100 rounded-t-md overflow-hidden flex items-end" style={{ height: '100px' }}>
                        <div
                          className="w-full bg-blue-500 rounded-t-md transition-all"
                          style={{ height: `${Math.max(heightPct, m.count > 0 ? 4 : 0)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400">{m.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Departments */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Top Categories / Departments</h2>
              <div className="space-y-3">
                {topDepts.map(([dept, count]) => (
                  <BarChartRow
                    key={dept}
                    label={dept}
                    value={count}
                    max={maxDept}
                    color="bg-violet-500"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Agent workload */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Agent Workload</h2>
            <div className="space-y-3">
              {agents.map((agent) => (
                <BarChartRow
                  key={agent.id}
                  label={agent.name}
                  value={agent._count.assignedTickets}
                  max={maxAgent}
                  color="bg-blue-600"
                />
              ))}
              {agents.length === 0 && (
                <p className="text-slate-400 text-sm">No agents found.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
