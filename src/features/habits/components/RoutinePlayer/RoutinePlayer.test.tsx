import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/app/habitos/rotinas/r-1/executar',
}));

import { render, screen } from '../../../../../test/test-utils';
import type { Habit } from '../../types/habit.types';
import type { HabitRoutine } from '../../types/routine.types';
import { RoutinePlayer } from './RoutinePlayer';

const mockHabits: Habit[] = [
  {
    id: 'h-1',
    name: 'Alongamento Matinal',
    description: '5 minutos de mobilidade',
    area: 'training',
    direction: 'build',
    trackingType: 'binary',
    status: 'active',
    target: { type: 'binary' },
    schedule: { frequencyType: 'daily', effectiveFrom: '2026-01-01' },
    reminders: [],
    timeOfDay: 'morning',
    startDate: '2026-01-01',
    icon: 'FitnessCenterRounded',
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
  description: 'Despertar',
  timeOfDay: 'morning',
  preferredTime: '07:00',
  habitIds: ['h-1'],
  items: [{ routineId: 'r-1', habitId: 'h-1', order: 0 }],
  active: true,
  createdAt: '',
  updatedAt: '',
};

describe('RoutinePlayer', () => {
  it('renders current habit and marks routine as completed when finished', async () => {
    const user = userEvent.setup();
    const handleComplete = vi.fn().mockResolvedValue(undefined);
    const handleFinish = vi.fn();

    render(
      <RoutinePlayer
        routine={mockRoutine}
        habits={mockHabits}
        onCompleteHabit={handleComplete}
        onFinishRoutine={handleFinish}
      />,
    );

    expect(screen.getByText('Alongamento Matinal')).toBeInTheDocument();

    const completeBtn = screen.getByRole('button', { name: 'Concluir Passo' });
    await user.click(completeBtn);

    expect(handleComplete).toHaveBeenCalledWith('h-1');
    expect(screen.getByText('Rotina Concluída!')).toBeInTheDocument();
    expect(handleFinish).toHaveBeenCalled();
  });
});
