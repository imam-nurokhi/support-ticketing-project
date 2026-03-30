import Link from 'next/link';
import { Search, PlusCircle, Headphones, FileText, CreditCard, Settings, MessageCircle, ChevronDown } from 'lucide-react';
import { getTicketsForCustomer, CURRENT_CUSTOMER } from '@/lib/mock-data';

export default function HelpPage() {
  const tickets = getTicketsForCustomer(CURRENT_CUSTOMER.id);

  const faqs = [
    { q: 'How long does it take to get a response?', a: 'Our team typically responds within 2 hours during business hours. Urgent tickets are prioritized and handled within 30 minutes.' },
    { q: 'Can I update a ticket after submitting?', a: 'Yes! You can add replies and additional information to any open ticket through your ticket detail page.' },
    { q: 'How do I escalate an urgent issue?', a: 'When creating a ticket, select "Urgent" priority. This flags it for immediate attention from our senior support team.' },
    { q: 'What information should I include in my ticket?', a: 'Include as much detail as possible: steps to reproduce the issue, screenshots, error messages, and your account details.' },
    { q: 'Can I check the status of my ticket?', a: 'Yes! Visit "My Tickets" to see real-time status updates on all your open and closed tickets.' },
  ];

  const categories = [
    { icon: Settings, title: 'Technical Support', desc: 'Login issues, bugs, integrations', href: '/help/tickets/new?dept=Technical', color: 'blue' },
    { icon: CreditCard, title: 'Billing & Payments', desc: 'Invoices, refunds, subscriptions', href: '/help/tickets/new?dept=Billing', color: 'green' },
    { icon: MessageCircle, title: 'General Inquiries', desc: 'Account info, product questions', href: '/help/tickets/new?dept=General', color: 'purple' },
    { icon: FileText, title: 'Sales', desc: 'Plans, pricing, enterprise', href: '/help/tickets/new?dept=Sales', color: 'amber' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Headphones className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800">Resolv</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/help/tickets" className="text-slate-600 hover:text-slate-900 text-sm font-medium">My Tickets</Link>
            <Link href="/agent" className="text-slate-500 hover:text-slate-700 text-sm">Agent View →</Link>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-xs">
                {CURRENT_CUSTOMER.name.charAt(0)}
              </div>
              {CURRENT_CUSTOMER.name}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
          <p className="text-blue-100 text-lg mb-8">Search our knowledge base or submit a support ticket</p>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search for answers... (e.g., reset password, billing, API)"
              className="w-full pl-12 pr-4 py-4 rounded-xl text-slate-900 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-xl"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Browse by Category</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link key={cat.title} href={cat.href} className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all group">
                <div className={`h-10 w-10 rounded-lg bg-${cat.color}-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <cat.icon className={`h-5 w-5 text-${cat.color}-600`} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{cat.title}</h3>
                <p className="text-slate-500 text-sm">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* FAQ */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50">
                    <span className="font-medium text-slate-800">{faq.q}</span>
                    <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  </div>
                  <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                    {faq.a}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <Link href="/help/tickets/new" className="flex items-center gap-3 bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 transition-colors">
                <PlusCircle className="h-5 w-5" />
                <div>
                  <div className="font-semibold">Submit New Ticket</div>
                  <div className="text-blue-100 text-xs">Get help from our team</div>
                </div>
              </Link>
              <Link href="/help/tickets" className="flex items-center gap-3 bg-white text-slate-700 p-4 rounded-xl border border-slate-200 hover:border-blue-200 transition-colors">
                <FileText className="h-5 w-5 text-slate-500" />
                <div>
                  <div className="font-semibold">View My Tickets</div>
                  <div className="text-slate-500 text-xs">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''} total</div>
                </div>
              </Link>
            </div>

            {/* Recent tickets */}
            {tickets.length > 0 && (
              <div className="mt-8">
                <h3 className="font-medium text-slate-700 mb-3 text-sm uppercase tracking-wide">Recent Tickets</h3>
                <div className="space-y-2">
                  {tickets.slice(0, 3).map((ticket) => (
                    <Link key={ticket.id} href={`/help/tickets/${ticket.id}`} className="block bg-white rounded-lg p-3 border border-slate-200 hover:border-blue-200 transition-colors">
                      <div className="font-medium text-slate-800 text-sm truncate">{ticket.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-700' : ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-400">{ticket.ticketId}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
