'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { authService } from '@/features/auth';
import { useCurrentUser } from '@/features/current-user';

/**
 * Shared by `Sidebar` and `NavigationDrawer`'s "Sair" item — calls
 * through the `authService` contract, clears the in-memory
 * `CurrentUserContext` so a stale identity can never linger into the
 * next session (e.g. someone else signing in on the same device), then
 * always lands on `/login`.
 */
export function useLogout() {
  const router = useRouter();
  const { clearCurrentUser } = useCurrentUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    authService.signOut().finally(() => {
      clearCurrentUser();
      router.push('/login');
    });
  };

  return { logout, isLoggingOut };
}
