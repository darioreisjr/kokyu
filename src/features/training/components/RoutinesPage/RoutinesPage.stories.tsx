import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { trainingDb } from '../../services/trainingMockDb';
import { RoutinesPage } from './RoutinesPage';

const meta = {
  title: 'Kokyu Treinamento/RoutinesPage',
  component: RoutinesPage,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof RoutinesPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { globals: { viewport: { value: 'mobile' } } };
export const Tablet: Story = { globals: { viewport: { value: 'tablet' } } };
export const Desktop: Story = { globals: { viewport: { value: 'desktop' } } };

/**
 * Mutates the shared mock DB to empty before rendering — Storybook keeps this feature's module
 * state across story navigation within one session (there's no automatic "reset" between
 * stories), so this is the last story in the file on purpose: reload Storybook to see the other
 * stories with data again. Same convention as `TrainingTodayPage.stories.tsx`.
 */
export const Empty: Story = {
  decorators: [
    (Story) => {
      trainingDb.routines = [];
      return <Story />;
    },
  ],
};
