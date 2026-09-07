import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { createAccountService } from '@/features/auth';
import type { CurrentUser } from '@/lib/api/types';

import { onboardingService } from '../../services/onboardingService';
import { OnboardingForm } from './OnboardingForm';

// Captured once so every story resets the real mocks before applying
// its own override — same technique as `ForgotPasswordForm.stories.tsx`
// and `ProfilePage.stories.tsx`.
const original = {
  checkUsernameAvailability: createAccountService.checkUsernameAvailability,
  completeOnboarding: onboardingService.completeOnboarding,
};

const emailSignupUser: CurrentUser = {
  id: 'user-1',
  email: 'dario@email.com',
  emailVerified: false,
  providers: ['email'],
  profile: {
    firstName: 'Dario',
    lastName: null,
    username: null,
    birthDate: null,
    bio: null,
    avatarUrl: null,
    countryCode: null,
    region: null,
    city: null,
  },
  profileCompletion: {
    completed: false,
    completedAt: null,
    version: 1,
    missingFields: ['lastName', 'username', 'birthDate'],
  },
  access: { canUseApplication: false, redirectTo: '/perfil/completar' },
};

const googleSignupUser: CurrentUser = {
  ...emailSignupUser,
  emailVerified: true,
  providers: ['google'],
  profile: {
    ...emailSignupUser.profile,
    firstName: 'Dario',
    lastName: 'Reis',
    avatarUrl: 'https://lh3.googleusercontent.com/a/mock-avatar',
  },
  profileCompletion: {
    ...emailSignupUser.profileCompletion,
    missingFields: ['username', 'birthDate'],
  },
};

const meta = {
  title: 'Kokyu Components/OnboardingForm',
  component: OnboardingForm,
  tags: ['autodocs'],
  args: { currentUser: emailSignupUser },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => {
      createAccountService.checkUsernameAvailability = original.checkUsernameAvailability;
      onboardingService.completeOnboarding = original.completeOnboarding;
      return Story();
    },
  ],
} satisfies Meta<typeof OnboardingForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PrefilledEmail: Story = {
  args: { currentUser: emailSignupUser },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('Sobrenome'), 'Reis');
    await userEvent.type(canvas.getByLabelText('Username'), 'darioreis');
  },
};

export const PrefilledGoogle: Story = {
  args: { currentUser: googleSignupUser },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('Username'), 'darioreis');
  },
};

export const UsernameUnavailable: Story = {
  decorators: [
    (Story) => {
      createAccountService.checkUsernameAvailability = async () => ({
        available: false,
        reason: 'taken',
      });
      return Story();
    },
  ],
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('Username'), 'admin');
    await canvas.findByText('Este username já está em uso', {}, { timeout: 2000 });
  },
};

export const Under18: Story = {
  play: async ({ canvas, userEvent }) => {
    const group = canvas.getByRole('group', { name: 'Data de nascimento' });
    const day = group.querySelector('[aria-label="Day"]') as HTMLElement;
    const seventeenYearsAgo = new Date();
    seventeenYearsAgo.setFullYear(seventeenYearsAgo.getFullYear() - 17);
    const value = `${String(seventeenYearsAgo.getDate()).padStart(2, '0')}${String(seventeenYearsAgo.getMonth() + 1).padStart(2, '0')}${seventeenYearsAgo.getFullYear()}`;
    await userEvent.click(day);
    await userEvent.type(day, value);
    await userEvent.tab();
    await canvas.findByText('Você precisa ter pelo menos 18 anos.');
  },
};

export const ValidationErrors: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('Username'), 'a');
    await userEvent.tab();
    await canvas.findByText('O username deve ter entre 3 e 30 caracteres');
  },
};

export const Submitting: Story = {
  decorators: [
    (Story) => {
      // Never resolves — freezes the form in its submitting state for this story.
      onboardingService.completeOnboarding = () => new Promise(() => {});
      return Story();
    },
  ],
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('Sobrenome'), 'Reis');
    await userEvent.type(canvas.getByLabelText('Username'), 'darioreis');
    const group = canvas.getByRole('group', { name: 'Data de nascimento' });
    const day = group.querySelector('[aria-label="Day"]') as HTMLElement;
    await userEvent.click(day);
    await userEvent.type(day, '28081998');
    await canvas.findByRole('button', { name: 'Continuar' });
  },
};
