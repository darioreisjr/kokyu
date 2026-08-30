import type { Metadata } from 'next';

import { KokyuAuthCard } from '@/design-system/components';
import { container } from '@/design-system/tokens/primitives/containers';
import {
  authText,
  AuthFormPanel,
  AuthLayout,
  AuthVisualPanel,
  CreateAccountFooter,
  CreateAccountForm,
} from '@/features/auth';

export const metadata: Metadata = {
  title: 'Criar conta',
};

const text = authText.createAccount;
const visual = authText.createAccountVisual;

export default function CreateAccountPage() {
  return (
    <AuthLayout
      reversed
      visual={
        <AuthVisualPanel
          variant="createAccount"
          eyebrow={visual.eyebrow}
          headline={visual.headline}
          body={visual.body}
          flexBasis="1 1 52%"
        />
      }
      form={
        <AuthFormPanel flexBasis="1 1 48%">
          <KokyuAuthCard
            title={text.title}
            description={text.description}
            footer={<CreateAccountFooter />}
            maxWidth={container.sm}
          >
            <CreateAccountForm />
          </KokyuAuthCard>
        </AuthFormPanel>
      }
    />
  );
}
