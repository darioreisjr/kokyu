import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { KokyuUsernameField } from './KokyuUsernameField';

const meta = {
  title: 'Kokyu Components/KokyuUsernameField',
  component: KokyuUsernameField,
  tags: ['autodocs'],
  args: {
    label: 'Username',
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof KokyuUsernameField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: { defaultValue: 'dario_reis' },
};

export const Checking: Story = {
  args: { defaultValue: 'dario_reis', status: 'loading' },
};

export const Available: Story = {
  args: {
    defaultValue: 'dario_reis',
    status: 'success',
    helperText: 'Username disponível',
  },
};

export const Unavailable: Story = {
  args: {
    defaultValue: 'admin',
    status: 'error',
    error: true,
    helperText: 'Este username já está em uso',
  },
};
