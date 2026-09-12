import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor, within } from '../../../../../test/test-utils';
import { leisurePlanService } from '../../services/leisurePlanService';
import { resetLeisureDb } from '../../services/leisureMockDb';
import { toDateKey } from '../../utils/dateHelpers';
import { PlannerPage } from './PlannerPage';

describe('PlannerPage', () => {
  beforeEach(() => {
    resetLeisureDb();
  });

  afterEach(() => {
    vi.useRealTimers();
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

  it('opens a read-only detail dialog when a plan entry card is clicked, with an Editar link to the edit page', async () => {
    const user = userEvent.setup();
    render(<PlannerPage />);
    await waitFor(() => expect(screen.getByText('O Hobbit')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /Ver detalhes de O Hobbit/ }));

    const dialog = await screen.findByRole('dialog', { name: 'O Hobbit' });
    expect(within(dialog).getByText('Dia')).toBeInTheDocument();
    const editLink = within(dialog).getByRole('link', { name: 'Editar' });
    expect(editLink.getAttribute('href')).toBe('/app/tempo-livre/planejamento/plan-hobbit-hoje/editar');

    await user.click(within(dialog).getByRole('button', { name: 'Fechar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('has no delete action on a plan entry card', async () => {
    render(<PlannerPage />);
    await waitFor(() => expect(screen.getByText('O Hobbit')).toBeInTheDocument());

    expect(
      screen.queryByRole('button', { name: 'Remover planejamento' }),
    ).not.toBeInTheDocument();
  });

  it('completes a plan entry', async () => {
    const user = userEvent.setup();
    render(<PlannerPage />);
    await waitFor(() => expect(screen.getByText('O Hobbit')).toBeInTheDocument());

    const row = screen.getByText('O Hobbit').closest('button')!.parentElement as HTMLElement;
    await user.click(within(row).getByRole('button', { name: 'Concluir' }));

    await waitFor(() => expect(screen.getByText('Planejamento concluído.')).toBeInTheDocument());
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
    const todayRow = screen.getByText('Alongar').closest('button')!.parentElement as HTMLElement;
    await user.click(within(todayRow).getByRole('button', { name: 'Concluir' }));
    await waitFor(() => expect(screen.getByText('Planejamento concluído.')).toBeInTheDocument());
    await waitFor(() =>
      expect(
        within(
          screen.getByText('Alongar').closest('button')!.parentElement as HTMLElement,
        ).getByRole('button', { name: 'Concluído' }),
      ).toBeInTheDocument(),
    );

    // Tomorrow — still the same recurring series, a fresh unfinished
    // occurrence, but not completable from here: only today's row gets a
    // Concluir button.
    await user.click(screen.getByRole('button', { name: 'Próximo dia' }));
    await waitFor(() => expect(screen.getByText('Alongar')).toBeInTheDocument());
    const tomorrowRow = screen.getByText('Alongar').closest('button')!.parentElement as HTMLElement;
    expect(within(tomorrowRow).queryByRole('button', { name: 'Concluir' })).not.toBeInTheDocument();
    expect(within(tomorrowRow).queryByRole('button', { name: 'Concluído' })).not.toBeInTheDocument();
  });

  it('only shows Concluir on the card whose occurrence date is today', async () => {
    // Fixed mid-week "now" — the mock's "upcoming Saturday" for
    // Interestelar would otherwise jump into next week whenever this
    // suite happens to run on a Saturday, taking the card off-screen.
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-06-17T10:00:00'));
    resetLeisureDb();

    render(<PlannerPage />);
    await waitFor(() => expect(screen.getByText('Interestelar')).toBeInTheDocument());

    // "Interestelar" is planned for the upcoming Saturday (see
    // `createMockLeisurePlan`) — never today's own row in this suite.
    const futureRow = screen.getByText('Interestelar').closest('button')!
      .parentElement as HTMLElement;
    expect(within(futureRow).queryByRole('button', { name: 'Concluir' })).not.toBeInTheDocument();
    expect(within(futureRow).queryByRole('button', { name: 'Concluído' })).not.toBeInTheDocument();

    // "O Hobbit" is today's own occurrence — still completable.
    const todayRow = screen.getByText('O Hobbit').closest('button')!.parentElement as HTMLElement;
    expect(within(todayRow).getByRole('button', { name: 'Concluir' })).toBeInTheDocument();
  });

  it('shows "Nenhum planejamento arquivado." in the Arquivados tab when there is nothing archived', async () => {
    const user = userEvent.setup();
    render(<PlannerPage />);
    await waitFor(() => expect(screen.getByText('O Hobbit')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Arquivados' }));
    await waitFor(() =>
      expect(screen.getByText('Nenhum planejamento arquivado.')).toBeInTheDocument(),
    );
  });

  it('archiving a card removes it from the week view and lists it under Arquivados, and Desarquivar brings it back', async () => {
    const user = userEvent.setup();
    render(<PlannerPage />);
    await waitFor(() => expect(screen.getByText('O Hobbit')).toBeInTheDocument());

    // Archive "O Hobbit" from its detail dialog's Editar page isn't
    // exercised here (that's PlanEntryFormPage's own test) — seed the
    // archive directly through the service, same as the real "Arquivar"
    // button would have done, and check what this page does with it.
    await leisurePlanService.archivePlanEntry('plan-hobbit-hoje');

    await user.click(screen.getByRole('button', { name: 'Arquivados' }));
    await waitFor(() => expect(screen.getByText('O Hobbit')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Desarquivar' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Desarquivar' }));
    await waitFor(() => expect(screen.getByText('Planejamento desarquivado.')).toBeInTheDocument());
    await waitFor(() =>
      expect(screen.getByText('Nenhum planejamento arquivado.')).toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: 'Semana' }));
    await waitFor(() => expect(screen.getByText('O Hobbit')).toBeInTheDocument());
  });

  it('opens the detail dialog from the Arquivados tab, with Desarquivar instead of Editar', async () => {
    const user = userEvent.setup();
    await leisurePlanService.archivePlanEntry('plan-hobbit-hoje');
    render(<PlannerPage />);

    await user.click(screen.getByRole('button', { name: 'Arquivados' }));
    await waitFor(() => expect(screen.getByText('O Hobbit')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /Ver detalhes de O Hobbit/ }));
    const dialog = await screen.findByRole('dialog', { name: 'O Hobbit' });
    expect(within(dialog).getByText('Arquivado')).toBeInTheDocument();
    expect(within(dialog).queryByRole('link', { name: 'Editar' })).not.toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Desarquivar' }));
    await waitFor(() => expect(screen.getByText('Planejamento desarquivado.')).toBeInTheDocument());
  });
});
