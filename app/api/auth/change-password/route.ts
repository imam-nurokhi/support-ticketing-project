import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/password';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { currentPassword, newPassword } = (body ?? {}) as Record<string, unknown>;

  if (typeof currentPassword !== 'string' || !currentPassword) {
    return NextResponse.json({ error: 'Current password is required.' }, { status: 400 });
  }
  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
  }

  const dbUser = await db.user.findUnique({ where: { id: user.id } });
  if (!dbUser?.passwordHash) {
    return NextResponse.json({ error: 'Cannot change password for this account.' }, { status: 400 });
  }

  const valid = await verifyPassword(currentPassword, dbUser.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  return NextResponse.json({ message: 'Password updated successfully.' });
}
