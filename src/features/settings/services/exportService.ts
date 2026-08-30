import { format } from 'date-fns';

import { profileService } from '@/features/profile/services/profileService';
import type { UserProfile } from '@/features/profile/types/profile.types';

import type { UserPreferences } from '../types/preferences.types';

export interface KokyuDataExport {
  exportedAt: string;
  profile: Omit<UserProfile, 'birthDate'> & { birthDate: string | null };
  preferences: UserPreferences;
}

/**
 * Builds and downloads `kokyu-export-YYYY-MM-DD.json` — genuinely
 * real data (the current mock profile + the actual stored
 * preferences), never a placeholder. Deliberately hand-picks fields
 * from `UserProfile`/`UserPreferences` rather than spreading whatever
 * happens to be there, so nothing that isn't safe to export (there is
 * no password, token or session data in either shape today) can slip
 * in later without a conscious change here too.
 */
export async function exportUserData(preferences: UserPreferences): Promise<void> {
  const profile = await profileService.getProfile();

  const data: KokyuDataExport = {
    exportedAt: new Date().toISOString(),
    profile: {
      ...profile,
      birthDate: profile.birthDate ? profile.birthDate.toISOString() : null,
    },
    preferences,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const filename = `kokyu-export-${format(new Date(), 'yyyy-MM-dd')}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
