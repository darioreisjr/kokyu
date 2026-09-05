import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MissionPriorityBadge } from './MissionPriorityBadge';

const meta = {
  title: 'Missions/MissionPriorityBadge',
  component: MissionPriorityBadge,
} satisfies Meta<typeof MissionPriorityBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Low: Story = { args: { priority: 'low' } };
export const Medium: Story = { args: { priority: 'medium' } };
export const High: Story = { args: { priority: 'high' } };
export const Critical: Story = { args: { priority: 'critical' } };
export const WithImportance: Story = { args: { priority: 'high', importance: 'high' } };
