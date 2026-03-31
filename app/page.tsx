import Link from 'next/link';
import { ArrowRight, Headphones, Zap, Shield, BarChart3, MessageSquare, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Headphones className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800">Resolv</span>
            <span className="text-slate-400 text-sm ml-1">by Nexora</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/help" className="text-slate-600 hover:text-slate-900 text-sm font-medium">Help Center</Link>
            <Link href="/agent" className="text-slate-600 hover:text-slate-900 text-sm font-medium">Agent Portal</Link>
            <Link href="/help/tickets/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Submit Ticket
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-slate-50 pt-20 pb-32">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>
            Enterprise Support Platform
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 tracking-tight">
            Support that scales
            <br />
            <span className="text-blue-600">with your business</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Resolv helps Nexora&apos;s support team deliver exceptional customer experiences. 
            Track, manage, and resolve tickets with blazing speed and full visibility.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/help/tickets/new" className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              Submit a Ticket <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/help" className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm">
              Browse Help Center
            </Link>
          </div>
          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { value: '< 2h', label: 'Avg. Response Time' },
              { value: '98%', label: 'Customer Satisfaction' },
              { value: '24/7', label: 'Support Coverage' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything your team needs</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">A complete support operations platform built for modern teams.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'Lightning Fast', desc: 'Automated routing and smart assignment gets tickets to the right agent instantly.', color: 'text-amber-500' },
              { icon: Shield, title: 'Enterprise Security', desc: 'Role-based access control with full audit trails for every ticket action.', color: 'text-blue-500' },
              { icon: BarChart3, title: 'Deep Analytics', desc: 'Real-time dashboards and SLA tracking to keep your team performing.', color: 'text-green-500' },
              { icon: MessageSquare, title: 'Unified Inbox', desc: 'All customer conversations in one place — email, chat, and portal.', color: 'text-purple-500' },
              { icon: Clock, title: 'SLA Management', desc: 'Automatic SLA timers with color-coded urgency alerts for your team.', color: 'text-red-500' },
              { icon: Headphones, title: 'Omnichannel', desc: 'Customers can reach you through any channel. One inbox for everything.', color: 'text-indigo-500' },
            ].map((feature) => (
              <div key={feature.title} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-colors">
                <div className={`h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 border border-slate-100`}>
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-blue-100 text-lg mb-8">Join thousands of companies delivering great support with Resolv.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/help/tickets/new" className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-colors">
              Submit a Ticket <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/agent" className="inline-flex items-center justify-center gap-2 border-2 border-blue-400 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors">
              Agent Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-blue-500 rounded flex items-center justify-center">
              <Headphones className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-semibold">Resolv</span>
            <span className="text-slate-500 text-sm">by Nexora</span>
          </div>
          <p className="text-sm">© 2024 Nexora Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
