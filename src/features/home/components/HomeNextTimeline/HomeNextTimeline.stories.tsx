import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ScheduleEntry } from '@/shared/scheduling/types';
import { HomeNextTimeline } from './HomeNextTimeline';

const baseEntry: ScheduleEntry = {
  id: 'e1',
  sourceType: 'nutrition',
  sourceId: 'n1',
  title: 'Almoço',
  date: '2026-09-04',
  startAt: '12:30',
  endAt: '13:15',
  duration: 45,
  status: 'planned',
  createdAt: '2026-09-04T00:00:00Z',
  updatedAt: '2026-09-04T00:00:00Z',
};

const entries: ScheduleEntry[] = [
  baseEntry,
  { ...baseEntry, id: 'e2', sourceType: 'manual', sourceId: 'meeting1', title: 'Reunião de Alinhamento', startAt: '14:00', endAt: '15:00' },
  { ...baseEntry, id: 'e3', sourceType: 'training', sourceId: 't1', title: 'Push A', startAt: '19:00', endAt: '20:00' },
];

const meta = {
  title: 'Home/HomeNextTimeline',
  component: HomeNextTimeline,
  args: { onNavigateToRhythm: () => {} },
} satisfies Meta<typeof HomeNextTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithEntries: Story = { args: { entries } };
export const Empty: Story = { args: { entries: [] } };
export const Loading: Story = { args: { entries: [], isLoading: true } };
