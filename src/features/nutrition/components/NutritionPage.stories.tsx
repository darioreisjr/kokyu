import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { PantryPage } from './PantryPage/PantryPage';
import { PlannerPage } from './PlannerPage/PlannerPage';
import { RecipesPage } from './RecipesPage/RecipesPage';
import { ShoppingPage } from './ShoppingPage/ShoppingPage';
import { TodayPage } from './TodayPage/TodayPage';

/**
 * One story file covering every top-level Nutrição screen — each
 * variant renders a different page component against the same shared
 * mock data, the same way `?section=` variants would for a single
 * page with internal routing.
 */
const meta = {
  title: 'Kokyu Nutrição/NutritionPage',
  component: TodayPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TodayPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Today: Story = {};

export const Planner: Story = {
  render: () => <PlannerPage />,
};

export const Pantry: Story = {
  render: () => <PantryPage />,
};

export const Shopping: Story = {
  render: () => <ShoppingPage />,
};

export const Recipes: Story = {
  render: () => <RecipesPage />,
};

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile' } },
};

export const Tablet: Story = {
  globals: { viewport: { value: 'tablet' } },
};

export const Desktop: Story = {
  globals: { viewport: { value: 'desktop' } },
};
