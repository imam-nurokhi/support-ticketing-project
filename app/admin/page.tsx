import AdminDashboard from './AdminDashboard';
import { requireUser } from '@/lib/auth';

export default async function AdminPage() {
  const user = await requireUser(['ADMIN'], '/admin');
  return <AdminDashboard user={user} />;
}
