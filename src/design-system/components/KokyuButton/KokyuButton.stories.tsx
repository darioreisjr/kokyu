import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { KokyuButton } from './KokyuButton';

const meta = {
  title: 'Kokyu Components/KokyuButton',
  component: KokyuButton,
  tags: ['autodocs'],
  args: {
    children: 'Entrar',
    onClick: fn(),
  },
  argTypes: {
    variant: { control: 'select', options: ['contained', 'outlined', 'text'] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
} satisfies Meta<typeof KokyuButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: 'contained' },
};

export const Secondary: Story = {
  args: { variant: 'outlined' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Loading: Story = {
  args: { loading: true },
};

export const FullWidth: Story = {
  args: { fullWidth: true },
  parameters: { layout: 'padded' },
};
