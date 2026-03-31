'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Ticket, TicketStatus, Priority, mockUsers } from '@/lib/mock-data';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { SlaIndicator } from '@/components/ui/SlaIndicator';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Send, Headphones, Lock, MessageSquare, User, Tag, Clock, ChevronDown } from 'lucide-react';

export default function AgentTicketDetail({ ticket }: { ticket: Ticket }) {
  const [replyTab, setReplyTab] = useState<'public' | 'internal'>('public');
  const [replyText, setReplyText] = useState('');
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [priority, setPriority] = useState<Priority>(ticket.priority);

  const agents = mockUsers.filter(u => u.role === 'SUPPORT_AGENT' || u.role === 'ADMIN');

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-14 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-4">
        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Headphones className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1" />
        <Link href="/agent" className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </aside>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden bg-slate-50">
        {/* Left: Ticket Details */}
        <div className="w-72 bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0">
          <div className="p-4 border-b border-slate-100">
            <div className="text-xs font-mono text-slate-400 mb-1">{ticket.ticketId}</div>
            <h2 className="font-semibold text-slate-900 text-sm leading-snug">{ticket.title}</h2>
          </div>

          {/* Status & Priority */}
          <div className="p-4 space-y-4 border-b border-slate-100">
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide block mb-2">Status</label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TicketStatus)}
                  className="w-full appearance-none text-sm border border-slate-200 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {(['OPEN', 'IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'RESOLVED', 'CLOSED'] as TicketStatus[]).map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide block mb-2">Priority</label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full appearance-none text-sm border border-slate-200 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as Priority[]).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Info */}
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
          </div>

          {/* Assignee */}
          <div className="p-4 border-b border-slate-100">
            <label className="text-xs text-slate-500 uppercase tracking-wide block mb-2">Assignee</label>
            <div className="relative">
              <select className="w-full appearance-none text-sm border border-slate-200 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" defaultValue={ticket.assigneeId || ''}>
                <option value="">Unassigned</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Audit Log */}
          <div className="p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-3">Activity Log</div>
            <div className="space-y-2">
              {ticket.auditLogs.map((log) => (
                <div key={log.id} className="text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{log.user.name}</span> {log.action.toLowerCase().replace('_', ' ')}
                  {log.newValue && <span className="text-slate-400"> → <span className="text-slate-600">{log.newValue}</span></span>}
                  <div className="text-slate-400 text-xs mt-0.5">{formatDate(log.createdAt)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Conversation */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Thread */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {ticket.comments.map((comment) => {
              const isAgent = comment.author.role !== 'CUSTOMER';
              return (
                <div key={comment.id} className={`flex gap-3 ${comment.isInternalNote ? 'opacity-100' : ''}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isAgent ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                    {comment.author.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-semibold text-slate-800">{comment.author.name}</span>
                      <span className="text-xs text-slate-400">{formatDate(comment.createdAt)}</span>
                      {comment.isInternalNote && (
                        <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                          <Lock className="h-3 w-3" /> Internal Note
                        </span>
                      )}
                    </div>
                    <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${comment.isInternalNote ? 'bg-amber-50 border border-amber-200 text-amber-900' : isAgent ? 'bg-white border border-slate-200 text-slate-700' : 'bg-blue-600 text-white'}`}>
                      {comment.message}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply Console */}
          <div className="border-t border-slate-200 bg-white">
            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => setReplyTab('public')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${replyTab === 'public' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <MessageSquare className="h-4 w-4" /> Public Reply
              </button>
              <button
                onClick={() => setReplyTab('internal')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${replyTab === 'internal' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <Lock className="h-4 w-4" /> Internal Note
              </button>
            </div>

            <div className={`p-4 ${replyTab === 'internal' ? 'bg-amber-50' : 'bg-white'}`}>
              {replyTab === 'internal' && (
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-100 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                  <Lock className="h-3.5 w-3.5" />
                  This note is only visible to agents — the customer cannot see it
                </div>
              )}
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={replyTab === 'public' ? 'Write a reply to the customer...' : 'Add an internal note for your team...'}
                rows={4}
                className={`w-full text-sm placeholder-slate-400 resize-none focus:outline-none rounded-lg px-3 py-2 border ${replyTab === 'internal' ? 'bg-amber-50 border-amber-200 text-amber-900 focus:ring-amber-500' : 'bg-white border-slate-200 text-slate-700 focus:ring-blue-500'} focus:ring-2 focus:border-transparent`}
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <StatusBadge status={status} />
                  <PriorityBadge priority={priority} />
                </div>
                <button
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${replyTab === 'internal' ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  <Send className="h-4 w-4" />
                  {replyTab === 'public' ? 'Send Reply' : 'Add Note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
