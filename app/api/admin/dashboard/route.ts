import { getCurrentUser } from '@/lib/auth';
import { getAdminDashboardData } from '@/lib/tickets';

export async function GET() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    return Response.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const dashboard = await getAdminDashboardData();

  return Response.json({
    currentUser: user,
    ...dashboard,
  });
}
