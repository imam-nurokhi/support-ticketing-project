import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  PlusCircle,
  Headphones,
  BookOpen,
  Users,
  ClipboardList,
  Globe,
  Megaphone,
  GraduationCap,
  MessageCircle,
  Menu,
} from 'lucide-react';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { getDefaultRouteForRole, requireUser } from '@/lib/auth';
import { getCustomerTickets } from '@/lib/tickets';
import WelcomeGuide from '@/components/ui/WelcomeGuide';

export default async function HelpPage() {
  const user = await requireUser(undefined, '/help');
  const tickets = user.role === 'CUSTOMER' ? await getCustomerTickets(user.id) : [];

  const faqs = [
    { q: 'How long does it take to get a response?', a: 'Our team typically responds within 2 hours during business hours. Urgent tickets are prioritized and handled within 30 minutes.' },
    { q: 'Can I update a ticket after submitting?', a: 'Yes! You can add replies and additional information to any open ticket through your ticket detail page.' },
    { q: 'How do I escalate an urgent issue?', a: 'When creating a ticket, select "Urgent" priority. This flags it for immediate attention from our senior support team.' },
    { q: 'What information should I include in my ticket?', a: 'Include as much detail as possible: steps to reproduce the issue, screenshots, error messages, and your account details.' },
    { q: 'Can I check the status of my ticket?', a: 'Yes! Visit "My Tickets" to see real-time status updates on all your open and closed tickets.' },
  ];

  const categories = [
    { icon: BookOpen, title: 'LMS', desc: 'E-learning, course access, penilaian', href: '/help/tickets/new?dept=LMS', bgClass: 'bg-violet-50', iconClass: 'text-violet-600' },
    { icon: Users, title: 'CRM Application', desc: 'Data customer, input data, fitur CRM', href: '/help/tickets/new?dept=CRM', bgClass: 'bg-green-50', iconClass: 'text-green-600' },
    { icon: Globe, title: 'Website', desc: 'Perubahan konten, akses website, bug', href: '/help/tickets/new?dept=Website', bgClass: 'bg-cyan-50', iconClass: 'text-cyan-600' },
    { icon: Megaphone, title: 'Marketing', desc: 'Desain, brosur, blast email, jadwal', href: '/help/tickets/new?dept=Marketing', bgClass: 'bg-amber-50', iconClass: 'text-amber-600' },
    { icon: ClipboardList, title: 'AUDITQ', desc: 'Audit project, extension, dokumentasi', href: '/help/tickets/new?dept=AUDITQ', bgClass: 'bg-purple-50', iconClass: 'text-purple-600' },
    { icon: GraduationCap, title: 'Training Service', desc: 'Penambahan standar, jadwal training', href: '/help/tickets/new?dept=Training+Service', bgClass: 'bg-indigo-50', iconClass: 'text-indigo-600' },
    { icon: MessageCircle, title: 'General / Other', desc: 'Pertanyaan umum atau lainnya', href: '/help/tickets/new?dept=General', bgClass: 'bg-slate-50', iconClass: 'text-slate-600' },
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

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-violet-600 to-amber-400 text-white py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-violet-100 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/20">
            <Headphones className="h-3.5 w-3.5" />
            Support by Nexora
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">How can we help you?</h1>
          <p className="text-violet-200 text-base md:text-lg mb-10">Search our knowledge base or submit a support ticket</p>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search for answers… (e.g., reset password, billing, API)"
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-slate-900 text-base md:text-lg focus:outline-none focus:ring-4 focus:ring-blue-400/50 shadow-2xl"
              aria-label="Search knowledge base"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Browse by Category</h2>
            <Link href="/help/tickets/new" className="text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200 hover:border-violet-200 hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div className={`h-10 w-10 rounded-xl ${cat.bgClass} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <cat.icon className={`h-5 w-5 ${cat.iconClass}`} />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">{cat.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Main content + sidebar (stack on mobile) */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* FAQ using native <details> for zero-JS accordion */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden group open:border-violet-200 transition-colors"
                >
                  <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-violet-50/40 transition-colors list-none select-none">
                    <span className="font-medium text-slate-800 pr-4 text-sm md:text-base">{faq.q}</span>
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-slate-100 group-open:bg-violet-100 flex items-center justify-center transition-colors">
                      <svg
                        className="h-3.5 w-3.5 text-slate-500 group-open:text-violet-600 group-open:rotate-180 transition-all duration-200"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="border-t border-slate-100 px-5 pb-5 pt-4">
                    <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div>
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
                  <div className="text-violet-200 text-xs">Get help from our team</div>                </div>
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
    </div>
  );
}
