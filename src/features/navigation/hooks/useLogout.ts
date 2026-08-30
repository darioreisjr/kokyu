'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { authService } from '@/features/auth';

/**
 * Shared by `Sidebar` and `NavigationDrawer`'s "Sair" item — calls
 * through the existing (mocked) `authService` contract rather than
 * inventing a separate logout path, then always lands on `/login`.
 */
export function useLogout() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    authService.signOut().finally(() => {
      router.push('/login');
    });
  };

  return { logout, isLoggingOut };
}
