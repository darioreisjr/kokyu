import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@/../test/test-utils';
import type { ScheduleEntry } from '@/shared/scheduling/types';
import { ScheduleEntryCard } from './ScheduleEntryCard';

function createMockEntry(partial: Partial<ScheduleEntry>): ScheduleEntry {
  return {
    id: 'entry-1',
    sourceType: 'training',
    sourceId: 'train-101',
    title: 'Treino de Pernas',
    date: '2026-08-31',
    startAt: '19:00',
    endAt: '20:00',
    duration: 60,
    locked: true,
    status: 'planned',
    createdAt: '2026-08-31T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z',
    ...partial,
  };
}

describe('ScheduleEntryCard', () => {
  it('renders entry details and accessible label', () => {
    const entry = createMockEntry({ title: 'Push A' });
    render(<ScheduleEntryCard entry={entry} />);

    expect(screen.getByText('Push A')).toBeInTheDocument();
    expect(screen.getByText(/19:00 - 20:00/)).toBeInTheDocument();
    expect(screen.getByText('Treino')).toBeInTheDocument();

    const article = screen.getByRole('article');
    expect(article).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Treinamento: Push A, 19:00 - 20:00'),
    );
  });

  it('triggers onComplete when complete button is clicked', async () => {
    const onComplete = vi.fn();
    const entry = createMockEntry({ title: 'Hábito de Água', sourceType: 'habit' });
    render(<ScheduleEntryCard entry={entry} onComplete={onComplete} />);

    const completeBtn = screen.getByLabelText('Concluir Hábito de Água');
    fireEvent.click(completeBtn);

    expect(onComplete).toHaveBeenCalledWith(entry);
  });

  it('opens action menu on clicking menu trigger', () => {
    const entry = createMockEntry({ title: 'Compromisso' });
    render(<ScheduleEntryCard entry={entry} />);

    const menuTrigger = screen.getByLabelText('Ações para Compromisso');
    fireEvent.click(menuTrigger);

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Reagendar')).toBeInTheDocument();
  });
});

