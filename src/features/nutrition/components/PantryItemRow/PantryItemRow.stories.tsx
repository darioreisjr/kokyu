import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import type { Ingredient } from '../../types/ingredient.types';
import type { PantryItem } from '../../types/pantry.types';
import { PantryItemRow } from './PantryItemRow';

const ingredient: Ingredient = {
  id: 'leite',
  name: 'Leite',
  normalizedName: 'leite',
  category: 'laticinios',
  defaultUnit: 'ml',
};

const baseItem: PantryItem = {
  id: 'item-1',
  ingredientId: 'leite',
  quantity: 1000,
  unit: 'ml',
  storageLocationId: 'geladeira',
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

const meta = {
  title: 'Kokyu Nutrição/PantryItem',
  component: PantryItemRow,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ width: 480 }}>
        <Story />
      </Box>
    ),
  ],
  args: {
    item: baseItem,
    ingredient,
    storageLocationName: 'Geladeira',
    onEdit: fn(),
    onRemove: fn(),
    onMarkOut: fn(),
  },
} satisfies Meta<typeof PantryItemRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Normal: Story = {};

export const LowStock: Story = {
  args: { item: { ...baseItem, quantity: 100, minimumStock: 300 } },
};

export const Expiring: Story = {
  args: { item: { ...baseItem, expirationDate: '2026-08-30' } },
};

export const Expired: Story = {
  args: { item: { ...baseItem, expirationDate: '2026-08-01' } },
};
