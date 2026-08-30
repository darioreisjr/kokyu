import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import type { MealType, PlannedMeal } from '../../types/mealPlan.types';
import type { Recipe } from '../../types/recipe.types';
import { MealCard } from './MealCard';

const mealType: MealType = {
  id: 'almoco',
  name: 'Almoço',
  order: 2,
  defaultTime: '12:30',
  enabled: true,
};

const recipe: Recipe = {
  id: 'recipe-1',
  name: 'Frango grelhado com arroz e feijão',
  category: 'almoco',
  tags: ['proteína'],
  preparationTime: 15,
  cookingTime: 30,
  servings: 4,
  ingredients: [],
  steps: [],
  favorite: false,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

const recipeMeal: PlannedMeal = {
  id: 'meal-1',
  date: '2026-08-29',
  mealTypeId: 'almoco',
  contentType: 'recipe',
  recipeId: recipe.id,
  servings: 4,
  prepared: false,
  createdAt: '2026-08-29T00:00:00.000Z',
};

const noteMeal: PlannedMeal = {
  id: 'meal-2',
  date: '2026-08-29',
  mealTypeId: 'almoco',
  contentType: 'note',
  note: 'Almoçar fora',
  prepared: false,
  createdAt: '2026-08-29T00:00:00.000Z',
};

const meta = {
  title: 'Kokyu Nutrição/MealCard',
  component: MealCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ width: 480 }}>
        <Story />
      </Box>
    ),
  ],
  args: {
    mealType,
    onAddMeal: fn(),
    onRemoveMeal: fn(),
    onTogglePrepared: fn(),
    onMoveMeal: fn(),
  },
} satisfies Meta<typeof MealCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Planned: Story = {
  args: { meal: { ...noteMeal, prepared: true } },
};

export const RecipeVariant: Story = {
  name: 'Recipe',
  args: { meal: recipeMeal, recipe },
};

export const Note: Story = {
  args: { meal: noteMeal },
};
