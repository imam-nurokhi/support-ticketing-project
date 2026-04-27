'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Send } from 'lucide-react';

export default function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');

    const response = await fetch(`/api/tickets/${ticketId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
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
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-violet-500" aria-hidden="true" />
        <span className="text-sm font-semibold text-slate-700">Add a Reply</span>
      </div>

      <div className="p-4 md:p-5">
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Type your message here…"
          rows={4}
          aria-label="Reply message"
          className="w-full text-sm text-slate-700 placeholder-slate-400 resize-none rounded-xl border border-slate-200 p-3.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
        />

        {error ? (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
            {error}
          </div>
        ) : null}
      </div>

      <div className="px-4 md:px-5 pb-4 flex items-center justify-between">
        <span className="text-xs text-slate-400">{message.length > 0 ? `${message.length} characters` : 'Be as detailed as possible'}</span>
        <button
          type="submit"
          disabled={pending || message.trim().length === 0}
          className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {pending ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Sending…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Send Reply
            </>
          )}
        </button>
      </div>
    </form>
  );
}
