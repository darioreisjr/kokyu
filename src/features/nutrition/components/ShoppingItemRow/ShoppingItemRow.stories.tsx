import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import type { Ingredient } from '../../types/ingredient.types';
import type { ShoppingItem } from '../../types/shopping.types';
import { ShoppingItemRow } from './ShoppingItemRow';

const ingredient: Ingredient = {
  id: 'arroz',
  name: 'Arroz branco',
  normalizedName: 'arroz branco',
  category: 'graos',
  defaultUnit: 'g',
};

const baseItem: ShoppingItem = {
  id: 'item-1',
  ingredientId: 'arroz',
  quantity: 700,
  unit: 'g',
  category: 'graos',
  checked: false,
  source: 'manual',
  createdAt: '2026-08-01T00:00:00.000Z',
};

const meta = {
  title: 'Kokyu Nutrição/ShoppingItem',
  component: ShoppingItemRow,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ width: 420 }}>
        <Story />
      </Box>
    ),
  ],
  args: {
    item: baseItem,
    ingredient,
    onToggle: fn(),
  },
} satisfies Meta<typeof ShoppingItemRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Purchased: Story = {
  args: { item: { ...baseItem, checked: true } },
};

export const FromRecipe: Story = {
  args: { item: { ...baseItem, source: 'recipe', recipeIds: ['frango-arroz-feijao'] } },
};
