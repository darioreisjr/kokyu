'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { apiFetchClient, getCurrentUserClient } from '@/lib/api/client';
import type {
  CurrentUser,
  Profile,
  ProfileCompletePayload,
  ProfileCompletion,
  ProfileUpdatePayload,
} from '@/lib/api/types';

export interface CurrentUserContextValue {
  currentUser: CurrentUser | null;
  profile: Profile | null;
  profileCompletion: ProfileCompletion | null;
  /** `false` while `currentUser` is `null` — never inferred any other way, see the hard constraint in `docs/architecture.md`-adjacent spec: the frontend never decides completeness on its own. */
  isProfileComplete: boolean;
  isLoading: boolean;
  error: unknown;
  /** Re-fetches `/me` and replaces `currentUser` with the result (or `null` if the session turned out to be gone). */
  refreshCurrentUser: () => Promise<void>;
  /** `PATCH /profile` — updates context with the response, which is the new source of truth (never assumed from `payload`). */
  updateProfile: (payload: ProfileUpdatePayload) => Promise<CurrentUser>;
  /** `POST /profile/complete` — same contract as `updateProfile`. */
  completeProfile: (payload: ProfileCompletePayload) => Promise<CurrentUser>;
  /** Clears the in-memory user — call on sign-out so a stale identity never lingers into the next session. */
  clearCurrentUser: () => void;
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

export interface CurrentUserProviderProps {
  children: ReactNode;
  /**
   * Server-fetched user, resolved by `app/app/layout.tsx` (or
   * `/perfil/completar`'s layout) via `getCurrentUserServer()` before
   * this ever renders on the client — the reason there's no loading
   * flash on first paint. `null` is a legitimate value here (e.g. a
   * page that renders this provider without itself gating on auth);
   * it just means `refreshCurrentUser()` is needed before anything
   * reads `currentUser`.
   */
  initialCurrentUser: CurrentUser | null;
}

/**
 * The one source of truth for "who is signed in and is their profile
 * complete" on the client — Header, Sidebar, Home and every other
 * consumer read from `useCurrentUser()` instead of each independently
 * calling `/me`. This is a UI/sharing convenience only: it is *not* the
 * security boundary. The actual gate is the server-side redirect in
 * `app/app/layout.tsx` / `app/perfil/completar/page.tsx` — nothing here
 * ever blocks rendering on its own.
 */
export function CurrentUserProvider({ children, initialCurrentUser }: CurrentUserProviderProps) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(initialCurrentUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const refreshCurrentUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getCurrentUserClient();
      if (result.status === 'authenticated') {
        setCurrentUser(result.currentUser);
      } else if (result.status === 'unauthenticated') {
        setCurrentUser(null);
      } else {
        setError(result.error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (payload: ProfileUpdatePayload) => {
    const updated = await apiFetchClient<CurrentUser>('/profile', {
      method: 'PATCH',
      body: payload,
    });
    setCurrentUser(updated);
    return updated;
  }, []);

  const completeProfile = useCallback(async (payload: ProfileCompletePayload) => {
    const updated = await apiFetchClient<CurrentUser>('/profile/complete', {
      method: 'POST',
      body: payload,
      // Called from `/perfil/completar` itself — never redirect back to
      // the page currently completing the profile.
      suppressProfileSetupRedirect: true,
    });
    setCurrentUser(updated);
    return updated;
  }, []);

  const clearCurrentUser = useCallback(() => {
    setCurrentUser(null);
    setError(null);
  }, []);

  const value = useMemo<CurrentUserContextValue>(
    () => ({
      currentUser,
      profile: currentUser?.profile ?? null,
      profileCompletion: currentUser?.profileCompletion ?? null,
      isProfileComplete: currentUser?.profileCompletion.completed ?? false,
      isLoading,
      error,
      refreshCurrentUser,
      updateProfile,
      completeProfile,
      clearCurrentUser,
    }),
    [currentUser, isLoading, error, refreshCurrentUser, updateProfile, completeProfile, clearCurrentUser],
  );

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser(): CurrentUserContextValue {
  const context = useContext(CurrentUserContext);
  if (!context) {
    throw new Error('useCurrentUser must be used within a CurrentUserProvider');
  }
  return context;
}
