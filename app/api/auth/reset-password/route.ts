import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { createSession, setSessionCookie } from '@/lib/auth';

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { token, password } = (body ?? {}) as Record<string, unknown>;

  if (typeof token !== 'string' || !token.trim()) {
    return NextResponse.json({ error: 'Reset token is required.' }, { status: 400 });
  }
  if (typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  const resetToken = await db.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!resetToken) {
    return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 });
  }

  if (resetToken.usedAt) {
    return NextResponse.json({ error: 'This reset link has already been used.' }, { status: 400 });
  }

  if (resetToken.expiresAt <= new Date()) {
    return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 });
  }

  const newHash = await hashPassword(password);

  await db.$transaction([
    db.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: newHash },
    }),
    db.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    // Invalidate all sessions for security
    db.session.deleteMany({
      where: { userId: resetToken.userId },
    }),
  ]);

  // Auto-login after reset
  const { token: sessionToken, expiresAt } = await createSession(resetToken.userId);
  await setSessionCookie(sessionToken, expiresAt);

  const role = resetToken.user.role;
  const redirectTo = role === 'ADMIN' ? '/admin' : role === 'SUPPORT_AGENT' ? '/agent' : '/help';

  return NextResponse.json({ message: 'Password updated successfully.', redirectTo });
}
