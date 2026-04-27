'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
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
import type { SessionUser } from '@/lib/types';

interface AgentSidebarLayoutProps {
  user: SessionUser;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/agent' },
  { icon: Inbox, label: 'All Tickets', href: '/agent/tickets' },
  { icon: Users, label: 'Customers', href: '/agent/customers' },
  { icon: BarChart3, label: 'Reports', href: '/agent/reports' },
  { icon: Settings, label: 'Settings', href: '/agent/settings' },
];

export default function AgentSidebarLayout({
  user,
  title,
  subtitle,
  actions,
  children,
}: AgentSidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out md:relative md:inset-auto md:z-auto md:flex md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <aside className="w-60 bg-slate-950 border-r border-slate-800 flex flex-col h-full min-h-screen">
          {/* Logo */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <Link
              href="/agent"
              className="flex items-center gap-2.5"
              onClick={() => setSidebarOpen(false)}
            >
              <Image
                src="/nexora-logo.png"
                alt="Nexora"
                width={80}
                height={24}
                className="object-contain"
              />
              <div>
                <div className="font-bold text-white text-sm leading-tight">Support</div>
                <div className="text-blue-400 text-xs">Agent Portal</div>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
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
      </div>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-slate-50 min-w-0">
        {/* Sticky header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex-shrink-0"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">{title}</h1>
                {subtitle && (
                  <p className="text-slate-500 text-xs sm:text-sm truncate hidden sm:block">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {actions && <div className="flex-shrink-0 flex items-center gap-2">{actions}</div>}
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
