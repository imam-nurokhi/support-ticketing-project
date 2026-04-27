'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Headphones,
  Zap,
  Shield,
  BarChart3,
  MessageSquare,
  Clock,
  Menu,
  X,
} from 'lucide-react';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      desc: 'Automated routing and smart assignment gets tickets to the right agent instantly.',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      hoverBorder: 'hover:border-amber-200',
      hoverBg: 'hover:bg-amber-50/40',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      desc: 'Role-based access control with full audit trails for every ticket action.',
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      hoverBorder: 'hover:border-violet-200',
      hoverBg: 'hover:bg-violet-50/40',
    },
    {
      icon: BarChart3,
      title: 'Deep Analytics',
      desc: 'Real-time dashboards and SLA tracking to keep your team performing at its best.',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      hoverBorder: 'hover:border-emerald-200',
      hoverBg: 'hover:bg-emerald-50/40',
    },
    {
      icon: MessageSquare,
      title: 'Unified Inbox',
      desc: 'All customer conversations in one place — email, chat, and portal combined.',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      hoverBorder: 'hover:border-purple-200',
      hoverBg: 'hover:bg-purple-50/40',
    },
    {
      icon: Clock,
      title: 'SLA Management',
      desc: 'Automatic SLA timers with color-coded urgency alerts for your entire team.',
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-500',
      hoverBorder: 'hover:border-rose-200',
      hoverBg: 'hover:bg-rose-50/40',
    },
    {
      icon: Headphones,
      title: 'Omnichannel',
      desc: 'Customers can reach you through any channel. One unified inbox for everything.',
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      hoverBorder: 'hover:border-indigo-200',
      hoverBg: 'hover:bg-indigo-50/40',
    },
  ];

  const stats = [
    { value: '< 2h', label: 'Avg. Response Time' },
    { value: '98%', label: 'Customer Satisfaction' },
    { value: '24/7', label: 'Support Coverage' },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ── Sticky Navigation ── */}
      <nav className="sticky top-0 z-50 border-b border-violet-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
            <div className="flex items-center">
              <Image src="/nexora-logo.png" alt="Nexora" width={120} height={36} className="object-contain" />
            </div>

            {/* Desktop nav links */}
            <div className="hidden items-center gap-1 md:flex">
              <Link
                href="/help"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-violet-50 hover:text-violet-700"
              >
                Help Center
              </Link>
              <Link
                href="/agent"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-violet-50 hover:text-violet-700"
              >
                Agent Portal
              </Link>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-violet-50 hover:text-violet-700"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-violet-50 hover:text-violet-700"
              >
                Sign Up
              </Link>
              <Link
                href="/help/tickets/new"
                className="ml-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Submit Ticket
              </Link>
            </div>

            {/* Mobile hamburger button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-violet-50 hover:text-violet-700 md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="border-t border-violet-100 bg-white px-4 pb-4 pt-2 md:hidden">
            <div className="flex flex-col gap-1">
              <Link
                href="/help"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700"
              >
                Help Center
              </Link>
              <Link
                href="/agent"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700"
              >
                Agent Portal
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700"
              >
                Sign Up
              </Link>
              <Link
                href="/help/tickets/new"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-1 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Submit Ticket
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-violet-600 to-amber-400 pb-0 pt-20">

        {/* Decorative background blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-white/5 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-4 text-center sm:px-6 lg:px-8">

          {/* Animated badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-800/40 px-4 py-1.5 text-sm font-medium text-violet-100 backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
            Enterprise Support Platform
          </div>

          {/* Main headline */}
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Support that scales
            <br />
            <span className="text-violet-200">with your business</span>
          </h1>

          {/* Subtext */}
          <p className="mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-violet-100">
            Support helps Nexora&apos;s team deliver exceptional customer experiences.
            Track, manage, and resolve tickets with blazing speed and full visibility.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/help/tickets/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg shadow-blue-900/30 hover:bg-blue-50"
            >
              Submit a Ticket <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/help"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white hover:border-white/60 hover:bg-white/10"
            >
              Browse Help Center
            </Link>
          </div>

          {/* Stats row — translucent violet-800/40 cards */}
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-violet-400/20 bg-violet-800/40 px-6 py-5 backdrop-blur-sm"
              >
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="mt-1 text-sm text-violet-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-1 text-sm font-medium text-violet-700">
              Built for modern teams
            </div>
            <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
              Everything your team needs
            </h2>
            <p className="mx-auto max-w-2xl text-slate-600">
              A complete support operations platform — from lightning-fast routing
              to deep analytics and omnichannel coverage.
            </p>
          </div>

          {/* Feature cards grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`group rounded-2xl border border-slate-100 bg-slate-50 p-6 ${feature.hoverBorder} ${feature.hoverBg} hover:shadow-sm`}
              >
                <div
                  className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${feature.iconBg}`}
                >
                  <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-violet-600 to-amber-400 py-24">

        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-16 left-16 h-56 w-56 rounded-full bg-purple-400/20 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mb-10 text-lg text-violet-100">
            Join thousands of companies delivering great support with Nexora&apos;s Support platform.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/help/tickets/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg shadow-blue-900/30 hover:bg-blue-50"
            >
              Submit a Ticket <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/agent"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/40 px-8 py-4 text-lg font-semibold text-white hover:border-white/70 hover:bg-white/10"
            >
              Agent Portal
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">

            {/* Brand mark */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-500">
                <Headphones className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-white">Support</span>
              <span className="text-sm text-slate-500">by Nexora</span>
            </div>

            {/* Tagline */}
            <p className="text-sm text-slate-500">Support by Nexora</p>

            {/* Copyright */}
            <p className="text-sm text-slate-500">
              © 2025 Nexora Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
