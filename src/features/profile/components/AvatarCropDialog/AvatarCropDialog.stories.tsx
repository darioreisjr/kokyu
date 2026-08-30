import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { AvatarCropDialog } from './AvatarCropDialog';

const SAMPLE_SOURCE_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#2E3A59"/><rect width="400" height="300" fill="#F4491F" opacity="0.35"/><circle cx="200" cy="120" r="60" fill="#fff"/><rect x="100" y="200" width="200" height="90" rx="45" fill="#fff"/></svg>',
)}`;

const meta = {
  title: 'Kokyu Components/AvatarCropDialog',
  component: AvatarCropDialog,
  tags: ['autodocs'],
  args: {
    open: true,
    imageSrc: SAMPLE_SOURCE_SRC,
    onCancel: fn(),
    onConfirm: fn(),
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AvatarCropDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { viewport: { value: 'desktop' } },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile' } },
};
