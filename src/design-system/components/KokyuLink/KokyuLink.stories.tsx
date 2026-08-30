import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { KokyuLink } from './KokyuLink';

const meta = {
  title: 'Kokyu Components/KokyuLink',
  component: KokyuLink,
  tags: ['autodocs'],
  args: {
    href: '/recuperar-senha',
    children: 'Esqueci minha senha',
  },
} satisfies Meta<typeof KokyuLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
