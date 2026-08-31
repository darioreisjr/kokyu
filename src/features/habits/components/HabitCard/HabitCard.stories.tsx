import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { Habit } from '../../types/habit.types';
import { HabitCard } from './HabitCard';

const baseHabit: Habit = {
  id: 'h-story-1',
  name: 'Ler 30 minutos',
  description: 'Leitura antes de dormir',
  area: 'leisure',
  direction: 'build',
  trackingType: 'duration',
  status: 'active',
  target: {
    type: 'duration',
    targetMinutes: 30,
  },
  schedule: {
    frequencyType: 'daily',
    effectiveFrom: '2026-01-01',
  },
  reminders: [],
  timeOfDay: 'evening',
  preferredTime: '21:30',
  startDate: '2026-01-01',
  icon: 'MenuBookRounded',
  tags: ['leitura'],
  source: 'manual',
  goalIds: [],
  routineIds: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const meta = {
  title: 'Habits/HabitCard',
  component: HabitCard,
} satisfies Meta<typeof HabitCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DurationPartial: Story = {
  args: {
    occurrence: {
      habitId: 'h-story-1',
      habit: baseHabit,
      date: '2026-03-05',
      periodStart: '2026-03-05',
      periodEnd: '2026-03-05',
      isScheduled: true,
      isPaused: false,
      target: baseHabit.target,
      loggedValue: 15,
      logs: [],
      status: 'partial',
      progressPercent: 50,
    },
  },
};
