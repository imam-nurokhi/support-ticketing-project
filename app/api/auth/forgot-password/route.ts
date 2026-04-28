import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'node:crypto';
import { db } from '@/lib/db';
import { buildPasswordResetEmail } from '@/lib/email-templates';
import { getAppBaseUrl, isMailConfigured, sendEmail } from '@/lib/email';

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
    return NextResponse.json({ message: 'If this email is registered, a reset link has been sent.' });
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

  const resetUrl = `${getAppBaseUrl()}/reset-password?token=${token}`;
  const expiresLabel = expiresAt.toLocaleString('en-US', { timeZone: 'UTC', hour12: false }) + ' UTC';

  if (isMailConfigured()) {
    try {
      const email = buildPasswordResetEmail({
        name: user.name,
        resetUrl,
        expiresAt: expiresLabel,
      });

      await sendEmail({
        to: user.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });

      return NextResponse.json({
        message: 'If this email is registered, a reset link has been sent.',
        expiresAt: expiresAt.toISOString(),
      });
    } catch (error) {
      console.error('Failed to send password reset email', error);
      return NextResponse.json({
        message: 'Reset link generated, but email delivery failed.',
        expiresAt: expiresAt.toISOString(),
        deliveryFailed: true,
      });
    }
  }

  return NextResponse.json({
    message: 'Reset link generated successfully.',
    resetUrl,
    expiresAt: expiresAt.toISOString(),
    // Only expose in non-production for demo purposes
    ...(process.env.NODE_ENV !== 'production' ? { token } : {}),
  });
}
