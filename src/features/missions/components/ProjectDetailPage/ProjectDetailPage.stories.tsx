import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProjectDetailPage } from './ProjectDetailPage';

const meta = {
  title: 'Missions/ProjectDetailPage',
  component: ProjectDetailPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ProjectDetailPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { projectId: 'project-portfolio' } };
export const Paused: Story = { args: { projectId: 'project-mudanca' } };
