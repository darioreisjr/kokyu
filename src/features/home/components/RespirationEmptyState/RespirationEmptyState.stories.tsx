import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { RespirationEmptyState } from './RespirationEmptyState';

const meta = {
  title: 'Home/RespirationEmptyState',
  component: RespirationEmptyState,
  args: { onNavigate: () => {} },
} satisfies Meta<typeof RespirationEmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
