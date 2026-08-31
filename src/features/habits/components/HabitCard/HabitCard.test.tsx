import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../../../../test/test-utils';
import type { Habit } from '../../types/habit.types';
import type { HabitOccurrence } from '../../types/occurrence.types';
import { HabitCard } from './HabitCard';

const mockHabit: Habit = {
  id: 'h-card-1',
  name: 'Ler 30 minutos',
  description: 'Leitura diária',
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
  preferredTime: '21:00',
  startDate: '2026-01-01',
  icon: 'MenuBookRounded',
  tags: [],
  source: 'manual',
  goalIds: [],
  routineIds: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const mockOccurrence: HabitOccurrence = {
  habitId: 'h-card-1',
  habit: mockHabit,
  date: '2026-03-05',
  periodStart: '2026-03-05',
  periodEnd: '2026-03-05',
  isScheduled: true,
  isPaused: false,
  target: mockHabit.target,
  loggedValue: 15,
  logs: [],
  status: 'partial',
  progressPercent: 50,
};

describe('HabitCard', () => {
  it('renders habit title, description, and target information', () => {
    render(<HabitCard occurrence={mockOccurrence} />);

    expect(screen.getByText('Ler 30 minutos')).toBeInTheDocument();
    expect(screen.getByText('Leitura diária')).toBeInTheDocument();
    expect(screen.getByText('Meta: 30 min')).toBeInTheDocument();
    expect(screen.getByText('15 / 30 min')).toBeInTheDocument();
  });

  it('triggers quick complete callback on button click', async () => {
    const user = userEvent.setup();
    const handleComplete = vi.fn();

    render(<HabitCard occurrence={mockOccurrence} onQuickComplete={handleComplete} />);

    const completeBtn = screen.getByRole('button', { name: 'Concluir Ler 30 minutos' });
    await user.click(completeBtn);

    expect(handleComplete).toHaveBeenCalledWith('h-card-1');
  });

  it('triggers timer open callback on timer button click', async () => {
    const user = userEvent.setup();
    const handleTimer = vi.fn();

    render(<HabitCard occurrence={mockOccurrence} onOpenTimer={handleTimer} />);

    const timerBtn = screen.getByRole('button', { name: 'Iniciar timer para Ler 30 minutos' });
    await user.click(timerBtn);

    expect(handleTimer).toHaveBeenCalledWith('h-card-1');
  });
});
