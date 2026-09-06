import type { Metadata } from 'next';

import { KokyuAuthCard } from '@/design-system/components';
import { authText, AuthFormPanel, AuthLayout, AuthVisualPanel, ResetPasswordForm } from '@/features/auth';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Redefinir senha',
};

const text = authText.resetPassword;
const visual = authText.forgotPasswordVisual;

/**
 * Landing target after `/auth/callback` exchanges a password-recovery
 * link for a session. Whether that session actually exists is checked
 * here (Server Component, one `getUser()` call) and handed down as a
 * single boolean — `ResetPasswordForm` doesn't re-derive it, so there's
 * one source of truth for "is this link still valid" per request.
 */
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AuthLayout
      visual={
        <AuthVisualPanel
          variant="forgotPassword"
          eyebrow={visual.eyebrow}
          headline={visual.headline}
          body={visual.body}
        />
      }
      form={
        <AuthFormPanel>
          <KokyuAuthCard title={text.title} description={text.description}>
            <ResetPasswordForm hasValidSession={Boolean(user)} />
          </KokyuAuthCard>
        </AuthFormPanel>
      }
    />
  );
}
