import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'node:crypto';
import { db } from '@/lib/db';

const TOKEN_DURATION_MS = 1000 * 60 * 60; // 1 hour

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

  const { email } = (body ?? {}) as Record<string, unknown>;

  if (typeof email !== 'string' || !email.trim()) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  // Always return success to prevent email enumeration
  if (!user) {
    return NextResponse.json({ message: 'If this email is registered, a reset link will appear below.' });
  }

  // Invalidate previous tokens for this user
  await db.passwordResetToken.deleteMany({
    where: { userId: user.id, usedAt: null },
  });

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + TOKEN_DURATION_MS);

  await db.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt,
    },
  });

  // In production this would be emailed. For demo, return the reset link directly.
  const resetUrl = `/reset-password?token=${token}`;

  return NextResponse.json({
    message: 'Reset link generated successfully.',
    resetUrl,
    expiresAt: expiresAt.toISOString(),
    // Only expose in non-production for demo purposes
    ...(process.env.NODE_ENV !== 'production' ? { token } : {}),
  });
}
