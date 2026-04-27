'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Headphones, Lock, MessageSquare, Send, User, Tag, Clock } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { SlaIndicator } from '@/components/ui/SlaIndicator';
import { formatDate } from '@/lib/utils';
import type { Priority, SessionUser, TicketStatus, TicketView } from '@/lib/types';

const statuses: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'RESOLVED', 'CLOSED'];
const priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function AgentTicketDetail({
  ticket,
  currentUser,
}: {
  ticket: TicketView;
  currentUser: SessionUser;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [priority, setPriority] = useState<Priority>(ticket.priority);
  const [message, setMessage] = useState('');
  const [replyMode, setReplyMode] = useState<'public' | 'internal'>('public');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function saveTicketChanges() {
    setPending(true);
    setError('');

    const response = await fetch(`/api/tickets/${ticket.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        priority,
        assigneeId: ticket.assignee?.id ?? null,
      }),
    });

    const data = await response.json();
    setPending(false);

    if (!response.ok) {
      setError(data.error ?? 'Unable to update ticket.');
      return;
    }

    router.refresh();
  }

  async function assignToMe(assigneeId: string | null) {
    setPending(true);
    setError('');

    const response = await fetch(`/api/tickets/${ticket.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assigneeId }),
    });

    const data = await response.json();
    setPending(false);

    if (!response.ok) {
      setError(data.error ?? 'Unable to update assignee.');
      return;
    }

    router.refresh();
  }

  async function sendReply() {
    if (!message.trim()) {
      return;
    }

    setPending(true);
    setError('');

    const response = await fetch(`/api/tickets/${ticket.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        isInternalNote: replyMode === 'internal',
      }),
    });

    const data = await response.json();
    setPending(false);

    if (!response.ok) {
      setError(data.error ?? 'Unable to send reply.');
      return;
    }

    setMessage('');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <aside className="w-14 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-4">
        <div className="h-8 w-8 bg-violet-600 rounded-lg flex items-center justify-center">
          <Headphones className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1" />
        <Link href="/agent" className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </aside>

      <div className="flex-1 flex overflow-hidden bg-slate-50">
        <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0">
          <div className="p-5 border-b border-slate-100">
            <div className="text-xs font-mono text-slate-400 mb-1">{ticket.ticketId}</div>
            <h2 className="font-semibold text-slate-900 text-base leading-snug">{ticket.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{ticket.description}</p>
          </div>

          <div className="p-4 space-y-4 border-b border-slate-100">
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide block mb-2">Status</label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as TicketStatus)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
              >
                {statuses.map((item) => (
                  <option key={item} value={item}>
                    {item.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide block mb-2">Priority</label>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as Priority)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
              >
                {priorities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={saveTicketChanges}
              disabled={pending}
              className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 active:bg-violet-800 disabled:opacity-40"
            >
              {pending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="p-4 space-y-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-slate-400" />
              <span className="text-slate-500">Customer:</span>
              <span className="font-medium text-slate-800">{ticket.author.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4 text-slate-400" />
              <span className="text-slate-500">Department:</span>
              <span className="font-medium text-slate-800">{ticket.department}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-slate-500">SLA:</span>
              <SlaIndicator createdAt={ticket.createdAt} status={status} />
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-500">Assignee</div>
              <div className="mt-2 text-sm font-medium text-slate-800">
                {ticket.assignee?.name ?? 'Unassigned'}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => assignToMe(currentUser.id)}
                  disabled={pending}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800 disabled:opacity-40"
                >
                  Assign to me
                </button>
                <button
                  type="button"
                  onClick={() => assignToMe(null)}
                  disabled={pending}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-white disabled:opacity-40"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-3">Activity Log</div>
            <div className="space-y-2">
              {ticket.auditLogs.map((log) => (
                <div key={log.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{log.user.name}</span> {log.action.toLowerCase().replace(/_/g, ' ')}
                  {log.newValue ? <span className="text-slate-400"> → <span className="text-slate-700">{log.newValue}</span></span> : null}
                  <div className="mt-1 text-slate-400">{formatDate(log.createdAt)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {ticket.comments.map((comment) => {
              const isAgent = comment.author.role !== 'CUSTOMER';
              return (
                <div key={comment.id} className="flex gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isAgent ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>
                    {comment.author.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-semibold text-slate-800">{comment.author.name}</span>
                      <span className="text-xs text-slate-400">{formatDate(comment.createdAt)}</span>
                      {comment.isInternalNote ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                          <Lock className="h-3 w-3" /> Internal Note
                        </span>
                      ) : null}
                    </div>
                    <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${comment.isInternalNote ? 'bg-amber-50 border border-amber-200 text-amber-900' : isAgent ? 'bg-white border border-slate-200 text-slate-700' : 'bg-violet-600 text-white'}`}>
                      {comment.message}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-200 bg-white">
            <div className="flex border-b border-slate-100">
              <button
                type="button"
                onClick={() => setReplyMode('public')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${replyMode === 'public' ? 'border-violet-600 text-violet-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <MessageSquare className="h-4 w-4" /> Public Reply
              </button>
              <button
                type="button"
                onClick={() => setReplyMode('internal')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${replyMode === 'internal' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <Lock className="h-4 w-4" /> Internal Note
              </button>
            </div>

            <div className={`p-4 ${replyMode === 'internal' ? 'bg-amber-50' : 'bg-white'}`}>
              {replyMode === 'internal' ? (
                <div className="mb-3 rounded-lg border border-amber-200 bg-amber-100 px-3 py-2 text-xs text-amber-800">
                  This note is only visible to staff members.
                </div>
              ) : null}
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={replyMode === 'public' ? 'Write a reply to the customer...' : 'Add an internal note for your team...'}
                rows={4}
                className={`w-full resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${replyMode === 'internal' ? 'border-amber-200 bg-amber-50 text-amber-900 focus:ring-amber-500' : 'border-slate-200 bg-white text-slate-700 focus:ring-violet-500'}`}
              />
              {error ? (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusBadge status={status} />
                  <PriorityBadge priority={priority} />
                </div>
                <button
                  type="button"
                  onClick={sendReply}
                  disabled={pending || message.trim().length === 0}
                  className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition ${replyMode === 'internal' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-violet-600 hover:bg-violet-700 active:bg-violet-800'} disabled:opacity-40`}
                >
                  <Send className="h-4 w-4" />
                  {pending ? 'Sending...' : replyMode === 'public' ? 'Send Reply' : 'Add Note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
