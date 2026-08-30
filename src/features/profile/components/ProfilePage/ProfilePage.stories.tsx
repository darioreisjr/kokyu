import { createAccountService } from '@/features/auth';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { profileService } from '../../services/profileService';
import { ProfilePage } from './ProfilePage';

// Captured once so every story resets the real mocks before applying
// its own override — same technique as `ForgotPasswordForm.stories.tsx`.
const original = {
  getProfile: profileService.getProfile,
  updateProfile: profileService.updateProfile,
  checkUsernameAvailability: createAccountService.checkUsernameAvailability,
};

const meta = {
  title: 'Kokyu Pages/ProfilePage',
  component: ProfilePage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => {
      profileService.getProfile = original.getProfile;
      profileService.updateProfile = original.updateProfile;
      createAccountService.checkUsernameAvailability = original.checkUsernameAvailability;
      return Story();
    },
  ],
} satisfies Meta<typeof ProfilePage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  decorators: [
    (Story) => {
      profileService.getProfile = () => new Promise(() => {});
      return Story();
    },
  ],
};

export const Default: Story = {};

export const Filled: Story = {
  play: async ({ canvas, userEvent }) => {
    await canvas.findByLabelText('Nome', { exact: true });
    await userEvent.type(canvas.getByLabelText('Nome', { exact: true }), ' Editado');
  },
};

export const Editing: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByLabelText('Username'));
  },
};

export const UsernameChecking: Story = {
  decorators: [
    (Story) => {
      createAccountService.checkUsernameAvailability = () => new Promise(() => {});
      return Story();
    },
  ],
  play: async ({ canvas, userEvent }) => {
    const username = await canvas.findByLabelText('Username');
    await userEvent.clear(username);
    await userEvent.type(username, 'novo_username');
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
    const username = await canvas.findByLabelText('Username');
    await userEvent.clear(username);
    await userEvent.type(username, 'admin');
    await canvas.findByText('Este username já está em uso', {}, { timeout: 2000 });
  },
};

export const SaveError: Story = {
  decorators: [
    (Story) => {
      profileService.updateProfile = async () => ({ success: false, error: 'boom' });
      return Story();
    },
  ],
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(await canvas.findByLabelText('Nome', { exact: true }), ' Editado');
    await userEvent.click(canvas.getByRole('button', { name: 'Salvar alterações' }));
    await canvas.findByText('Não foi possível atualizar seu perfil. Tente novamente.');
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile' } },
};

export const Tablet: Story = {
  globals: { viewport: { value: 'tablet' } },
};

export const Desktop: Story = {
  globals: { viewport: { value: 'desktop' } },
};
