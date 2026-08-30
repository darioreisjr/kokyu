import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { KokyuGoogleButton } from './KokyuGoogleButton';

const meta = {
  title: 'Kokyu Components/KokyuGoogleButton',
  component: KokyuGoogleButton,
  tags: ['autodocs'],
  args: {
    onClick: fn(),
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof KokyuGoogleButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: { loading: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
