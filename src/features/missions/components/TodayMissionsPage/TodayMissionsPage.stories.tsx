import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TodayMissionsPage } from './TodayMissionsPage';

const meta = {
  title: 'Missions/TodayMissionsPage',
  component: TodayMissionsPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TodayMissionsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
