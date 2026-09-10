import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { resetLeisureDb } from '../../services/leisureMockDb';
import { PlanEntryEditPage } from './PlanEntryEditPage';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('PlanEntryEditPage', () => {
  beforeEach(() => {
    resetLeisureDb();
  });

  it('loads the entry by id and prefills the edit form', async () => {
    render(<PlanEntryEditPage planEntryId="plan-hobbit-hoje" />);

    expect(await screen.findByRole('heading', { name: 'Editar planejamento' })).toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toHaveValue('O Hobbit');
  });

  it('shows an error state when the entry cannot be found', async () => {
    render(<PlanEntryEditPage planEntryId="missing-entry" />);

    expect(
      await screen.findByText('Não foi possível carregar este planejamento agora. Tente novamente.'),
    ).toBeInTheDocument();
  });
});
