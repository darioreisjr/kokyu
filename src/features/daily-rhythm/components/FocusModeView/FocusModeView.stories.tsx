import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FocusModeView } from './FocusModeView';

const meta = {
  title: 'Daily Rhythm/FocusModeView',
  component: FocusModeView,
} satisfies Meta<typeof FocusModeView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

