import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ScheduleEntry } from '@/shared/scheduling/types';
import { HomeNowCard } from './HomeNowCard';

const trainingEntry: ScheduleEntry = {
  id: 'e1',
  sourceType: 'training',
  sourceId: 't1',
  title: 'Push A',
  date: '2026-09-04',
  startAt: '19:00',
  endAt: '20:00',
  duration: 60,
  status: 'planned',
  createdAt: '2026-09-04T00:00:00Z',
  updatedAt: '2026-09-04T00:00:00Z',
};

const missionEntry: ScheduleEntry = { ...trainingEntry, id: 'e2', sourceType: 'mission', sourceId: 'm1', title: 'Revisar proposta do cliente' };
const habitEntry: ScheduleEntry = { ...trainingEntry, id: 'e3', sourceType: 'habit', sourceId: 'h1', title: 'Meditação Matinal', startAt: '07:00', endAt: '07:20' };

const meta = {
  title: 'Home/HomeNowCard',
  component: HomeNowCard,
  args: {
    now: new Date('2026-09-04T19:30:00'),
    onComplete: async () => {},
    onStartFocus: () => {},
    onNavigate: () => {},
    onOpenFreeTime: () => {},
  },
} satisfies Meta<typeof HomeNowCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CurrentTraining: Story = { args: { currentEntry: trainingEntry, freeSlot: null } };
export const CurrentMission: Story = { args: { currentEntry: missionEntry, freeSlot: null } };
export const CurrentHabit: Story = {
  args: { currentEntry: habitEntry, freeSlot: null, now: new Date('2026-09-04T07:10:00') },
};

export const TrainingSessionAlreadyActive: Story = {
  args: { currentEntry: trainingEntry, freeSlot: null, trainingHasActiveSession: true },
};

export const FreeTime: Story = {
  args: {
    currentEntry: null,
    freeSlot: { id: 'slot1', date: '2026-09-04', startAt: '14:00', endAt: '14:45', duration: 45 },
  },
};

export const NoActivityNoFreeTime: Story = { args: { currentEntry: null, freeSlot: null } };

export const Loading: Story = { args: { currentEntry: null, freeSlot: null, isLoading: true } };
