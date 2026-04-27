import { z } from 'zod';
import { createSession, getDefaultRouteForRole, setSessionCookie } from '@/lib/auth';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import type { UserRole } from '@/lib/types';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  next: z.string().optional(),
});

export async function POST(request: Request) {
  const payload = loginSchema.safeParse(await request.json());

  if (!payload.success) {
    return Response.json({ error: 'Invalid login payload.' }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { email: payload.data.email.toLowerCase() },
  });

  if (!user?.passwordHash) {
    return Response.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const isValidPassword = await verifyPassword(payload.data.password, user.passwordHash);

  if (!isValidPassword) {
    return Response.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const { token, expiresAt } = await createSession(user.id);
  await setSessionCookie(token, expiresAt);

  return Response.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    redirectTo: payload.data.next || getDefaultRouteForRole(user.role as UserRole),
  });
}
