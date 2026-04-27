import { requireUser } from '@/lib/auth';
import {
  Mail,
  ShieldCheck,
  UserCircle2,
} from 'lucide-react';
import AgentSidebarLayout from '@/components/agent/AgentSidebarLayout';
import SettingsForm from './SettingsForm';

export default async function AgentSettingsPage() {
  const user = await requireUser(['SUPPORT_AGENT', 'ADMIN']);

  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleLabel =
    user.role === 'ADMIN'
      ? 'Administrator'
      : user.role === 'SUPPORT_AGENT'
      ? 'Support Agent'
      : 'Customer';

  return (
    <AgentSidebarLayout
      user={user}
      title="Settings"
      subtitle="Manage your profile and account"
    >
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl space-y-6">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <UserCircle2 className="h-5 w-5 text-blue-600" />
            Profile Information
          </h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {initials}
            </div>
            <div>
              <div className="text-slate-900 font-semibold text-lg">{user.name}</div>
              <div className="text-slate-500 text-sm">{roleLabel}</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <UserCircle2 className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wide font-medium">Name</div>
                <div className="text-sm text-slate-900 font-medium">{user.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wide font-medium">Email</div>
                <div className="text-sm text-slate-900 font-medium">{user.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <ShieldCheck className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wide font-medium">Role</div>
                <div className="text-sm text-slate-900 font-medium">{roleLabel}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Change password card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            Change Password
          </h2>
          <SettingsForm />
        </div>
      </div>
    </AgentSidebarLayout>
  );
}
