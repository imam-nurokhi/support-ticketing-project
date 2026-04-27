'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Headphones, Eye, EyeOff, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setPending(true);
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    });

    const data = await response.json();
    setPending(false);

    if (!response.ok) {
      setError(data.error ?? 'Registration failed. Please try again.');
      return;
    }

    router.push(data.redirectTo ?? '/help');
    router.refresh();
  }

  const passwordStrength =
    form.password.length === 0
      ? 0
      : form.password.length < 8
        ? 1
        : form.password.length < 12 || !/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)
          ? 2
          : 3;

  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][passwordStrength];
  const strengthColor = ['', 'bg-rose-500', 'bg-amber-400', 'bg-emerald-500'][passwordStrength];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
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
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-2 text-sm text-slate-400">Get help from our support team</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 shadow-2xl"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Your full name"
                required
                minLength={2}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
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
              {form.password.length > 0 && (
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
              <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => setField('confirmPassword', e.target.value)}
                placeholder="Repeat your password"
                required
                className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:ring-2 focus:ring-violet-500/20 ${
                  form.confirmPassword && form.password !== form.confirmPassword
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-slate-700 focus:border-violet-500'
                }`}
              />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="mt-1 text-xs text-rose-400">Passwords do not match</p>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending || (!!form.confirmPassword && form.password !== form.confirmPassword)}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? (
              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {pending ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="mt-4 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">
              Sign in
            </Link>
          </p>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          By creating an account you agree to our{' '}
          <span className="text-slate-400">Terms of Service</span> and{' '}
          <span className="text-slate-400">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
