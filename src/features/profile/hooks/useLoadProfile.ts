'use client';

import { useEffect, useState } from 'react';

import { profileService } from '../services/profileService';
import type { UserProfile } from '../types/profile.types';

export type ProfileLoadStatus = 'loading' | 'ready' | 'error';

export interface UseLoadProfileResult {
  status: ProfileLoadStatus;
  profile: UserProfile | null;
}

/**
 * Owns fetching the profile once on mount — kept separate from
 * `useProfileForm` so `ProfilePage` (the loading boundary) and
 * `ProfileForm` (the interactive form) can each be exercised
 * independently, with `ProfileForm`'s stories/tests never needing an
 * async fetch at all.
 */
export function useLoadProfile(): UseLoadProfileResult {
  const [status, setStatus] = useState<ProfileLoadStatus>('loading');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    profileService
      .getProfile()
      .then((loaded) => {
        if (cancelled) return;
        setProfile(loaded);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { status, profile };
}
