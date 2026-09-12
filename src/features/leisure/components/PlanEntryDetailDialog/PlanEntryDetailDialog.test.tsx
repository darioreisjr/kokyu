import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import type { LeisurePlanEntry } from '../../types/leisurePlan.types';
import { PlanEntryDetailDialog } from './PlanEntryDetailDialog';

function buildEntry(overrides: Partial<LeisurePlanEntry> = {}): LeisurePlanEntry {
  return {
    id: 'plan-violao-hoje',
    leisureItemId: 'hobby-violao',
    title: 'Violão',
    date: '2030-01-01',
    occurrenceDate: '2030-01-01',
    startTime: '19:00',
    endTime: '19:45',
    duration: 45,
    completed: false,
    archived: false,
    createdAt: '2030-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('PlanEntryDetailDialog', () => {
  it('renders nothing open when entry is null', () => {
    render(<PlanEntryDetailDialog entry={null} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows an Editar link for an active entry, not Desarquivar', async () => {
    render(<PlanEntryDetailDialog entry={buildEntry()} onClose={vi.fn()} />);

    const dialog = await screen.findByRole('dialog', { name: 'Violão' });
    expect(screen.getByRole('link', { name: 'Editar' }).getAttribute('href')).toBe(
      '/app/tempo-livre/planejamento/plan-violao-hoje/editar',
    );
    expect(screen.queryByRole('button', { name: 'Desarquivar' })).not.toBeInTheDocument();
    expect(dialog).toBeInTheDocument();
  });

  it('shows Desarquivar (not Editar) and "Arquivado" status for an archived entry', async () => {
    const onUnarchive = vi.fn();
    const archivedEntry = buildEntry({ archived: true });
    render(
      <PlanEntryDetailDialog entry={archivedEntry} onClose={vi.fn()} onUnarchive={onUnarchive} />,
    );

    await screen.findByRole('dialog', { name: 'Violão' });
    expect(screen.getByText('Arquivado')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Editar' })).not.toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Desarquivar' }));
    expect(onUnarchive).toHaveBeenCalledWith(archivedEntry);
  });

  it('closes via Fechar', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<PlanEntryDetailDialog entry={buildEntry()} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalled();
  });
});
