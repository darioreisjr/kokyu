import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { TrainingProgram } from '../../types';
import { ProgramCard } from './ProgramCard';

const baseProgram: TrainingProgram = {
  id: 'program-1',
  name: 'Hipertrofia — Fundamentos',
  description: 'Push/Pull/Legs com foco em hipertrofia.',
  durationWeeks: 6,
  status: 'draft',
  blocks: [
    {
      id: 'block-1',
      name: 'Bloco 1 — Acumulação',
      order: 1,
      type: 'accumulation',
      weeks: [
        {
          id: 'week-1',
          order: 1,
          isDeload: false,
          scheduledRoutines: [{ weekday: 1, routineId: 'routine-push-a' }],
        },
      ],
    },
  ],
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const meta = {
  title: 'Kokyu Treinamento/ProgramCard',
  component: ProgramCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ProgramCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Draft: Story = {
  args: { program: baseProgram },
};

export const Active: Story = {
  args: {
    program: { ...baseProgram, status: 'active', startDate: '2026-08-01', endDate: '2026-09-12' },
  },
};

export const Completed: Story = {
  args: {
    program: {
      ...baseProgram,
      status: 'completed',
      startDate: '2026-06-01',
      endDate: '2026-07-13',
    },
  },
};
