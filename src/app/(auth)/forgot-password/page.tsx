import type { Metadata } from 'next';

import { KokyuAuthCard } from '@/design-system/components';
import {
  authText,
  AuthFormPanel,
  AuthLayout,
  AuthVisualPanel,
  ForgotPasswordFooter,
  ForgotPasswordForm,
} from '@/features/auth';

export const metadata: Metadata = {
  title: 'Recuperar senha',
};

const text = authText.forgotPassword;
const visual = authText.forgotPasswordVisual;

export interface ForgotPasswordPageProps {
  /** Storybook-only override for the visual panel's entrance animation — see `AuthVisualPanel`. */
  reducedMotion?: boolean;
}

/**
 * Same non-reversed `[visual][form]` split as `/login` — deliberately
 * *not* `reversed`, so recovery stays visually on the sign-in side of
 * the flow instead of reading like account creation.
 */
export default function ForgotPasswordPage({ reducedMotion }: ForgotPasswordPageProps = {}) {
  return (
    <AuthLayout
      visual={
        <AuthVisualPanel
          variant="forgotPassword"
          eyebrow={visual.eyebrow}
          headline={visual.headline}
          body={visual.body}
          reducedMotion={reducedMotion}
        />
      }
      form={
        <AuthFormPanel>
          <KokyuAuthCard
            title={text.title}
            description={text.description}
            footer={<ForgotPasswordFooter />}
          >
            <ForgotPasswordForm />
          </KokyuAuthCard>
        </AuthFormPanel>
      }
    />
  );
}
