import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { formatDate } from '@/lib/utils';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { requireUser } from '@/lib/auth';
import { getTicketForCustomer } from '@/lib/tickets';
import { ArrowLeft, CheckCircle2, Headphones, PlusCircle } from 'lucide-react';
import TicketReplyForm from './TicketReplyForm';
import AttachmentList from '@/components/ui/AttachmentList';

export default async function CustomerTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(['CUSTOMER'], '/help/tickets');
  const { id } = await params;
  const ticket = await getTicketForCustomer(id, user.id);
  if (!ticket) notFound();

  const publicComments = ticket.comments.filter((c) => !c.isInternalNote);
  const isResolved = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/help/tickets"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
              aria-label="Back to my tickets"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link href="/help" className="flex items-center gap-2 flex-shrink-0">
              <div className="h-7 w-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <Headphones className="h-4 w-4 text-white" />
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="font-bold text-slate-900 text-sm leading-none">Support</span>
                <span className="text-[10px] text-violet-600 font-medium leading-none">by Nexora</span>
              </div>
            </Link>
            <span className="text-slate-300 hidden sm:block">·</span>
            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-lg hidden sm:block">
              {ticket.ticketId}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:block">
              <StatusBadge status={ticket.status} />
            </div>
            <LogoutButton className="text-sm text-slate-500 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-colors" />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {/* Resolved banner */}
        {isResolved && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 md:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-emerald-800 font-semibold text-sm">This ticket has been resolved</p>
                <p className="text-emerald-700 text-xs mt-0.5">Need more help? Open a new ticket and we&apos;ll assist you.</p>
              </div>
            </div>
            <Link
              href="/help/tickets/new"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors flex-shrink-0"
            >
              <PlusCircle className="h-4 w-4" /> Open New Ticket
            </Link>
          </div>
        )}

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 mb-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                  {ticket.ticketId}
                </span>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {ticket.department}
                </span>
                <span className="text-xs text-slate-400">{formatDate(ticket.createdAt)}</span>
              </div>
              <h1 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">{ticket.title}</h1>
            </div>
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>

          {ticket.assignee && (
            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-500">Assigned to</span>
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 text-xs font-bold">
                  {ticket.assignee.name.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-slate-700">{ticket.assignee.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Conversation thread */}
        <div className="space-y-4 mb-6">
          {publicComments.map((comment) => {
            const isAgent = comment.author.role !== 'CUSTOMER';
            return (
              <div key={comment.id} className={`flex gap-3 ${isAgent ? '' : 'flex-row-reverse'}`}>
                {/* Avatar */}
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    isAgent ? 'bg-violet-100 text-violet-700' : 'bg-slate-200 text-slate-600'
                  }`}
                  aria-label={comment.author.name}
                >
                  {comment.author.name.charAt(0)}
                </div>

                {/* Bubble */}
                <div className={`flex-1 max-w-[85%] md:max-w-[80%] ${isAgent ? '' : 'flex flex-col items-end'}`}>
                  <div
                    className={`rounded-2xl px-4 md:px-5 py-4 ${
                      isAgent
                        ? 'bg-white border border-slate-200 rounded-tl-sm shadow-sm'
                        : 'bg-blue-600 rounded-tr-sm shadow-sm'
                    }`}
                  >
                    <div className={`text-xs font-semibold mb-2 ${isAgent ? 'text-blue-600' : 'text-blue-200'}`}>
                      {comment.author.name}
                      <span className={`font-normal ml-1.5 ${isAgent ? 'text-slate-400' : 'text-blue-300'}`}>
                        · {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isAgent ? 'text-slate-700' : 'text-white'}`}>
                      {comment.message}
                    </p>
                    <AttachmentList attachments={comment.attachments} dark={!isAgent} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reply form (hidden when resolved) */}
        {!isResolved ? <TicketReplyForm ticketId={ticket.id} /> : null}
      </div>
    </div>
  );
}
