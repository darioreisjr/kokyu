import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { Recipe } from '../../types/recipe.types';
import { RecipeCard } from './RecipeCard';

const recipe: Recipe = {
  id: 'recipe-1',
  name: 'Frango grelhado com arroz e feijão',
  category: 'almoco',
  tags: ['proteína', 'rápido'],
  preparationTime: 15,
  cookingTime: 30,
  servings: 4,
  ingredients: [],
  steps: [],
  favorite: false,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

const meta = {
  title: 'Kokyu Nutrição/RecipeCard',
  component: RecipeCard,
  tags: ['autodocs'],
  parameters: {
    nextjs: { appDirectory: true, navigation: { pathname: '/app/nutricao/receitas' } },
  },
  decorators: [
    (Story) => (
      <Box sx={{ width: 280 }}>
        <Story />
      </Box>
    ),
  ],
  args: { recipe },
} satisfies Meta<typeof RecipeCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Favorite: Story = {
  args: { recipe: { ...recipe, favorite: true } },
};

export const WithoutImage: Story = {
  args: { recipe: { ...recipe, imageUrl: undefined } },
};
