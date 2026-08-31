import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { InboxView } from './InboxView';

const meta = {
  title: 'Daily Rhythm/InboxView',
  component: InboxView,
} satisfies Meta<typeof InboxView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

