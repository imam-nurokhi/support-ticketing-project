'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ClipboardList,
  Globe,
  GraduationCap,
  Headphones,
  Megaphone,
  MessageCircle,
  Minus,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

const departments = [
  { id: 'LMS', label: 'LMS (Learning Management)', desc: 'E-learning, course access, penilaian', icon: BookOpen, iconClass: 'text-violet-600' },
  { id: 'CRM', label: 'CRM Application', desc: 'Data customer, input data, fitur CRM', icon: Users, iconClass: 'text-green-600' },
  { id: 'AUDITQ', label: 'AUDITQ', desc: 'Audit project, extension, dokumentasi', icon: ClipboardList, iconClass: 'text-purple-600' },
  { id: 'Website', label: 'Website', desc: 'Perubahan konten, akses website, bug', icon: Globe, iconClass: 'text-cyan-600' },
  { id: 'Marketing', label: 'Marketing', desc: 'Desain, brosur, blast email, jadwal', icon: Megaphone, iconClass: 'text-amber-600' },
  { id: 'Training Service', label: 'Training Service', desc: 'Penambahan standar, jadwal training', icon: GraduationCap, iconClass: 'text-indigo-600' },
  { id: 'General', label: 'General / Other', desc: 'Pertanyaan umum atau lainnya', icon: MessageCircle, iconClass: 'text-slate-600' },
];

const priorities = [
  { id: 'LOW', label: 'Low', desc: 'General questions, no urgency', icon: Minus, iconClass: 'text-slate-600' },
  { id: 'MEDIUM', label: 'Medium', desc: 'Affecting my work but I have a workaround', icon: TrendingUp, iconClass: 'text-violet-600' },
  { id: 'HIGH', label: 'High', desc: 'Significantly impacting my work', icon: AlertCircle, iconClass: 'text-orange-600' },
  { id: 'URGENT', label: 'Urgent', desc: 'Complete blocker, business critical', icon: Zap, iconClass: 'text-red-600' },
];

const stepLabels = ['Category', 'Details', 'Priority'];

export default function NewTicketForm({ initialDepartment }: { initialDepartment?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    department: initialDepartment && departments.some((item) => item.id === initialDepartment) ? initialDepartment : '',
    title: '',
    description: '',
    priority: 'MEDIUM',
  });

  const canContinue = useMemo(() => {
    if (step === 1) return Boolean(form.department);
    if (step === 2) return form.title.trim().length >= 5 && form.description.trim().length >= 10;
    return true;
  }, [form.department, form.description, form.title, step]);

  async function handleSubmit() {
    setPending(true);
    setError('');

    const response = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    setPending(false);

    if (!response.ok) {
      setError(data.error ?? 'Unable to create ticket.');
      return;
    }

    setSubmitted(true);
    router.push(`/help/tickets/${data.ticket.id}`);
    router.refresh();
  }

  if (submitted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/help/tickets" className="flex items-center gap-2.5 text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <div className="h-7 w-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Headphones className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-slate-900 text-sm leading-none">Support</span>
              <span className="text-[10px] text-violet-600 font-medium leading-none">by Nexora</span>
            </div>
          </Link>
          <span className="text-sm text-slate-500 hidden sm:block">Submit a support ticket</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10 md:py-14">
        {/* Step indicator */}
        <div className="flex items-center justify-center mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    s < step
                      ? 'bg-blue-600 text-white'
                      : s === step
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {s < step ? <Check className="h-4 w-4" /> : s}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${s === step ? 'text-blue-600' : 'text-slate-400'}`}>
                  {stepLabels[s - 1]}
                </span>
              </div>
              {s < 3 ? (
                <div className={`w-16 md:w-24 h-0.5 mx-2 mb-5 transition-colors ${s < step ? 'bg-blue-600' : 'bg-slate-200'}`} />
              ) : null}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Step 1 — Category */}
          {step === 1 ? (
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-1">What do you need help with?</h2>
              <p className="text-slate-500 text-sm mb-6">Choose the department that best matches your request.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, department: dept.id }))}
                    className={`text-left p-4 rounded-xl border-2 transition-all hover:shadow-sm min-h-[88px] ${
                      form.department === dept.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-200 hover:bg-blue-50/30'
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center mb-2 transition-colors ${
                        form.department === dept.id ? 'bg-blue-100' : 'bg-slate-100'
                      }`}
                    >
                      <dept.icon className={`h-4 w-4 ${dept.iconClass}`} />
                    </div>
                    <div className="font-semibold text-slate-900 text-sm">{dept.label}</div>
                    <div className="text-slate-500 text-xs mt-0.5 leading-relaxed">{dept.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Step 2 — Details */}
          {step === 2 ? (
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Describe your issue</h2>
              <p className="text-slate-500 text-sm mb-6">The more context you give, the faster the response.</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="ticket-title">
                    Subject
                  </label>
                  <input
                    id="ticket-title"
                    type="text"
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Brief summary of your issue"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-shadow"
                  />
                  <p className="text-xs text-slate-400 mt-1.5">Minimum 5 characters · {form.title.length} typed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="ticket-desc">
                    Description
                  </label>
                  <textarea
                    id="ticket-desc"
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                    placeholder="Please provide detailed information, steps to reproduce, and any error messages."
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400 resize-none transition-shadow"
                  />
                  <p className="text-xs text-slate-400 mt-1.5">Minimum 10 characters · {form.description.length} typed</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Step 3 — Priority */}
          {step === 3 ? (
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-1">How urgent is this?</h2>
              <p className="text-slate-500 text-sm mb-6">This helps the team prioritize correctly.</p>
              <div className="space-y-3 mb-6">
                {priorities.map((priority) => (
                  <button
                    key={priority.id}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, priority: priority.id }))}
                    className={`w-full text-left py-4 px-5 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      form.priority === priority.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-200 hover:bg-blue-50/20'
                    }`}
                  >
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        form.priority === priority.id ? 'bg-blue-100' : 'bg-slate-100'
                      }`}
                    >
                      <priority.icon className={`h-4 w-4 ${priority.iconClass}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 text-sm">{priority.label}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{priority.desc}</div>
                    </div>
                    {form.priority === priority.id ? (
                      <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-slate-200 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Summary card */}
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Ticket Summary</div>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-slate-500 w-20 flex-shrink-0">Category</span>
                    <span className="font-semibold text-slate-800">{form.department}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-500 w-20 flex-shrink-0">Subject</span>
                    <span className="font-semibold text-slate-800 truncate">{form.title || '—'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-500 w-20 flex-shrink-0">Priority</span>
                    <span className="font-semibold text-slate-800">{form.priority}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Error message */}
          {error ? (
            <div className="mx-6 md:mx-8 mb-4 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          ) : null}

          {/* Navigation footer */}
          <div className="px-6 md:px-8 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep((current) => current - 1)}
              disabled={step === 1 || pending}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium py-2.5 px-3 rounded-xl hover:bg-slate-200/50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((current) => current + 1)}
                disabled={!canContinue || pending}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={pending}
                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {pending ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Submitting…
                  </>
                ) : (
                  <>
                    Submit Ticket <Check className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
