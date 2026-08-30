import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ExerciseTrendSection } from './ExerciseTrendSection';

const meta = {
  title: 'Kokyu Treinamento/ExerciseTrendSection',
  component: ExerciseTrendSection,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ExerciseTrendSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { weightUnit: 'kg' },
};

export const PoundsUnit: Story = {
  args: { weightUnit: 'lb' },
};
