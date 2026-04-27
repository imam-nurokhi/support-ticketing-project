import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { User } from '@prisma/client';
import { db } from '@/lib/db';
import type { SessionUser, UserRole } from '@/lib/types';

export const SESSION_COOKIE_NAME = 'nexora_session';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

function mapUser(user: User): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    avatarUrl: user.avatarUrl,
  };
}

export function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function getDefaultRouteForRole(role: UserRole) {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'SUPPORT_AGENT':
      return '/agent';
    default:
      return '/help';
  }
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.session.create({
    data: {
      userId,
      tokenHash: hashSessionToken(token),
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
  });
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await db.session.deleteMany({
      where: { tokenHash: hashSessionToken(token) },
    });
  }

  await clearSessionCookie();
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await db.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await db.session.delete({ where: { id: session.id } });
    await clearSessionCookie();
    return null;
  }

  return {
    id: session.id,
    user: mapUser(session.user),
    expiresAt: session.expiresAt,
  };
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

export async function requireUser(roles?: UserRole[], nextPath?: string) {
  const user = await getCurrentUser();

  if (!user) {
    const target = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : '/login';
    redirect(target);
  }

  if (roles && !roles.includes(user.role)) {
    redirect(getDefaultRouteForRole(user.role));
  }

  return user;
}

export function hasRole(user: SessionUser, roles: UserRole[]) {
  return roles.includes(user.role);
}
