import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { mockCollections } from '../../mocks/collections.mock';
import { AddToCollectionDialog } from './AddToCollectionDialog';

const meta = {
  title: 'Kokyu Tempo Livre/AddToCollectionDialog',
  component: AddToCollectionDialog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    itemId: 'movie-interestelar',
    collections: mockCollections,
    onClose: fn(),
    onToggle: fn(),
  },
} satisfies Meta<typeof AddToCollectionDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoCollectionsYet: Story = {
  args: { collections: [] },
};
