'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Headphones, ShieldCheck, UserCog, UserRound, Sparkles } from 'lucide-react';

const demoAccounts = [
  { label: 'Admin',    email: 'admin@nexora.local',    password: 'Admin123!',    icon: UserCog    },
  { label: 'Agent',    email: 'agent@nexora.local',    password: 'Agent123!',    icon: ShieldCheck },
  { label: 'Customer', email: 'customer@nexora.local', password: 'Customer123!', icon: UserRound   },
];

export default function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [email,    setEmail]    = useState('admin@nexora.local');
  const [password, setPassword] = useState('Admin123!');
  const [error,    setError]    = useState('');
  const [pending,  setPending]  = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, next: nextPath }),
    });

    const data = await response.json();
    setPending(false);

    if (!response.ok) {
      setError(data.error ?? 'Unable to sign in.');
      return;
    }

    router.push(data.redirectTo);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">

      {/* ══════════════════════════════════════════
          LEFT PANEL — hidden on mobile, shown lg+
          ══════════════════════════════════════════ */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 p-12">

        {/* Animated glow orbs */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute bottom-20 right-10 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl" />
        </div>

        {/* All left-panel content floats above the orbs */}
        <div className="relative z-10 flex flex-col">

          {/* Logo */}
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600">
              <Headphones className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">Support</div>
              <div className="text-sm text-violet-300">by Nexora</div>
            </div>
          </div>

          {/* Main headline */}
          <h1 className="max-w-sm text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            Unified support for customers, agents,{' '}
            and admins.
          </h1>

          {/* Subtext */}
          <p className="mt-6 max-w-sm text-base leading-relaxed text-slate-300">
            Sign in to access the rebuilt ticketing system with session-based auth,
            live admin analytics, and full SLA management.
          </p>

          {/* Feature badge */}
          <div className="mt-8 inline-flex w-max items-center gap-2 rounded-full border border-violet-700/50 bg-violet-900/40 px-4 py-1.5 text-sm text-violet-300">
            <Sparkles className="h-4 w-4 text-violet-400" />
            Enterprise-grade helpdesk
          </div>

          {/* Demo account quick-select cards */}
          <div className="mt-12 grid gap-3">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                }}
                className="flex items-center gap-4 rounded-2xl border border-slate-700/60 bg-slate-800/60 p-4 text-left backdrop-blur-sm hover:border-violet-500/60 hover:bg-slate-800/80"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-900/60">
                  <account.icon className="h-4 w-4 text-violet-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{account.label}</div>
                  <div className="mt-0.5 text-xs text-slate-400">{account.email}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="relative z-10 text-xs text-slate-600">
          &copy; 2025 Nexora Inc. All rights reserved.
        </div>
      </div>

      {/* ══════════════════════════════════════
          RIGHT PANEL — white form, always visible
          ══════════════════════════════════════ */}
      <div className="flex flex-1 items-center justify-center bg-white px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">

          {/* Mobile-only logo (hidden on lg since left panel shows it) */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600">
              <Headphones className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">Support</span>
            <span className="text-sm text-slate-400">by Nexora</span>
          </div>

          {/* Form heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Sign in to your account to continue.
            </p>
          </div>

          {/* Mobile demo account cards (hidden on lg — left panel handles them) */}
          <div className="mb-6 grid gap-2 sm:grid-cols-3 lg:hidden">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left hover:border-violet-300 hover:bg-violet-50"
              >
                <account.icon className="mb-1.5 h-4 w-4 text-violet-500" />
                <div className="text-xs font-medium text-slate-800">{account.label}</div>
                <div className="mt-0.5 truncate text-xs text-slate-400">{account.email}</div>
              </button>
            ))}
          </div>

          {/* ── The sign-in form ── */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            {/* Inline error message */}
            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error}
              </div>
            ) : null}

            {/* Submit button */}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in…
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Credentials reference box */}
          <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Demo Credentials
            </p>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>
                <span className="font-medium text-slate-600">Admin:</span>{' '}
                admin@nexora.local{' '}
                <span className="text-slate-400">/</span>{' '}
                Admin123!
              </li>
              <li>
                <span className="font-medium text-slate-600">Agent:</span>{' '}
                agent@nexora.local{' '}
                <span className="text-slate-400">/</span>{' '}
                Agent123!
              </li>
              <li>
                <span className="font-medium text-slate-600">Customer:</span>{' '}
                customer@nexora.local{' '}
                <span className="text-slate-400">/</span>{' '}
                Customer123!
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}
