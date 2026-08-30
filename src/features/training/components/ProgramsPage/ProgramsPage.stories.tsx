import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { trainingDb } from '../../services/trainingMockDb';
import { ProgramsPage } from './ProgramsPage';

const meta = {
  title: 'Kokyu Treinamento/ProgramsPage',
  component: ProgramsPage,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ProgramsPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { globals: { viewport: { value: 'mobile' } } };

/**
 * Mutates the shared mock DB to empty before rendering — Storybook keeps this feature's module
 * state across story navigation within one session, so this is the last story in the file on
 * purpose: reload Storybook to see the other stories with data again.
 */
export const Empty: Story = {
  decorators: [
    (Story) => {
      trainingDb.programs = [];
      return <Story />;
    },
  ],
};
