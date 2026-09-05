import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { HomeProviderResult, NutritionHomeProjection } from '@/shared/home/types';
import { HomeNutritionSummary } from './HomeNutritionSummary';

const withData: HomeProviderResult<NutritionHomeProjection> = {
  sourceType: 'nutrition',
  status: 'success',
  data: {
    nextMeal: { id: 'meal1', mealTypeName: 'Almoço', time: '12:30', prepared: false },
    plannedMealsToday: 3,
    preparedMealsToday: 1,
    pantryUrgentCount: 2,
    shoppingPendingCount: 4,
  },
};

const meta = {
  title: 'Home/HomeNutritionSummary',
  component: HomeNutritionSummary,
  args: { onOpen: () => {} },
} satisfies Meta<typeof HomeNutritionSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { result: withData } };

export const Empty: Story = {
  args: {
    result: {
      sourceType: 'nutrition',
      status: 'success',
      data: { nextMeal: null, plannedMealsToday: 0, preparedMealsToday: 0, pantryUrgentCount: 0, shoppingPendingCount: 0 },
    },
  },
};

export const ProviderError: Story = {
  args: { result: { sourceType: 'nutrition', status: 'error', data: null, error: 'boom' } },
};

export const Loading: Story = { args: { result: withData, isLoading: true } };
