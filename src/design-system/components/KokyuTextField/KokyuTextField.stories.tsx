import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { KokyuTextField } from './KokyuTextField';

const meta = {
  title: 'Kokyu Components/KokyuTextField',
  component: KokyuTextField,
  tags: ['autodocs'],
  args: {
    label: 'E-mail',
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof KokyuTextField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: { defaultValue: 'user@example.com' },
};

export const Focused: Story = {
  args: { autoFocus: true, defaultValue: 'user@example.com' },
};

export const Error: Story = {
  args: { error: true, helperText: 'Informe um e-mail válido' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'user@example.com' },
};
