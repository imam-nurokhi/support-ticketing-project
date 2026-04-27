import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import AgentSidebarLayout from '@/components/agent/AgentSidebarLayout';

export default async function AgentCustomersPage() {
  const user = await requireUser(['SUPPORT_AGENT', 'ADMIN']);

  const customers = await db.user.findMany({
    where: { role: 'CUSTOMER' },
    include: {
      _count: { select: { tickets: true } },
      tickets: {
        orderBy: { updatedAt: 'desc' },
        take: 1,
        select: { updatedAt: true, status: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <AgentSidebarLayout
      user={user}
      title="Customers"
      subtitle={`${customers.length} registered customer${customers.length !== 1 ? 's' : ''}`}
    >
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 sm:px-6 py-3 text-left font-medium">Customer</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium">Email</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium">Total Tickets</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium">Last Activity</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                      No customers found.
                    </td>
                  </tr>
                )}
                {customers.map((customer) => {
                  const lastTicket = customer.tickets[0];
                  return (
                    <tr key={customer.id} className="hover:bg-blue-50/40 transition-colors group">
                      <td className="px-4 sm:px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-900 text-sm">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 text-sm text-slate-600">{customer.email}</td>
                      <td className="px-4 sm:px-6 py-3.5">
                        <span className="inline-flex items-center justify-center h-6 min-w-[1.5rem] px-2 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                          {customer._count.tickets}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 text-xs text-slate-400">
                        {lastTicket
                          ? new Date(lastTicket.updatedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="px-4 sm:px-6 py-3.5">
                        <Link
                          href={`/agent/tickets?customer=${customer.id}`}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          View tickets →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AgentSidebarLayout>
  );
}
