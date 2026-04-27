'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { formatDate } from '@/lib/utils';
import type { SessionUser, TicketStatus, TicketView } from '@/lib/types';

const statusOptions: { value: string; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting_on_customer', label: 'Waiting on Customer' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const statusToEnum: Record<string, TicketStatus> = {
  open: 'OPEN',
  in_progress: 'IN_PROGRESS',
  waiting_on_customer: 'WAITING_ON_CUSTOMER',
  resolved: 'RESOLVED',
  closed: 'CLOSED',
};

const enumToStatus: Record<TicketStatus, string> = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  WAITING_ON_CUSTOMER: 'waiting_on_customer',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

export default function AgentTicketDetail({
  ticket,
  currentUser,
}: {
  ticket: TicketView;
  currentUser: SessionUser;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [message, setMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [replying, setReplying] = useState(false);
  const [statusPending, setStatusPending] = useState(false);
  const [assignPending, setAssignPending] = useState(false);
  const [error, setError] = useState('');

  async function handleStatusChange(newStatusValue: string) {
    const newStatus = statusToEnum[newStatusValue];
    if (!newStatus || newStatus === status) return;
    setStatusPending(true);
    setError('');

    const response = await fetch(`/api/tickets/${ticket.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatusValue }),
    });

    setStatusPending(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? 'Unable to update status.');
      return;
    }

    setStatus(newStatus);
    router.refresh();
  }

  async function handleAssign(assigneeId: string | null) {
    setAssignPending(true);
    setError('');

    const response = await fetch(`/api/tickets/${ticket.id}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assigneeId }),
    });

    setAssignPending(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? 'Unable to update assignee.');
      return;
    }

    router.refresh();
  }

  async function sendReply() {
    if (!message.trim()) return;
    setReplying(true);
    setError('');

    const response = await fetch(`/api/tickets/${ticket.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, isInternalNote }),
    });

    const data = await response.json();
    setReplying(false);

    if (!response.ok) {
      setError(data.error ?? 'Unable to send reply.');
      return;
    }

    setMessage('');
    setIsInternalNote(false);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/agent"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <span className="font-mono text-xs text-slate-400">{ticket.ticketId}</span>
              <h1 className="text-xl font-bold text-slate-900 leading-snug mt-0.5">{ticket.title}</h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={status} />
              <PriorityBadge priority={ticket.priority} />
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                {ticket.department}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full gap-6 p-6">
        {/* Left column */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {/* Description */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Description</h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Conversation + Reply */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">Conversation</h2>
            </div>
            <div className="p-6 space-y-4">
              {ticket.comments.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No replies yet.</p>
              )}
              {ticket.comments.map((comment) => {
                const isAgent = comment.author.role !== 'CUSTOMER';
                return (
                  <div
                    key={comment.id}
                    className={`flex gap-3 ${isAgent ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isAgent ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {comment.author.name.charAt(0)}
                    </div>
                    <div className={`max-w-[75%] flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}>
                      <div className={`flex items-center gap-2 mb-1.5 ${isAgent ? 'flex-row-reverse' : ''}`}>
                        <span className="text-xs font-semibold text-slate-700">{comment.author.name}</span>
                        <span className="text-xs text-slate-400">{formatDate(comment.createdAt)}</span>
                        {comment.isInternalNote && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                            Internal Note
                          </span>
                        )}
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          comment.isInternalNote
                            ? 'bg-amber-50 border border-amber-200 text-amber-900'
                            : isAgent
                              ? 'bg-blue-50 border border-blue-100 text-blue-900'
                              : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {comment.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply form */}
            <div className="border-t border-slate-100 p-6">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isInternalNote ? 'Add an internal note for your team...' : 'Write a reply to the customer...'
                }
                rows={4}
                className={`w-full resize-none rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
                  isInternalNote
                    ? 'border-amber-200 bg-amber-50 text-amber-900 focus:ring-amber-400'
                    : 'border-slate-200 bg-white text-slate-700 focus:ring-blue-500'
                }`}
              />
              {error && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div className="mt-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                  />
                  Internal note
                </label>
                <button
                  type="button"
                  onClick={sendReply}
                  disabled={replying || !message.trim()}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40"
                >
                  {replying ? 'Sending...' : 'Send reply'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-4">
          {/* Details panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-5">
            <h2 className="text-sm font-semibold text-slate-700">Details</h2>

            {/* Status */}
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide block mb-1.5">Status</label>
              <select
                value={enumToStatus[status]}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={statusPending}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-60"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide block mb-1.5">Priority</label>
              <PriorityBadge priority={ticket.priority} />
            </div>

            {/* Customer */}
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide block mb-1.5">Customer</label>
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 bg-violet-100 rounded-full flex items-center justify-center text-xs font-bold text-violet-700 flex-shrink-0">
                  {ticket.author.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{ticket.author.name}</div>
                  <div className="text-xs text-slate-400 truncate">{ticket.author.email}</div>
                </div>
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide block mb-1.5">Assigned Agent</label>
              <div className="text-sm font-medium text-slate-800 mb-2">
                {ticket.assignee?.name ?? <span className="text-slate-400 italic font-normal">Unassigned</span>}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleAssign(currentUser.id)}
                  disabled={assignPending}
                  className="flex-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-40 transition"
                >
                  Assign to me
                </button>
                {ticket.assignee && (
                  <button
                    type="button"
                    onClick={() => handleAssign(null)}
                    disabled={assignPending}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-4">
              <div className="flex justify-between gap-2">
                <span>Created</span>
                <span className="text-slate-700 text-right">{formatDate(ticket.createdAt)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Updated</span>
                <span className="text-slate-700 text-right">{formatDate(ticket.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Activity log */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Activity Log</h2>
            <div className="space-y-3">
              {ticket.auditLogs.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-2">No activity yet.</p>
              )}
              {ticket.auditLogs.map((log) => (
                <div key={log.id} className="text-xs text-slate-500 border-l-2 border-slate-200 pl-3">
                  <span className="font-medium text-slate-700">{log.user.name}</span>{' '}
                  {log.action.toLowerCase().replace(/_/g, ' ')}
                  {log.newValue && (
                    <span>
                      {' → '}
                      <span className="text-slate-700">{log.newValue}</span>
                    </span>
                  )}
                  <div className="mt-0.5 text-slate-400">{formatDate(log.createdAt)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
