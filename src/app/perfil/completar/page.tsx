import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { KokyuAuthCard } from '@/design-system/components';
import { AuthFormPanel, AuthLayout, AuthVisualPanel } from '@/features/auth';
import { SessionCheckError } from '@/features/navigation';
import { onboardingText, OnboardingForm } from '@/features/onboarding';
import { sanitizeReturnTo } from '@/features/onboarding/utils/returnTo';
import { getCurrentUserServer } from '@/lib/api/server';

export const metadata: Metadata = {
  title: onboardingText.page.title,
};

const visual = onboardingText.visual;

/**
 * `/perfil/completar` — outside `/app` on purpose, so it never renders
 * `AuthenticatedShell` (no sidebar/nav for a visitor who can't use the
 * app yet). Reuses the auth screens' own visual shell (`AuthLayout` +
 * `AuthVisualPanel` + `AuthFormPanel` + `KokyuAuthCard`) exactly like
 * `/login`'s page composes them — Kokyu branding/background without
 * pulling in app navigation, and without this feature needing its own
 * copy of that chrome. `variant="createAccount"` (tanjiro/fuji, the
 * "first breath of a new account" family) reused as-is rather than
 * adding a dedicated onboarding variant to `AuthVisualPanel` — this
 * screen is thematically a continuation of that same moment.
 *
 * Server-side gate, authoritative: no session → `/login`; a session but
 * an already-complete profile → `/app` (nothing left to do here). A
 * backend *failure* (as opposed to a genuinely absent session) renders
 * `SessionCheckError` in place instead of redirecting — see
 * `app/app/layout.tsx`'s doc comment for why redirecting a backend
 * *error* to `/login` is the specific bug that caused a real
 * `ERR_TOO_MANY_REDIRECTS` incident: a signed-in visitor gets bounced
 * straight back off `/login` by `proxy.ts`.
 */
export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const result = await getCurrentUserServer();

  if (result.status === 'unauthenticated') {
    redirect('/login');
  }

  if (result.status === 'error') {
    return <SessionCheckError />;
  }

  if (result.currentUser.profileCompletion.completed) {
    redirect('/app');
  }

  // Re-validated here too, not just trusted from `app/app/layout.tsx`'s
  // own redirect — `returnTo` is an ordinary query param a visitor could
  // arrive here with directly, so it gets the same "only a real
  // `/app/**` path" treatment either way.
  const { returnTo: rawReturnTo } = await searchParams;
  const returnTo = sanitizeReturnTo(rawReturnTo);

  return (
    <AuthLayout
      visual={
        <AuthVisualPanel
          variant="createAccount"
          eyebrow={visual.eyebrow}
          headline={visual.headline}
          body={visual.body}
        />
      }
      form={
        <AuthFormPanel flexBasis="1 1 60%">
          <KokyuAuthCard
            title={onboardingText.page.title}
            description={onboardingText.page.description}
            maxWidth="640px"
          >
            <OnboardingForm currentUser={result.currentUser} returnTo={returnTo} />
          </KokyuAuthCard>
        </AuthFormPanel>
      }
    />
  );
}
