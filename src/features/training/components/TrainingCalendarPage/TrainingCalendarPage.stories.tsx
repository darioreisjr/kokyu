import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { TrainingCalendarPage } from './TrainingCalendarPage';

const meta = {
  title: 'Kokyu Treinamento/TrainingCalendarPage',
  component: TrainingCalendarPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TrainingCalendarPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Week: Story = {
  globals: { viewport: { value: 'laptop' } },
};

/** Opens on the week view by default — click "Mês" in the toggle to switch. */
export const Month: Story = {
  globals: { viewport: { value: 'laptop' } },
};

/** Below the `sm` breakpoint the view toggle disappears entirely and the page always renders the agenda list. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile' } },
};
