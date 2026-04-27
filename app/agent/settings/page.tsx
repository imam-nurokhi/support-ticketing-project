import { requireUser } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';
import {
  BarChart3,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  ShieldCheck,
  UserCircle2,
  Users,
} from 'lucide-react';
import { LogoutButton } from '@/components/auth/LogoutButton';
import SettingsForm from './SettingsForm';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/agent' },
  { icon: Inbox, label: 'All Tickets', href: '/agent/tickets' },
  { icon: Users, label: 'Customers', href: '/agent/customers' },
  { icon: BarChart3, label: 'Reports', href: '/agent/reports' },
  { icon: Settings, label: 'Settings', href: '/agent/settings' },
];

export default async function AgentSettingsPage() {
  const user = await requireUser(['SUPPORT_AGENT', 'ADMIN']);

  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleLabel =
    user.role === 'ADMIN'
      ? 'Administrator'
      : user.role === 'SUPPORT_AGENT'
      ? 'Support Agent'
      : 'Customer';

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
            const isActive = item.href === '/agent/settings';
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
              <div className="text-slate-500 text-xs truncate">{roleLabel}</div>
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
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-500 text-xs sm:text-sm hidden sm:block">Manage your profile and account</p>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 max-w-2xl space-y-6">
          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <UserCircle2 className="h-5 w-5 text-blue-600" />
              Profile Information
            </h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {initials}
              </div>
              <div>
                <div className="text-slate-900 font-semibold text-lg">{user.name}</div>
                <div className="text-slate-500 text-sm">{roleLabel}</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <UserCircle2 className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide font-medium">Name</div>
                  <div className="text-sm text-slate-900 font-medium">{user.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide font-medium">Email</div>
                  <div className="text-sm text-slate-900 font-medium">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <ShieldCheck className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide font-medium">Role</div>
                  <div className="text-sm text-slate-900 font-medium">{roleLabel}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Change password card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              Change Password
            </h2>
            <SettingsForm />
          </div>
        </div>
      </main>
    </div>
  );
}
