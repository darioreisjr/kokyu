import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { goalDb } from '@/features/goals/services/goalMockDb';
import { habitDb } from '@/features/habits/services/habitMockDb';
import { leisureDb } from '@/features/leisure/services/leisureMockDb';
import { nutritionDb } from '@/features/nutrition/services/nutritionMockDb';
import { trainingDb } from '@/features/training/services/trainingMockDb';
import { missionDb } from '@/features/missions/services/missionMockDb';
import { scheduleDb } from '@/shared/scheduling/services/scheduleMockDb';
import { RespirationPage } from './RespirationPage';

/**
 * Clears every mock store this page's providers read from — used only by
 * the `Empty` story below, to demonstrate the compact onboarding state a
 * brand-new account gets (see spec's "EMPTY HOME"). The Next.js/App
 * Router `useRouter()` this page calls isn't available under Storybook,
 * so navigation clicks are inert here (same limitation every other
 * router-dependent story in this codebase accepts).
 */
function clearAllHomeMockData() {
  habitDb.habits = [];
  habitDb.logs = [];
  habitDb.routines = [];
  trainingDb.scheduleEntries = [];
  trainingDb.sessions = [];
  nutritionDb.plannedMeals = [];
  nutritionDb.pantryItems = [];
  nutritionDb.shoppingItems = [];
  goalDb.goals = [];
  leisureDb.items = [];
  leisureDb.planEntries = [];
  scheduleDb.manualEntries = [];
  missionDb.missions = [];
}

const meta = {
  title: 'Home/RespirationPage',
  component: RespirationPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof RespirationPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Renders against whatever the seeded mock data naturally looks like "today". */
export const Default: Story = {};

export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile' } } };
export const Tablet: Story = { parameters: { viewport: { defaultViewport: 'tablet' } } };
export const Desktop: Story = { parameters: { viewport: { defaultViewport: 'desktop' } } };

export const Empty: Story = {
  decorators: [
    (Story) => {
      clearAllHomeMockData();
      return <Story />;
    },
  ],
};
