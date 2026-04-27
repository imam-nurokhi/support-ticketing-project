import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';
import { getCurrentUser, getDefaultRouteForRole } from '@/lib/auth';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();

  if (user) {
    redirect(params.next || getDefaultRouteForRole(user.role));
  }

  return <LoginForm nextPath={params.next} />;
}
