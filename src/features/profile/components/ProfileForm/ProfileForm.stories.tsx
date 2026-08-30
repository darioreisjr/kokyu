import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { profileService } from '../../services/profileService';
import type { UserProfile } from '../../types/profile.types';
import { ProfileForm } from './ProfileForm';

const sampleProfile: UserProfile = {
  id: 'mock-user',
  firstName: 'Dario',
  lastName: 'Reis',
  username: 'darioreis',
  bio: 'Organizando cada parte da minha rotina.',
  birthDate: new Date(2000, 7, 28),
  country: 'BR',
  region: 'SP',
  city: 'São Paulo',
  avatarUrl: null,
  email: 'dario@email.com',
};

// Captured once so every story resets the real mock before applying
// its own override — see `ForgotPasswordForm.stories.tsx` for the
// same technique and the reasoning (stories share this singleton).
const original = {
  updateProfile: profileService.updateProfile,
};

const meta = {
  title: 'Kokyu Components/ProfileForm',
  component: ProfileForm,
  tags: ['autodocs'],
  args: { profile: sampleProfile },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => {
      profileService.updateProfile = original.updateProfile;
      return Story();
    },
  ],
} satisfies Meta<typeof ProfileForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ValidationErrors: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.clear(canvas.getByLabelText('Nome', { exact: true }));
    await userEvent.tab();
  },
};

export const Dirty: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('Nome', { exact: true }), ' Editado');
  },
};

export const Saving: Story = {
  play: async ({ canvas, userEvent }) => {
    // Never resolves — freezes the form in its saving state for this story.
    profileService.updateProfile = () => new Promise(() => {});
    await userEvent.type(canvas.getByLabelText('Nome', { exact: true }), ' Editado');
    await userEvent.click(canvas.getByRole('button', { name: 'Salvar alterações' }));
  },
};
