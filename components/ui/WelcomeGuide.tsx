'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Headphones,
  Mail,
  MessageSquare,
  Paperclip,
  Shield,
  X,
  Zap,
} from 'lucide-react';

interface Step {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  tip?: string;
}

const CUSTOMER_STEPS: Step[] = [
  {
    icon: <Headphones className="h-8 w-8 text-white" />,
    iconBg: 'bg-gradient-to-br from-blue-500 to-violet-600',
    title: 'Welcome to Resolv! 🎉',
    description:
      'Your all-in-one support portal — submit requests, track progress, and communicate directly with our team.',
    tip: 'Your data is secure and only visible to you and our support staff.',
  },
  {
    icon: <FileText className="h-8 w-8 text-white" />,
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    title: 'Submit a Ticket',
    description:
      'Click "New Ticket" to report an issue or ask for help. Choose the right department, describe your issue clearly, and pick the urgency level.',
    tip: 'The more detail you provide, the faster we can help you!',
  },
  {
    icon: <Paperclip className="h-8 w-8 text-white" />,
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
    title: 'Attach Files',
    description:
      'You can attach screenshots, documents, or other files (images, PDF, Word, Excel, ZIP — up to 10 MB each, 5 files max) when submitting or replying to a ticket.',
    tip: 'A screenshot often helps the team understand the issue faster.',
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-white" />,
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    title: 'Track & Reply',
    description:
      'View all your tickets from "My Tickets". Open any ticket to see the full conversation and add replies — just like a chat thread!',
    tip: 'Replying to a ticket automatically moves it back to "In Progress".',
  },
  {
    icon: <Mail className="h-8 w-8 text-white" />,
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600',
    title: 'Email Notifications',
    description:
      'You\'ll receive email updates when your ticket is confirmed, replied to, or resolved — so you\'re always in the loop.',
    tip: 'Make sure to whitelist the sender email from your settings to avoid missing email notifications.',
  },
];

const AGENT_STEPS: Step[] = [
  {
    icon: <Shield className="h-8 w-8 text-white" />,
    iconBg: 'bg-gradient-to-br from-blue-600 to-indigo-700',
    title: 'Welcome, Agent! 👋',
    description:
      'This is your agent portal — manage customer tickets, add replies or internal notes, and track all activity from one place.',
    tip: 'Only you and other agents can see internal notes — they\'re invisible to customers.',
  },
  {
    icon: <Zap className="h-8 w-8 text-white" />,
    iconBg: 'bg-gradient-to-br from-amber-500 to-yellow-500',
    title: 'Manage Tickets',
    description:
      'Browse tickets from the dashboard, filter by status or priority, assign them to yourself, and change statuses as issues progress.',
    tip: 'Use "Assign to me" for quick self-assignment.',
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-white" />,
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    title: 'Reply & Internal Notes',
    description:
      'Reply publicly to customers or add internal notes for your team. Attach screenshots, documents, or other files (up to 5 per message).',
    tip: 'Public replies auto-change the ticket status to "Waiting on Customer".',
  },
  {
    icon: <Mail className="h-8 w-8 text-white" />,
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    title: 'Automated Emails',
    description:
      'Customers automatically receive emails when you reply, change the ticket status, or resolve their issue. No manual follow-up needed!',
    tip: 'Configure SMTP settings in your environment to enable email sending.',
  },
];

const STORAGE_KEY = 'resolv_welcome_seen_v2';

export default function WelcomeGuide({ role = 'CUSTOMER' }: { role?: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  const steps = role === 'CUSTOMER' ? CUSTOMER_STEPS : AGENT_STEPS;

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        // Small delay so the page loads first
        const t = setTimeout(() => setOpen(true), 800);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    setOpen(false);
  }

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Close button */}
            <div className="absolute top-4 right-4">
              <button
                onClick={dismiss}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close guide"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Icon */}
              <div className={`h-16 w-16 rounded-2xl ${current.iconBg} flex items-center justify-center mb-6 shadow-lg`}>
                {current.icon}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">{current.title}</h2>
                  <p className="text-slate-600 leading-relaxed text-[15px]">{current.description}</p>
                  {current.tip && (
                    <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2.5">
                      <span className="text-blue-500 flex-shrink-0 mt-0.5">💡</span>
                      <p className="text-blue-700 text-sm leading-relaxed">{current.tip}</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-8 pb-8">
              {/* Step dots */}
              <div className="flex items-center justify-center gap-1.5 mb-6">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === step ? 'w-6 bg-blue-600' : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                    }`}
                    aria-label={`Go to step ${i + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3">
                {step > 0 && (
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                )}
                <button
                  onClick={step === 0 ? dismiss : isLast ? dismiss : () => setStep((s) => s + 1)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                    isLast
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {step === 0 ? (
                    <>Start Tour <ArrowRight className="h-4 w-4" /></>
                  ) : isLast ? (
                    <>Get Started <Check className="h-4 w-4" /></>
                  ) : (
                    <>Next <ChevronRight className="h-4 w-4" /></>
                  )}
                </button>
              </div>

              <button
                onClick={dismiss}
                className="w-full mt-3 text-xs text-slate-400 hover:text-slate-600 transition-colors py-1"
              >
                Skip guide
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
