import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen, waitFor, within } from '../../../../../test/test-utils';
import { resetLeisureDb } from '../../services/leisureMockDb';
import { PlannerPage } from './PlannerPage';

describe('PlannerPage', () => {
  beforeEach(() => {
    resetLeisureDb();
  });

  it("shows the header and this week's plan by default", async () => {
    render(<PlannerPage />);
    expect(screen.getByRole('heading', { name: 'Planejamento', level: 1 })).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('O Hobbit')).toBeInTheDocument());
  });

  it('switches to the day view for just today', async () => {
    const user = userEvent.setup();
    render(<PlannerPage />);
    await waitFor(() => expect(screen.getByText('O Hobbit')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Hoje' }));
    await waitFor(() => expect(screen.getByText('O Hobbit')).toBeInTheDocument());
    expect(screen.getByText('Violão')).toBeInTheDocument();
  });

  it('plans a new activity', async () => {
    const user = userEvent.setup();
    render(<PlannerPage />);
    await waitFor(() => expect(screen.getByText('O Hobbit')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Planejar atividade' }));
    const dialog = await screen.findByRole('dialog', { name: 'Planejar atividade' });
    await user.type(within(dialog).getByLabelText('Título'), 'Ler mais um pouco');
    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(screen.getByText('Atividade planejada.')).toBeInTheDocument());
  });

  it('completes a plan entry', async () => {
    const user = userEvent.setup();
    render(<PlannerPage />);
    await waitFor(() => expect(screen.getByText('O Hobbit')).toBeInTheDocument());

    const row = screen.getByText('O Hobbit').closest('div')!.parentElement as HTMLElement;
    await user.click(within(row).getByRole('button', { name: 'Concluir' }));

    await waitFor(() => expect(screen.getByText('Planejamento concluído.')).toBeInTheDocument());
  });

  it('removes a plan entry after confirming', async () => {
    const user = userEvent.setup();
    render(<PlannerPage />);
    await waitFor(() => expect(screen.getByText('O Hobbit')).toBeInTheDocument());

    const row = screen.getByText('O Hobbit').closest('div')!.parentElement as HTMLElement;
    await user.click(within(row).getByRole('button', { name: 'Remover planejamento' }));

    const confirmDialog = await screen.findByRole('dialog', { name: 'Remover planejamento?' });
    await user.click(within(confirmDialog).getByRole('button', { name: 'Remover' }));

    await waitFor(() => expect(screen.getByText('Planejamento removido.')).toBeInTheDocument());
  });

  it('navigates to the next/previous week, changing the visible range heading', async () => {
    const user = userEvent.setup();
    render(<PlannerPage />);
    await waitFor(() => expect(screen.getByText('O Hobbit')).toBeInTheDocument());

    const initialHeading = screen.getByText(/ de /).textContent;
    await user.click(screen.getByRole('button', { name: 'Próxima semana' }));

    await waitFor(() => expect(screen.getByText(/ de /).textContent).not.toBe(initialHeading));
  });
});
