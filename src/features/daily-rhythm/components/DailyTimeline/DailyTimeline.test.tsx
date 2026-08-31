import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { render } from '@/../test/test-utils';
import type { FreeTimeSlot, ScheduleEntry } from '@/shared/scheduling/types';
import { DailyTimeline } from './DailyTimeline';

const mockEntries: ScheduleEntry[] = [
  {
    id: 'e1',
    sourceType: 'training',
    sourceId: 't1',
    title: 'Treino A',
    date: '2026-08-31',
    startAt: '09:00',
    endAt: '10:00',
    duration: 60,
    locked: true,
    status: 'planned',
    createdAt: '2026-08-31T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z',
  },
];

const mockSlots: FreeTimeSlot[] = [
  {
    id: 'f1',
    date: '2026-08-31',
    startAt: '10:00',
    endAt: '11:30',
    duration: 90,
  },
];

describe('DailyTimeline', () => {
  it('renders entries and free slots', () => {
    render(
      <DailyTimeline
        date="2026-08-31"
        entries={mockEntries}
        freeSlots={mockSlots}
      />,
    );

    expect(screen.getByText('Treino A')).toBeInTheDocument();
    expect(screen.getByText(/10:00 - 11:30 \(1h 30min livres\)/)).toBeInTheDocument();
    expect(screen.getByText('Preencher este tempo')).toBeInTheDocument();
  });

  it('renders empty state when no stream items exist', () => {
    render(
      <DailyTimeline
        date="2026-08-31"
        entries={[]}
        freeSlots={[]}
      />,
    );

    expect(screen.getByText('Nenhum evento agendado para este dia')).toBeInTheDocument();
  });
});

