'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Settings, CreditCard, MessageCircle, FileText, Headphones, AlertCircle, TrendingUp, Minus, Zap } from 'lucide-react';

const departments = [
  { id: 'Technical', label: 'Technical Support', desc: 'Bugs, errors, integrations, account access', icon: Settings, iconClass: 'text-blue-600' },
  { id: 'Billing', label: 'Billing & Payments', desc: 'Invoices, charges, refunds, subscriptions', icon: CreditCard, iconClass: 'text-green-600' },
  { id: 'General', label: 'General Inquiry', desc: 'General questions about our products', icon: MessageCircle, iconClass: 'text-purple-600' },
  { id: 'Sales', label: 'Sales', desc: 'Pricing, enterprise plans, partnerships', icon: FileText, iconClass: 'text-amber-600' },
];

const priorities = [
  { id: 'LOW', label: 'Low', desc: 'General questions, no urgency', icon: Minus, iconClass: 'text-slate-600' },
  { id: 'MEDIUM', label: 'Medium', desc: 'Affecting my work but I have a workaround', icon: TrendingUp, iconClass: 'text-blue-600' },
  { id: 'HIGH', label: 'High', desc: 'Significantly impacting my work', icon: AlertCircle, iconClass: 'text-orange-600' },
  { id: 'URGENT', label: 'Urgent', desc: 'Complete blocker, business critical', icon: Zap, iconClass: 'text-red-600' },
];

export default function NewTicketPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    department: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => router.push('/help/tickets'), 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Ticket Submitted!</h2>
          <p className="text-slate-600 mb-6">We&apos;ll get back to you within 2 hours. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/help" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            <Headphones className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-slate-800">Resolv</span>
          </Link>
          <span className="text-sm text-slate-500">Submit a Support Ticket</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                s < step ? 'bg-blue-600 text-white' : s === step ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-200 text-slate-500'
              }`}>
                {s < step ? <Check className="h-4 w-4" /> : s}
              </div>
              <div className="mx-2 text-xs text-slate-500 hidden sm:block">
                {s === 1 ? 'Category' : s === 2 ? 'Details' : 'Priority'}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 mx-2 ${s < step ? 'bg-blue-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Step 1: Department */}
          {step === 1 && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-2">What do you need help with?</h2>
              <p className="text-slate-500 text-sm mb-6">Select the category that best describes your issue</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => setForm({ ...form, department: dept.id })}
                    className={`text-left p-4 rounded-xl border-2 transition-all hover:shadow-sm ${
                      form.department === dept.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <dept.icon className={`h-6 w-6 ${dept.iconClass} mb-2`} />
                    <div className="font-semibold text-slate-900 text-sm">{dept.label}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{dept.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Title + Description */}
          {step === 2 && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Describe your issue</h2>
              <p className="text-slate-500 text-sm mb-6">Be as specific as possible to help us resolve this faster</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Brief summary of your issue"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Please provide detailed information about your issue, including any error messages, steps to reproduce, and what you expected to happen..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Priority */}
          {step === 3 && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-2">How urgent is this?</h2>
              <p className="text-slate-500 text-sm mb-6">This helps us prioritize your ticket correctly</p>
              <div className="space-y-3 mb-6">
                {priorities.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setForm({ ...form, priority: p.id })}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      form.priority === p.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p.icon className={`h-5 w-5 ${p.iconClass} flex-shrink-0`} />
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{p.label}</div>
                      <div className="text-slate-500 text-xs">{p.desc}</div>
                    </div>
                    {form.priority === p.id && <Check className="h-4 w-4 text-blue-600 ml-auto" />}
                  </button>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Ticket Summary</div>
                <div className="space-y-1.5 text-sm">
                  <div><span className="text-slate-500">Category:</span> <span className="font-medium text-slate-800">{form.department}</span></div>
                  <div><span className="text-slate-500">Subject:</span> <span className="font-medium text-slate-800 truncate">{form.title || '—'}</span></div>
                  <div><span className="text-slate-500">Priority:</span> <span className="font-medium text-slate-800">{form.priority}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={(step === 1 && !form.department) || (step === 2 && (!form.title || !form.description))}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                Submit Ticket <Check className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
