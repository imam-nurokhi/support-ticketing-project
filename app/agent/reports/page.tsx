import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import AgentSidebarLayout from '@/components/agent/AgentSidebarLayout';

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
    <AgentSidebarLayout
      user={user}
      title="Reports"
      subtitle={`${allTickets.length} total tickets across all time`}
    >
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
    </AgentSidebarLayout>
  );
}
