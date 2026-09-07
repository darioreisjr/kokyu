import { apiFetchClient } from '@/lib/api/client';
import type { CurrentUser, ProfileCompletePayload } from '@/lib/api/types';

export interface OnboardingService {
  completeOnboarding: (payload: ProfileCompletePayload) => Promise<CurrentUser>;
}

/**
 * `POST /profile/complete` — the one mutation this feature performs.
 * Exposed as an object (not a bare function export) so tests/Storybook
 * can swap `onboardingService.completeOnboarding` at the property level
 * — the same technique `profileService`/`createAccountService` already
 * use throughout this codebase (e.g. `ProfilePage.stories.tsx`'s
 * `Loading` story reassigning `profileService.getProfile`), which a
 * plain function export can't support (rebinding a module's own export
 * isn't the same as reassigning an object's property).
 *
 * `suppressProfileSetupRedirect: true` because this call happens *from*
 * `/perfil/completar` itself: a `PROFILE_SETUP_REQUIRED` response here
 * (shouldn't happen — completing the profile is the fix for it) must
 * never trigger `apiFetchClient`'s default redirect-to-self behavior.
 *
 * Returns the fresh `CurrentUser` the backend computed — the frontend
 * never assumes `profileCompletion.completed` from having just
 * submitted the form; it only trusts what this response says (per the
 * hard "frontend never decides completeness" constraint).
 */
export const onboardingService: OnboardingService = {
  async completeOnboarding(payload: ProfileCompletePayload): Promise<CurrentUser> {
    return apiFetchClient<CurrentUser>('/profile/complete', {
      method: 'POST',
      body: payload,
      suppressProfileSetupRedirect: true,
    });
  },
};
