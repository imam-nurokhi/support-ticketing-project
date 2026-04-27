'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  Users,
  ClipboardList,
  Globe,
  Megaphone,
  GraduationCap,
  MessageCircle,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Users,
  Globe,
  Megaphone,
  ClipboardList,
  GraduationCap,
  MessageCircle,
};

export interface FaqItem {
  q: string;
  a: string;
}

export interface CategoryItem {
  iconName: string;
  title: string;
  desc: string;
  href: string;
  bgClass: string;
  iconClass: string;
}

interface HelpContentProps {
  faqs: FaqItem[];
  categories: CategoryItem[];
}

export default function HelpContent({ faqs, categories }: HelpContentProps) {
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();

  const filteredFaqs = q
    ? faqs.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q))
    : faqs;

  const filteredCategories = q
    ? categories.filter(
        (c) => c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q),
      )
    : categories;

  return (
    <>
      {/* Search bar */}
      <section className="bg-gradient-to-br from-blue-600 via-violet-600 to-amber-400 text-white py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-violet-100 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/20">
            <Search className="h-3.5 w-3.5" />
            Support by Nexora
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            How can we help you?
          </h1>
          <p className="text-violet-200 text-base md:text-lg mb-10">
            Search our knowledge base or submit a support ticket
          </p>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for answers… (e.g., reset password, billing, API)"
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-slate-900 text-base md:text-lg focus:outline-none focus:ring-4 focus:ring-blue-400/50 shadow-2xl"
              aria-label="Search knowledge base"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Browse by Category</h2>
            <Link
              href="/help/tickets/new"
              className="text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors"
            >
              View all →
            </Link>
          </div>

          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filteredCategories.map((cat) => {
                const Icon = ICON_MAP[cat.iconName] ?? MessageCircle;
                return (
                  <Link
                    key={cat.title}
                    href={cat.href}
                    className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200 hover:border-violet-200 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                  >
                    <div
                      className={`h-10 w-10 rounded-xl ${cat.bgClass} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className={`h-5 w-5 ${cat.iconClass}`} />
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-1">{cat.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{cat.desc}</p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No categories match your search.</p>
          )}
        </div>

        {/* FAQ section */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
          {filteredFaqs.length > 0 ? (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => (
                <details
                  key={faq.q}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden group open:border-violet-200 transition-colors"
                >
                  <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-violet-50/40 transition-colors list-none select-none">
                    <span className="font-medium text-slate-800 pr-4 text-sm md:text-base">
                      {faq.q}
                    </span>
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-slate-100 group-open:bg-violet-100 flex items-center justify-center transition-colors">
                      <svg
                        className="h-3.5 w-3.5 text-slate-500 group-open:text-violet-600 group-open:rotate-180 transition-all duration-200"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="border-t border-slate-100 px-5 pb-5 pt-4">
                    <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No FAQs match your search.</p>
          )}
        </div>
      </div>
    </>
  );
}
