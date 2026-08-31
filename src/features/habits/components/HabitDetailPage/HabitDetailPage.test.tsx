import { describe, expect, it, vi } from 'vitest';

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/app/habitos/habit-1',
}));

vi.mock('../../hooks/useHabit', () => ({
  useHabit: (id: string) => ({
    habit: {
      id,
      name: 'Ler 30 minutos',
      description: 'Leitura diária',
      area: 'leisure',
      direction: 'build',
      trackingType: 'duration',
      status: 'active',
      target: { type: 'duration', targetMinutes: 30 },
      schedule: { frequencyType: 'daily', effectiveFrom: '2026-01-01' },
      reminders: [],
      timeOfDay: 'evening',
      startDate: '2026-01-01',
      icon: 'MenuBookRounded',
      tags: ['leitura'],
      source: 'manual',
      goalIds: [],
      routineIds: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    logs: [
      {
        id: 'l-1',
        habitId: id,
        date: '2026-03-05',
        status: 'completed',
        value: 30,
        source: 'manual',
        createdAt: '2026-03-05T20:00:00.000Z',
        updatedAt: '2026-03-05T20:00:00.000Z',
      },
    ],
    streak: { currentStreak: 5, bestStreak: 12, periodUnit: 'days' },
    consistency: { score: 94, rollingDays: 30, completionRate: 94, scheduledCount: 30, completedCount: 28, partialCount: 1, skippedCount: 1 },
    periodProgress: { percent: 100, isComplete: true, currentValue: 30, targetValue: 30 },
    todayOccurrence: { status: 'completed' },
    isLoading: false,
    refresh: vi.fn(),
  }),
}));

import { render, screen } from '../../../../../test/test-utils';
import { HabitDetailPage } from './HabitDetailPage';

describe('HabitDetailPage', () => {
  it('renders habit detail title, metrics, and actions', () => {
    render(<HabitDetailPage habitId="habit-1" />);

    expect(screen.getByRole('heading', { name: 'Ler 30 minutos' })).toBeInTheDocument();
    expect(screen.getByText('Leitura diária')).toBeInTheDocument();
    expect(screen.getByText('94%')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
