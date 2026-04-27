import Link from 'next/link';
import Image from 'next/image';
import {
  PlusCircle,
  ClipboardList,
  Menu,
} from 'lucide-react';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { getDefaultRouteForRole, requireUser } from '@/lib/auth';
import { getCustomerTickets } from '@/lib/tickets';
import WelcomeGuide from '@/components/ui/WelcomeGuide';
import HelpContent from '@/components/help/HelpContent';
import type { FaqItem, CategoryItem } from '@/components/help/HelpContent';

export default async function HelpPage() {
  const user = await requireUser(undefined, '/help');
  const tickets = user.role === 'CUSTOMER' ? await getCustomerTickets(user.id) : [];

  const faqs: FaqItem[] = [
    { q: 'How long does it take to get a response?', a: 'Our team typically responds within 2 hours during business hours. Urgent tickets are prioritized and handled within 30 minutes.' },
    { q: 'Can I update a ticket after submitting?', a: 'Yes! You can add replies and additional information to any open ticket through your ticket detail page.' },
    { q: 'How do I escalate an urgent issue?', a: 'When creating a ticket, select "Urgent" priority. This flags it for immediate attention from our senior support team.' },
    { q: 'What information should I include in my ticket?', a: 'Include as much detail as possible: steps to reproduce the issue, screenshots, error messages, and your account details.' },
    { q: 'Can I check the status of my ticket?', a: 'Yes! Visit "My Tickets" to see real-time status updates on all your open and closed tickets.' },
  ];

  const categories: CategoryItem[] = [
    { iconName: 'BookOpen', title: 'LMS', desc: 'E-learning, course access, penilaian', href: '/help/tickets/new?dept=LMS', bgClass: 'bg-violet-50', iconClass: 'text-violet-600' },
    { iconName: 'Users', title: 'CRM Application', desc: 'Data customer, input data, fitur CRM', href: '/help/tickets/new?dept=CRM', bgClass: 'bg-green-50', iconClass: 'text-green-600' },
    { iconName: 'Globe', title: 'Website', desc: 'Perubahan konten, akses website, bug', href: '/help/tickets/new?dept=Website', bgClass: 'bg-cyan-50', iconClass: 'text-cyan-600' },
    { iconName: 'Megaphone', title: 'Marketing', desc: 'Desain, brosur, blast email, jadwal', href: '/help/tickets/new?dept=Marketing', bgClass: 'bg-amber-50', iconClass: 'text-amber-600' },
    { iconName: 'ClipboardList', title: 'AUDITQ', desc: 'Audit project, extension, dokumentasi', href: '/help/tickets/new?dept=AUDITQ', bgClass: 'bg-purple-50', iconClass: 'text-purple-600' },
    { iconName: 'GraduationCap', title: 'Training Service', desc: 'Penambahan standar, jadwal training', href: '/help/tickets/new?dept=Training+Service', bgClass: 'bg-indigo-50', iconClass: 'text-indigo-600' },
    { iconName: 'MessageCircle', title: 'General / Other', desc: 'Pertanyaan umum atau lainnya', href: '/help/tickets/new?dept=General', bgClass: 'bg-slate-50', iconClass: 'text-slate-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <WelcomeGuide role={user.role} />
      {/* Nav — CSS-only mobile menu via checkbox hack (no client JS needed) */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <Link href="/help" className="flex items-center gap-2.5 flex-shrink-0">
              <Image src="/nexora-logo.png" alt="Nexora" width={120} height={36} className="object-contain" />
            </Link>

            {/* Desktop nav */}
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/help/tickets"
                className="text-slate-600 hover:text-slate-900 text-sm font-medium py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                My Tickets
              </Link>
              <Link
                href={getDefaultRouteForRole(user.role)}
                className="text-slate-500 hover:text-slate-700 text-sm py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Workspace →
              </Link>
              <div className="flex items-center gap-2 text-sm text-slate-700 ml-1">
                <div className="h-8 w-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 font-semibold text-xs flex-shrink-0">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden md:block font-medium">{user.name}</span>
              </div>
              <LogoutButton className="text-sm text-slate-500 hover:text-slate-900 py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors" label="Sign out" />
            </div>

            {/* Mobile hamburger */}
            <label
              htmlFor="help-mobile-nav"
              className="sm:hidden cursor-pointer p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5 text-slate-600" />
            </label>
          </div>
        </div>

        {/* Mobile dropdown */}
        <input type="checkbox" id="help-mobile-nav" className="sr-only peer" />
        <div className="hidden peer-checked:block sm:hidden border-t border-slate-100 bg-white px-4 py-2 space-y-1">
          <Link href="/help/tickets" className="flex items-center py-3 px-3 rounded-xl text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors">
            My Tickets
          </Link>
          <Link href={getDefaultRouteForRole(user.role)} className="flex items-center py-3 px-3 rounded-xl text-slate-600 hover:bg-slate-50 text-sm transition-colors">
            Workspace →
          </Link>
          <div className="flex items-center gap-3 py-3 px-3 border-t border-slate-100 mt-1">
            <div className="h-8 w-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 font-semibold text-xs flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <span className="text-sm text-slate-700 font-medium flex-1">{user.name}</span>
            <LogoutButton className="text-sm text-slate-500 hover:text-slate-900" label="Sign out" />
          </div>
        </div>
      </nav>

      {/* Interactive search + categories + FAQ (client component) */}
      <HelpContent faqs={faqs} categories={categories} />

      {/* Sidebar — Quick Actions + Recent Tickets */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="lg:max-w-xs ml-auto">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/help/tickets/new"
              className="flex items-center gap-3 bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-colors group"
            >
              <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/25 transition-colors">
                <PlusCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-sm">Submit New Ticket</div>
                <div className="text-violet-200 text-xs">Get help from our team</div>
              </div>
            </Link>
            <Link
              href="/help/tickets"
              className="flex items-center gap-3 bg-white text-slate-700 p-4 rounded-2xl border border-slate-200 hover:border-violet-200 hover:shadow-sm transition-all group"
            >
              <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-violet-50 transition-colors">
                <ClipboardList className="h-5 w-5 text-slate-500 group-hover:text-violet-600 transition-colors" />
              </div>
              <div>
                <div className="font-semibold text-sm">View My Tickets</div>
                <div className="text-slate-500 text-xs">
                  {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} total
                </div>
              </div>
            </Link>
          </div>

          {/* Recent tickets widget */}
          {tickets.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-widest">Recent Tickets</h3>
              <div className="space-y-2">
                {tickets.slice(0, 3).map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/help/tickets/${ticket.id}`}
                    className="block bg-white rounded-xl p-3.5 border border-slate-200 hover:border-violet-200 hover:shadow-sm transition-all"
                  >
                    <div className="font-medium text-slate-800 text-sm truncate mb-1.5">{ticket.title}</div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          ticket.status === 'OPEN'
                            ? 'bg-violet-100 text-violet-700'
                            : ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{ticket.ticketId}</span>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href="/help/tickets"
                className="block text-center text-xs text-violet-600 hover:text-violet-700 font-medium mt-3 py-2 transition-colors"
              >
                View all tickets →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
