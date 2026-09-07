'use client';

import { useEffect, useState } from 'react';

import { useCurrentUser } from '@/features/current-user';

import { mapCurrentUserToProfile, profileService } from '../services/profileService';
import type { UserProfile } from '../types/profile.types';

export type ProfileLoadStatus = 'loading' | 'ready' | 'error';

export interface UseLoadProfileResult {
  status: ProfileLoadStatus;
  profile: UserProfile | null;
}

/**
 * Owns getting a `UserProfile` onto the page. Prefers
 * `CurrentUserContext` (already populated server-side by `app/app/
 * layout.tsx`, with zero extra fetch/flash — see the "no duplicate
 * fetch storms" constraint this exists to satisfy) and only falls back
 * to `profileService.getProfile()` — a real `/me` call — in the
 * unexpected case where the context hasn't got a user yet (e.g. this
 * component rendered outside `CurrentUserProvider`, as it still does in
 * Storybook/tests without a wrapping provider).
 *
 * The context branch is derived directly at render time — no effect,
 * no `setState` — precisely so it never needs one; the fallback fetch
 * is the only path that owns any state, and only ever calls `setState`
 * from inside the async callback, never synchronously in the effect
 * body (same rule `PreferencesProvider`/`useUsernameAvailability`
 * already follow elsewhere in this codebase).
 */
export function useLoadProfile(): UseLoadProfileResult {
  const { currentUser } = useCurrentUser();
  const [fetchStatus, setFetchStatus] = useState<ProfileLoadStatus>('loading');
  const [fetchedProfile, setFetchedProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (currentUser) return;

    let cancelled = false;
    profileService
      .getProfile()
      .then((loaded) => {
        if (cancelled) return;
        setFetchedProfile(loaded);
        setFetchStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setFetchStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  if (currentUser) {
    return { status: 'ready', profile: mapCurrentUserToProfile(currentUser) };
  }
  return { status: fetchStatus, profile: fetchedProfile };
}
