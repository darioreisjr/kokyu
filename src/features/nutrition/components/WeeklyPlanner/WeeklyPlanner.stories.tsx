import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { defaultMealTypes } from '../../constants/mealTypes';
import type { PlannedMeal } from '../../types/mealPlan.types';
import type { Recipe } from '../../types/recipe.types';
import { getWeekDays } from '../../utils/dateHelpers';
import { WeeklyPlanner } from './WeeklyPlanner';

const recipe: Recipe = {
  id: 'recipe-1',
  name: 'Frango grelhado',
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

const weekDays = getWeekDays(new Date(2026, 7, 24), 1);

const meals: PlannedMeal[] = [
  {
    id: 'meal-1',
    date: '2026-08-24',
    mealTypeId: 'almoco',
    contentType: 'recipe',
    recipeId: recipe.id,
    servings: 4,
    prepared: false,
    createdAt: '2026-08-24T00:00:00.000Z',
  },
  {
    id: 'meal-2',
    date: '2026-08-26',
    mealTypeId: 'jantar',
    contentType: 'note',
    note: 'Livre',
    prepared: false,
    createdAt: '2026-08-26T00:00:00.000Z',
  },
];

const meta = {
  title: 'Kokyu Nutrição/WeeklyPlanner',
  component: WeeklyPlanner,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    weekDays,
    mealTypes: defaultMealTypes,
    meals,
    recipes: [recipe],
    ingredientsById: new Map(),
    selectedDate: weekDays[0]!,
    onSelectDate: fn(),
    onSlotClick: fn(),
    onAddMeal: fn(),
    onRemoveMeal: fn(),
    onTogglePrepared: fn(),
    onMoveMeal: fn(),
  },
} satisfies Meta<typeof WeeklyPlanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
  globals: { viewport: { value: 'desktop' } },
};

export const Tablet: Story = {
  globals: { viewport: { value: 'tablet' } },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile' } },
};
