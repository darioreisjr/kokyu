import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { MuscleRecoveryEstimate } from '../../types';
import { MuscleRecoveryCard } from './MuscleRecoveryCard';

const meta = {
  title: 'Kokyu Treinamento/MuscleRecoveryCard',
  component: MuscleRecoveryCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MuscleRecoveryCard>;

export default meta;

type Story = StoryObj<typeof meta>;

const recentlyTrained: MuscleRecoveryEstimate = {
  muscleGroup: 'chest',
  label: 'recentlyTrained',
  estimatedRecoveryPercent: 20,
  hoursSinceTrained: 5,
};

const partiallyRested: MuscleRecoveryEstimate = {
  muscleGroup: 'back',
  label: 'partiallyRested',
  estimatedRecoveryPercent: 55,
  hoursSinceTrained: 30,
};

const wellRested: MuscleRecoveryEstimate = {
  muscleGroup: 'quads',
  label: 'wellRested',
  estimatedRecoveryPercent: 100,
};

export const RecentlyTrained: Story = {
  args: { estimate: recentlyTrained },
};

export const PartiallyRested: Story = {
  args: { estimate: partiallyRested },
};

export const WellRested: Story = {
  args: { estimate: wellRested },
};
