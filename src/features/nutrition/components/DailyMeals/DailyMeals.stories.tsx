import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { defaultMealTypes } from '../../constants/mealTypes';
import type { PlannedMeal } from '../../types/mealPlan.types';
import type { Recipe } from '../../types/recipe.types';
import { DailyMeals } from './DailyMeals';

const recipe: Recipe = {
  id: 'recipe-1',
  name: 'Frango grelhado com arroz e feijão',
  category: 'almoco',
  tags: [],
  preparationTime: 15,
  cookingTime: 30,
  servings: 4,
  ingredients: [],
  steps: [],
  favorite: false,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

const filledMeals: PlannedMeal[] = [
  {
    id: 'meal-1',
    date: '2026-08-29',
    mealTypeId: 'cafe-da-manha',
    contentType: 'note',
    note: 'Café e pão',
    prepared: true,
    createdAt: '2026-08-29T00:00:00.000Z',
  },
  {
    id: 'meal-2',
    date: '2026-08-29',
    mealTypeId: 'almoco',
    contentType: 'recipe',
    recipeId: recipe.id,
    servings: 4,
    prepared: false,
    createdAt: '2026-08-29T00:00:00.000Z',
  },
];

const meta = {
  title: 'Kokyu Nutrição/DailyMeals',
  component: DailyMeals,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ width: 560 }}>
        <Story />
      </Box>
    ),
  ],
  args: {
    mealTypes: defaultMealTypes,
    meals: [],
    recipes: [recipe],
    onAddMeal: fn(),
    onRemoveMeal: fn(),
    onTogglePrepared: fn(),
    onMoveMeal: fn(),
  },
} satisfies Meta<typeof DailyMeals>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
  args: { meals: filledMeals },
};
