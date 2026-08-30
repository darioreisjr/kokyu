import type { Metadata } from 'next';

import { KokyuAuthCard } from '@/design-system/components';
import {
  authText,
  AuthFormPanel,
  AuthLayout,
  AuthVisualPanel,
  LoginFooter,
  LoginForm,
} from '@/features/auth';

export const metadata: Metadata = {
  title: 'Entrar',
};

const text = authText.login;
const visual = authText.loginVisual;

export default function LoginPage() {
  return (
    <AuthLayout
      visual={
        <AuthVisualPanel
          variant="login"
          eyebrow={visual.eyebrow}
          headline={visual.headline}
          body={visual.body}
        />
      }
      form={
        <AuthFormPanel>
          <KokyuAuthCard title={text.title} description={text.description} footer={<LoginFooter />}>
            <LoginForm />
          </KokyuAuthCard>
        </AuthFormPanel>
      }
    />
  );
}
