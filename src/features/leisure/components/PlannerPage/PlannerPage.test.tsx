import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen, waitFor, within } from '../../../../../test/test-utils';
import { leisurePlanService } from '../../services/leisurePlanService';
import { resetLeisureDb } from '../../services/leisureMockDb';
import { toDateKey } from '../../utils/dateHelpers';
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

  it("links \"Planejar atividade\" to the creation page, prefilled with today's date", async () => {
    render(<PlannerPage />);
    await waitFor(() => expect(screen.getByText('O Hobbit')).toBeInTheDocument());

    const link = screen.getByRole('link', { name: 'Planejar atividade' });
    expect(link.getAttribute('href')).toBe(
      `/app/tempo-livre/planejamento/nova?date=${toDateKey(new Date())}`,
    );
  });

  it('links a plan entry to its own edit page', async () => {
    render(<PlannerPage />);
    await waitFor(() => expect(screen.getByText('O Hobbit')).toBeInTheDocument());

    const link = screen.getByRole('link', { name: /O Hobbit/ });
    expect(link.getAttribute('href')).toBe('/app/tempo-livre/planejamento/plan-hobbit-hoje/editar');
  });

  it('completes a plan entry', async () => {
    const user = userEvent.setup();
    render(<PlannerPage />);
    await waitFor(() => expect(screen.getByText('O Hobbit')).toBeInTheDocument());

    const row = screen.getByText('O Hobbit').closest('a')!.parentElement as HTMLElement;
    await user.click(within(row).getByRole('button', { name: 'Concluir' }));

    await waitFor(() => expect(screen.getByText('Planejamento concluído.')).toBeInTheDocument());
  });

  it('removes a plan entry after confirming', async () => {
    const user = userEvent.setup();
    render(<PlannerPage />);
    await waitFor(() => expect(screen.getByText('O Hobbit')).toBeInTheDocument());

    const row = screen.getByText('O Hobbit').closest('a')!.parentElement as HTMLElement;
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

  it('a daily activity appears every day from today onward, and completing one day never completes the others', async () => {
    const user = userEvent.setup();
    // Creation itself now lives on a separate page (`/planejamento/nova`),
    // so seed it directly through the service — same as the real dialog's
    // "Salvar" would have — and exercise only what this page still owns:
    // showing occurrences and completing one day at a time.
    await leisurePlanService.createPlanEntry({
      title: 'Alongar',
      date: toDateKey(new Date()),
      recurrence: 'daily',
    });

    render(<PlannerPage />);

    // "Hoje" — the series' anchor day.
    await user.click(screen.getByRole('button', { name: 'Hoje' }));
    await waitFor(() => expect(screen.getByText('Alongar')).toBeInTheDocument());
    const todayRow = screen.getByText('Alongar').closest('a')!.parentElement as HTMLElement;
    await user.click(within(todayRow).getByRole('button', { name: 'Concluir' }));
    await waitFor(() => expect(screen.getByText('Planejamento concluído.')).toBeInTheDocument());
    await waitFor(() =>
      expect(
        within(screen.getByText('Alongar').closest('a')!.parentElement as HTMLElement).getByRole(
          'button',
          { name: 'Concluído' },
        ),
      ).toBeInTheDocument(),
    );

    // Tomorrow — still the same recurring series, but a fresh, unfinished occurrence.
    await user.click(screen.getByRole('button', { name: 'Próximo dia' }));
    await waitFor(() => expect(screen.getByText('Alongar')).toBeInTheDocument());
    const tomorrowRow = screen.getByText('Alongar').closest('a')!.parentElement as HTMLElement;
    expect(within(tomorrowRow).getByRole('button', { name: 'Concluir' })).toBeInTheDocument();
    expect(within(tomorrowRow).queryByRole('button', { name: 'Concluído' })).not.toBeInTheDocument();
  });
});
