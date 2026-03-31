import Link from 'next/link';
import { getTicketsForCustomer, CURRENT_CUSTOMER } from '@/lib/mock-data';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { SlaIndicator } from '@/components/ui/SlaIndicator';
import { Headphones, PlusCircle, ArrowLeft } from 'lucide-react';

export default function CustomerTicketListPage() {
  const tickets = getTicketsForCustomer(CURRENT_CUSTOMER.id);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/help" className="flex items-center gap-2">
            <Headphones className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-slate-800">Resolv</span>
          </Link>
          <Link href="/help/tickets/new" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <PlusCircle className="h-4 w-4" /> New Ticket
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/help" className="text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">My Support Tickets</h1>
          <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-sm font-medium">{tickets.length}</span>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Headphones className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">No tickets yet</h3>
            <p className="text-slate-500 text-sm mb-4">Submit your first support request and we&apos;ll help you out.</p>
            <Link href="/help/tickets/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700">
              <PlusCircle className="h-4 w-4" /> Submit Ticket
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <Link key={ticket.id} href={`/help/tickets/${ticket.id}`} className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-200 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono text-slate-400">{ticket.ticketId}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-400">{ticket.department}</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 truncate">{ticket.title}</h3>
                    <p className="text-slate-500 text-sm mt-1 line-clamp-2">{ticket.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <SlaIndicator createdAt={ticket.createdAt} status={ticket.status} />
                  <span className="text-xs text-slate-400">{ticket.comments.length} message{ticket.comments.length !== 1 ? 's' : ''}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
