import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ScheduleEntry } from '@/shared/scheduling/types';
import { ScheduleEntryCard } from './ScheduleEntryCard';

const baseEntry: ScheduleEntry = {
  id: 'story-entry-1',
  sourceType: 'training',
  sourceId: 't-101',
  title: 'Push A - Peito, Ombro e Tríceps',
  date: '2026-08-31',
  startAt: '19:00',
  endAt: '20:00',
  duration: 60,
  locked: true,
  status: 'planned',
  priority: 'high',
  createdAt: '2026-08-31T00:00:00Z',
  updatedAt: '2026-08-31T00:00:00Z',
};

const meta = {
  title: 'Daily Rhythm/ScheduleEntryCard',
  component: ScheduleEntryCard,
} satisfies Meta<typeof ScheduleEntryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Training: Story = {
  args: {
    entry: baseEntry,
  },
};

export const Habit: Story = {
  args: {
    entry: {
      ...baseEntry,
      id: 'h-1',
      sourceType: 'habit',
      title: 'Meditação Matinal',
      startAt: '07:00',
      endAt: '07:20',
      duration: 20,
      locked: false,
    },
  },
};

export const Nutrition: Story = {
  args: {
    entry: {
      ...baseEntry,
      id: 'n-1',
      sourceType: 'nutrition',
      title: 'Almoço: Frango Grelhado e Salada',
      startAt: '12:30',
      endAt: '13:15',
      duration: 45,
      locked: false,
    },
  },
};

export const Leisure: Story = {
  args: {
    entry: {
      ...baseEntry,
      id: 'l-1',
      sourceType: 'leisure',
      title: 'Assistir Duna: Parte Dois',
      startAt: '21:00',
      endAt: '22:30',
      duration: 90,
      locked: false,
    },
  },
};

export const Completed: Story = {
  args: {
    entry: {
      ...baseEntry,
      id: 'comp-1',
      title: 'Reunião Concluída',
      sourceType: 'manual',
      status: 'completed',
    },
  },
};

