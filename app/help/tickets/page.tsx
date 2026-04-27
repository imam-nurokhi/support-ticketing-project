import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { SlaIndicator } from '@/components/ui/SlaIndicator';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { requireUser } from '@/lib/auth';
import { getCustomerTickets } from '@/lib/tickets';
import { Headphones, PlusCircle, ArrowLeft } from 'lucide-react';

export default async function CustomerTicketListPage() {
  const user = await requireUser(['CUSTOMER'], '/help/tickets');
  const tickets = await getCustomerTickets(user.id);

  const sortedTickets = [...tickets].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link
              href="/help"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Back to help centre"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link href="/help" className="flex items-center gap-2">
              <div className="h-7 w-7 bg-violet-600 rounded-lg flex items-center justify-center">
                <Headphones className="h-4 w-4 text-white" />
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="font-bold text-slate-900 text-sm leading-none">Support</span>
                <span className="text-[10px] text-violet-600 font-medium leading-none">by Nexora</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/help/tickets/new"
              className="flex items-center gap-2 bg-violet-600 text-white px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">New Ticket</span>
              <span className="sm:hidden">New</span>
            </Link>
            <LogoutButton className="text-sm text-slate-500 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-colors" />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl font-bold text-slate-900">My Tickets</h1>
          <span className="bg-violet-100 text-violet-700 px-2.5 py-0.5 rounded-full text-sm font-semibold">
            {tickets.length}
          </span>
        </div>

        {sortedTickets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <div className="h-16 w-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Headphones className="h-8 w-8 text-violet-400" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2 text-lg">No tickets yet</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
              Submit your first support request and our team will get back to you shortly.
            </p>
            <Link
              href="/help/tickets/new"
              className="inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors"
            >
              <PlusCircle className="h-4 w-4" /> Submit Your First Ticket
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/help/tickets/${ticket.id}`}
                className="block bg-white rounded-2xl border border-slate-200 p-5 hover:border-violet-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {ticket.ticketId}
                      </span>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {ticket.department}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 truncate text-base">{ticket.title}</h3>
                    <p className="text-slate-500 text-sm mt-1 line-clamp-2 leading-relaxed">{ticket.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  <SlaIndicator createdAt={ticket.createdAt} status={ticket.status} />
                  <span className="text-xs text-slate-400">
                    {ticket.comments.length} message{ticket.comments.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
