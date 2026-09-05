import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '../../../../../test/test-utils';
import type { FreeTimeSlot, ScheduleEntry } from '@/shared/scheduling/types';
import { HomeNowCard } from './HomeNowCard';

const baseEntry: ScheduleEntry = {
  id: 'entry-1',
  sourceType: 'training',
  sourceId: 'training-1',
  title: 'Push A',
  date: '2026-09-04',
  startAt: '19:00',
  endAt: '20:00',
  duration: 60,
  status: 'planned',
  createdAt: '2026-09-04T00:00:00Z',
  updatedAt: '2026-09-04T00:00:00Z',
};

const freeSlot: FreeTimeSlot = { id: 'slot-1', date: '2026-09-04', startAt: '14:00', endAt: '14:45', duration: 45 };

function noop() {}
async function noopAsync() {}

describe('HomeNowCard', () => {
  it('shows the empty-day message with no CTA when there is no current entry and no free slot', () => {
    render(
      <HomeNowCard
        currentEntry={null}
        freeSlot={null}
        now={new Date('2026-09-04T12:00:00')}
        onComplete={noopAsync}
        onStartFocus={noop}
        onNavigate={noop}
        onOpenFreeTime={noop}
      />,
    );

    expect(screen.getByText('Nenhuma atividade planejada agora.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ver o que cabe aqui' })).not.toBeInTheDocument();
  });

  it('shows the free-time duration and a CTA when a free slot is available', () => {
    const onOpenFreeTime = vi.fn();
    render(
      <HomeNowCard
        currentEntry={null}
        freeSlot={freeSlot}
        now={new Date('2026-09-04T14:00:00')}
        onComplete={noopAsync}
        onStartFocus={noop}
        onNavigate={noop}
        onOpenFreeTime={onOpenFreeTime}
      />,
    );

    expect(screen.getByText(/45 min livres/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ver o que cabe aqui' }));
    expect(onOpenFreeTime).toHaveBeenCalledWith(freeSlot);
  });

  it('shows the current entry with its per-source primary action', () => {
    render(
      <HomeNowCard
        currentEntry={baseEntry}
        freeSlot={null}
        now={new Date('2026-09-04T19:30:00')}
        onComplete={noopAsync}
        onStartFocus={noop}
        onNavigate={noop}
        onOpenFreeTime={noop}
      />,
    );

    expect(screen.getByText('Push A')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar treino' })).toBeInTheDocument();
  });

  it('shows "Continuar treino" instead of "Iniciar treino" when a training session is already active', () => {
    render(
      <HomeNowCard
        currentEntry={baseEntry}
        freeSlot={null}
        now={new Date('2026-09-04T19:30:00')}
        trainingHasActiveSession
        onComplete={noopAsync}
        onStartFocus={noop}
        onNavigate={noop}
        onOpenFreeTime={noop}
      />,
    );

    expect(screen.getByRole('button', { name: 'Continuar treino' })).toBeInTheDocument();
  });
});
