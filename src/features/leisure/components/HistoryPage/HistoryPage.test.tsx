import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { historyService } from '../../services/historyService';
import { resetLeisureDb } from '../../services/leisureMockDb';
import { HistoryPage } from './HistoryPage';

describe('HistoryPage', () => {
  beforeEach(() => {
    resetLeisureDb();
  });

  it('shows the header and existing log entries', async () => {
    render(<HistoryPage />);
    expect(screen.getByRole('heading', { name: 'Histórico', level: 1 })).toBeInTheDocument();

    await waitFor(() => expect(screen.getAllByText('Parasita')).toHaveLength(1));
  });

  it('filters by type', async () => {
    const user = userEvent.setup();
    render(<HistoryPage />);
    await waitFor(() => expect(screen.getByText('Parasita')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Filme' }));
    await waitFor(() => expect(screen.queryByText('Café Cantinho')).not.toBeInTheDocument());
    expect(screen.getByText('Parasita')).toBeInTheDocument();
  });

  it('filters to favorites', async () => {
    const user = userEvent.setup();
    render(<HistoryPage />);
    await waitFor(() => expect(screen.getByText('Café Cantinho')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Favoritos' }));
    // Café Cantinho is favorited in the mock library, Parasita is not.
    await waitFor(() => expect(screen.getByText('Café Cantinho')).toBeInTheDocument());
    expect(screen.queryByText('Parasita')).not.toBeInTheDocument();
  });

  it('allows the same item to appear more than once (rewatch), without duplicating the library item', async () => {
    await historyService.createLogEntry({
      leisureItemId: 'movie-parasita',
      activityType: 'movie',
      title: 'Parasita',
      completedAt: '2030-01-01T20:00:00.000Z',
    });

    render(<HistoryPage />);
    await waitFor(() => expect(screen.getAllByText('Parasita')).toHaveLength(2));
  });

  it('shows a rating when the log entry has one', async () => {
    render(<HistoryPage />);
    await waitFor(() => expect(screen.getByText('Parasita')).toBeInTheDocument());
    expect(screen.getByRole('img', { name: '5 de 5 estrelas' })).toBeInTheDocument();
  });
});
