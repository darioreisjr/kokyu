import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { goalDb } from '../../services/goalMockDb';
import { GoalsOverviewPage } from './GoalsOverviewPage';

const meta = {
  title: 'Kokyu Metas/GoalsOverviewPage',
  component: GoalsOverviewPage,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof GoalsOverviewPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {};

export const Desktop: Story = { globals: { viewport: { value: 'desktop' } } };
export const Tablet: Story = { globals: { viewport: { value: 'tablet' } } };
export const Mobile: Story = { globals: { viewport: { value: 'mobile' } } };

/**
 * Mutates the shared mock DB to empty before rendering — Storybook keeps this feature's module
 * state across story navigation within one session (there's no automatic "reset" between
 * stories), so this is the last story in the file on purpose: reload Storybook to see the other
 * stories with data again.
 */
export const Empty: Story = {
  decorators: [
    (Story) => {
      goalDb.goals = [];
      return <Story />;
    },
  ],
};
