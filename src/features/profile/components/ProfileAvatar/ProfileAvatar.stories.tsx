import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { ProfileAvatar } from './ProfileAvatar';

const SAMPLE_AVATAR_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#F4491F"/><circle cx="100" cy="78" r="34" fill="#fff"/><rect x="48" y="128" width="104" height="58" rx="29" fill="#fff"/></svg>',
)}`;

const meta = {
  title: 'Kokyu Components/ProfileAvatar',
  component: ProfileAvatar,
  tags: ['autodocs'],
  args: {
    firstName: 'Dario',
    lastName: 'Reis',
    previewUrl: null,
    onFileSelected: fn(),
    onRemove: fn(),
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ProfileAvatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Initials: Story = {};

export const Image: Story = {
  args: { previewUrl: SAMPLE_AVATAR_SRC },
};

export const Editing: Story = {
  args: { previewUrl: SAMPLE_AVATAR_SRC },
  play: async ({ canvas, userEvent }) => {
    await userEvent.hover(canvas.getByRole('button', { name: 'Alterar foto' }));
  },
};
