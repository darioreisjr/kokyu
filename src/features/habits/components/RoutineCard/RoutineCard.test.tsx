import { describe, expect, it } from 'vitest';
import { render, screen } from '../../../../../test/test-utils';
import type { Habit } from '../../types/habit.types';
import type { HabitRoutine } from '../../types/routine.types';
import { RoutineCard } from './RoutineCard';

const mockHabits: Habit[] = [
  {
    id: 'h-1',
    name: 'Tomar 500ml de água',
    area: 'nutrition',
    direction: 'build',
    trackingType: 'quantity',
    status: 'active',
    target: { type: 'quantity', targetValue: 500, unit: 'units' },
    schedule: { frequencyType: 'daily', effectiveFrom: '2026-01-01' },
    reminders: [],
    timeOfDay: 'morning',
    startDate: '2026-01-01',
    icon: 'RestaurantRounded',
    tags: [],
    source: 'manual',
    goalIds: [],
    routineIds: [],
    createdAt: '',
    updatedAt: '',
  },
];

const mockRoutine: HabitRoutine = {
  id: 'r-1',
  name: 'Rotina Matinal',
  description: 'Despertar e foco',
  timeOfDay: 'morning',
  preferredTime: '07:00',
  estimatedDurationMinutes: 20,
  habitIds: ['h-1'],
  items: [{ routineId: 'r-1', habitId: 'h-1', order: 0 }],
  active: true,
  createdAt: '',
  updatedAt: '',
};

describe('RoutineCard', () => {
  it('renders routine title, estimated duration, and CTA button', () => {
    render(<RoutineCard routine={mockRoutine} habits={mockHabits} />);

    expect(screen.getByRole('heading', { name: 'Rotina Matinal' })).toBeInTheDocument();
    expect(screen.getByText('~20 min')).toBeInTheDocument();
    expect(screen.getByText('Tomar 500ml de água')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Iniciar Rotina' })).toBeInTheDocument();
  });
});
