import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { KokyuCheckbox } from './KokyuCheckbox';

const meta = {
  title: 'Kokyu Components/KokyuCheckbox',
  component: KokyuCheckbox,
  tags: ['autodocs'],
  args: {
    label: 'Lembrar de mim',
  },
} satisfies Meta<typeof KokyuCheckbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
