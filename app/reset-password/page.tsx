'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Headphones, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Suspense } from 'react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setPending(true);
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json();
    setPending(false);

    if (!response.ok) {
      setError(data.error ?? 'Unable to reset password.');
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push(data.redirectTo ?? '/help');
      router.refresh();
    }, 2000);
  }

  const passwordStrength =
    password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][passwordStrength];
  const strengthColor = ['', 'bg-rose-500', 'bg-amber-400', 'bg-emerald-500'][passwordStrength];

  if (!token) {
    return (
      <div className="text-center">
        <div className="h-16 w-16 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="h-8 w-8 text-rose-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Invalid reset link</h2>
        <p className="text-sm text-slate-400 mb-6">This link is invalid or has expired.</p>
        <Link href="/forgot-password" className="text-violet-400 hover:text-violet-300 text-sm font-medium">
          Request a new reset link →
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Password updated!</h2>
        <p className="text-sm text-slate-400">You are being signed in automatically...</p>
        <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full animate-pulse" style={{ width: '100%' }} />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-slate-300 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-10 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${strengthColor}`}
                  style={{ width: `${(passwordStrength / 3) * 100}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${passwordStrength === 3 ? 'text-emerald-400' : passwordStrength === 2 ? 'text-amber-400' : 'text-rose-400'}`}>
                {strengthLabel}
              </span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirm-new-password" className="block text-sm font-medium text-slate-300 mb-1.5">
            Confirm New Password
          </label>
          <input
            id="confirm-new-password"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your new password"
            required
            className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:ring-2 focus:ring-violet-500/20 ${
              confirmPassword && password !== confirmPassword
                ? 'border-rose-500 focus:border-rose-500'
                : 'border-slate-700 focus:border-violet-500'
            }`}
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="mt-1 text-xs text-rose-400">Passwords do not match</p>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
          {error.includes('expired') && (
            <div className="mt-2">
              <Link href="/forgot-password" className="text-rose-300 underline text-xs">
                Request a new reset link →
              </Link>
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={pending || (!!confirmPassword && password !== confirmPassword)}
        className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        ) : (
          <ShieldCheck className="h-4 w-4" />
        )}
        {pending ? 'Updating password...' : 'Reset Password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Headphones className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold text-white">Support</div>
              <div className="text-xs text-violet-300">by Nexora</div>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">Set new password</h1>
          <p className="mt-2 text-sm text-slate-400">Choose a strong password for your account.</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <Suspense fallback={<div className="text-center text-slate-400 text-sm">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>

          <div className="mt-6 pt-6 border-t border-slate-800">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
