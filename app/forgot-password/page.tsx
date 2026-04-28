'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Headphones, ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError('');
    setResetUrl('');

    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    setPending(false);

    if (!response.ok) {
      setError(data.error ?? 'Something went wrong. Please try again.');
      return;
    }

    setDone(true);
    if (data.resetUrl) {
      setResetUrl(data.resetUrl);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Headphones className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold text-white">Support</div>
              <div className="text-xs text-violet-300">by Nexora</div>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">Forgot your password?</h1>
          <p className="mt-2 text-sm text-slate-400">
            Enter your email and we&apos;ll send a reset link to your inbox.
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 shadow-2xl">
          {done ? (
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-violet-400" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">Check your reset link</h2>
              <p className="text-sm text-slate-400 mb-6">
                If <span className="text-slate-200 font-medium">{email}</span> is registered, a reset link has been sent.
              </p>

              {resetUrl && (
                <div className="bg-violet-950/60 border border-violet-800/50 rounded-2xl p-4 mb-6 text-left">
                  <div className="text-xs text-violet-400 font-medium uppercase tracking-wide mb-2">
                    Development Preview Link
                  </div>
                  <Link
                    href={resetUrl}
                    className="text-sm text-violet-300 hover:text-violet-100 break-all underline decoration-violet-500/50"
                  >
                    {resetUrl}
                  </Link>
                  <p className="text-xs text-slate-500 mt-2">Valid for 1 hour. Click the link above to reset your password.</p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {resetUrl && (
                  <Link
                    href={resetUrl}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Reset Password Now →
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => { setDone(false); setEmail(''); setResetUrl(''); }}
                  className="text-sm text-slate-400 hover:text-slate-200"
                >
                  Try a different email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={pending || !email.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? (
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {pending ? 'Sending email...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-800">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
