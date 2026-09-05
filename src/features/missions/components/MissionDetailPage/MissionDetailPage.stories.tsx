import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MissionDetailPage } from './MissionDetailPage';

const meta = {
  title: 'Missions/MissionDetailPage',
  component: MissionDetailPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MissionDetailPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Reads real seed data (`missions.mock.ts`) — `mission-auth` has a checklist, `mission-domain` is blocked, `mission-waiting-vendor` is waiting. */
export const WithChecklist: Story = { args: { missionId: 'mission-auth' } };
export const Blocked: Story = { args: { missionId: 'mission-domain' } };
export const Waiting: Story = { args: { missionId: 'mission-waiting-vendor' } };
export const Simple: Story = { args: { missionId: 'mission-backlog-1' } };
