import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DailyTimeline } from './DailyTimeline';

const meta = {
  title: 'Daily Rhythm/DailyTimeline',
  component: DailyTimeline,
} satisfies Meta<typeof DailyTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    date: '2026-08-31',
    entries: [
      {
        id: 't-1',
        sourceType: 'training',
        sourceId: 'src-1',
        title: 'Treino A',
        date: '2026-08-31',
        startAt: '08:00',
        endAt: '09:00',
        duration: 60,
        locked: true,
        status: 'planned',
        createdAt: '2026-08-31T00:00:00Z',
        updatedAt: '2026-08-31T00:00:00Z',
      },
      {
        id: 'm-1',
        sourceType: 'mission',
        sourceId: 'src-2',
        title: 'Desenvolvimento do Scheduler',
        date: '2026-08-31',
        startAt: '10:00',
        endAt: '12:00',
        duration: 120,
        locked: false,
        status: 'planned',
        createdAt: '2026-08-31T00:00:00Z',
        updatedAt: '2026-08-31T00:00:00Z',
      },
    ],
    freeSlots: [
      {
        id: 'free-1',
        date: '2026-08-31',
        startAt: '09:00',
        endAt: '10:00',
        duration: 60,
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    date: '2026-08-31',
    entries: [],
    freeSlots: [],
  },
};

