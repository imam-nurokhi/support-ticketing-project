import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTicketById } from '@/lib/mock-data';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Headphones, Send } from 'lucide-react';

export default async function CustomerTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = getTicketById(id);
  if (!ticket) notFound();

  const publicComments = ticket.comments.filter(c => !c.isInternalNote);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/help/tickets" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            <Headphones className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-slate-800">My Tickets</span>
          </Link>
          <span className="text-sm font-mono text-slate-400">{ticket.ticketId}</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{ticket.ticketId}</span>
                <span className="text-xs text-slate-400">{ticket.department}</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">{ticket.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>
          {ticket.assignee && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Assigned to</span>
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-semibold">
                  {ticket.assignee.name.charAt(0)}
                </div>
                <span className="font-medium text-slate-700">{ticket.assignee.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="space-y-4 mb-6">
          {publicComments.map((comment) => {
            const isAgent = comment.author.role !== 'CUSTOMER';
            return (
              <div key={comment.id} className={`flex gap-4 ${isAgent ? '' : 'flex-row-reverse'}`}>
                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${isAgent ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                  {comment.author.name.charAt(0)}
                </div>
                <div className={`flex-1 max-w-[85%] ${isAgent ? '' : 'items-end flex flex-col'}`}>
                  <div className={`rounded-2xl px-5 py-4 ${isAgent ? 'bg-white border border-slate-200 rounded-tl-sm' : 'bg-blue-600 text-white rounded-tr-sm'}`}>
                    <div className={`text-xs font-medium mb-2 ${isAgent ? 'text-slate-500' : 'text-blue-100'}`}>
                      {comment.author.name} · {formatDate(comment.createdAt)}
                    </div>
                    <p className={`text-sm leading-relaxed ${isAgent ? 'text-slate-700' : 'text-white'}`}>{comment.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reply box */}
        {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-700">Add a Reply</span>
            </div>
            <div className="p-4">
              <textarea
                placeholder="Type your message here..."
                rows={4}
                className="w-full text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none"
              />
            </div>
            <div className="px-4 pb-4 flex justify-end">
              <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                <Send className="h-4 w-4" /> Send Reply
              </button>
            </div>
          </div>
        )}

        {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-700 font-medium text-sm">This ticket has been resolved. If you need further assistance, please submit a new ticket.</p>
            <Link href="/help/tickets/new" className="inline-flex items-center gap-1 text-green-700 text-sm mt-2 hover:underline">Open new ticket →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
