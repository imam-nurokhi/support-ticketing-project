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

  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

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
            const isActive = item.href === '/agent/customers';
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
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">Customers</h1>
              <p className="text-slate-500 text-xs sm:text-sm hidden sm:block">
                {customers.length} registered customer{customers.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </header>

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
      </main>
    </div>
  );
}
