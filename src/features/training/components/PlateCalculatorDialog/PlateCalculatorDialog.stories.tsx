import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { mockTrainingPreferences } from '../../mocks/trainingPreferences.mock';
import { PlateCalculatorDialog } from './PlateCalculatorDialog';

const meta = {
  title: 'Kokyu Treinamento/PlateCalculatorDialog',
  component: PlateCalculatorDialog,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    open: true,
    onClose: () => {},
    preferences: mockTrainingPreferences,
  },
} satisfies Meta<typeof PlateCalculatorDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { initialTargetWeightKg: 100 },
};

export const ExactMatch: Story = {
  args: { initialTargetWeightKg: 60 },
};

export const NotExactlyAchievable: Story = {
  args: { initialTargetWeightKg: 101 },
};
