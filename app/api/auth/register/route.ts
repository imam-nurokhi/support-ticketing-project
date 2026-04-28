import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { createSession, setSessionCookie } from '@/lib/auth';
import { buildSupportSignupAlertEmail, buildWelcomeEmail } from '@/lib/email-templates';
import { getAppBaseUrl, getSupportNotificationEmail, isMailConfigured, sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { name, email, password } = (body ?? {}) as Record<string, unknown>;

  if (typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: 'Name must be at least 2 characters.' }, { status: 400 });
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }
  if (typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
  }

  const user = await db.user.create({
    data: {
      email: email.toLowerCase().trim(),
      name: name.trim(),
      role: 'CUSTOMER',
      passwordHash: await hashPassword(password),
    },
  });

  const { token, expiresAt } = await createSession(user.id);
  await setSessionCookie(token, expiresAt);

  let warning: string | undefined;
  if (isMailConfigured()) {
    const loginUrl = `${getAppBaseUrl()}/login`;
    try {
      const welcomeEmail = buildWelcomeEmail({ name: user.name, loginUrl });
      const supportEmail = buildSupportSignupAlertEmail({
        name: user.name,
        email: user.email,
        loginUrl,
      });

      await Promise.all([
        sendEmail({
          to: user.email,
          subject: welcomeEmail.subject,
          html: welcomeEmail.html,
          text: welcomeEmail.text,
        }),
        sendEmail({
          to: getSupportNotificationEmail(),
          subject: supportEmail.subject,
          html: supportEmail.html,
          text: supportEmail.text,
        }),
      ]);
    } catch (error) {
      console.error('Failed to send registration emails', error);
      warning = 'Account created, but email notification could not be delivered.';
    }
  }

  return NextResponse.json({ redirectTo: '/help', warning }, { status: 201 });
}
