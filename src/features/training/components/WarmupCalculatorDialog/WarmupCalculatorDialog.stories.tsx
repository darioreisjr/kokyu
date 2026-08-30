import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { WarmupCalculatorDialog } from './WarmupCalculatorDialog';

const meta = {
  title: 'Kokyu Treinamento/WarmupCalculatorDialog',
  component: WarmupCalculatorDialog,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    open: true,
    onClose: () => {},
  },
} satisfies Meta<typeof WarmupCalculatorDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { initialWorkingWeightKg: 70, initialWorkingReps: 6 },
};

export const HeavySingle: Story = {
  args: { initialWorkingWeightKg: 140, initialWorkingReps: 3 },
};
