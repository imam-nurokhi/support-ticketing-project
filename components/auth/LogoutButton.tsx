'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
  className?: string;
  label?: string;
}

export function LogoutButton({ className, label = 'Sign out' }: LogoutButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);

    const response = await fetch('/api/auth/logout', {
      method: 'POST',
    });

    setPending(false);

    if (!response.ok) {
      return;
    }

    router.push('/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className={className}
    >
      {pending ? 'Signing out...' : label}
    </button>
  );
}
