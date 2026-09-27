import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiValidationError, VALIDATION_ERROR_MESSAGE } from '../../../../../test/apiErrors';
import { render, screen, waitFor, within } from '../../../../../test/test-utils';
import { historyService } from '../../services/historyService';
import { leisureRoutes } from '../../constants/leisureRoutes';
import { leisurePlanService } from '../../services/leisurePlanService';
import { resetLeisureDb } from '../../services/leisureMockDb';
import { HobbiesPage } from './HobbiesPage';

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('HobbiesPage', () => {
  beforeEach(() => {
    resetLeisureDb();
    mockPush.mockClear();
  });

  it('shows the header and lists hobbies only', async () => {
    render(<HobbiesPage />);
    expect(screen.getByRole('heading', { name: 'Hobbies', level: 1 })).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('Violão')).toBeInTheDocument());
    expect(screen.getByText('Fotografia')).toBeInTheDocument();
    expect(screen.queryByText('Interestelar')).not.toBeInTheDocument();
  });

  it('plans a session', async () => {
    const user = userEvent.setup();
    render(<HobbiesPage />);
    await waitFor(() => expect(screen.getByText('Violão')).toBeInTheDocument());

    const buttons = screen.getAllByRole('button', { name: 'Planejar sessão' });
    await user.click(buttons[0]!);
    const dialog = await screen.findByRole('dialog', { name: 'Planejar atividade' });
    // A future date so the "not in the past" rule can't make startTime/
    // endTime flaky depending on what time of day this test happens to run.
    const dayGroup = within(dialog).getByRole('group', { name: 'Dia' });
    await user.click(dayGroup.querySelector('[aria-label="Day"]') as HTMLElement);
    await user.paste('01/01/2030');
    fireEvent.change(within(dialog).getByLabelText('Início'), { target: { value: '19:00' } });
    fireEvent.change(within(dialog).getByLabelText('Fim'), { target: { value: '20:00' } });
    await user.type(within(dialog).getByLabelText('Duração em minutos'), '60');
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Salvar' })).toBeEnabled(),
    );
    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(screen.getByText('Sessão planejada.')).toBeInTheDocument());
  });

  it("logs a session without changing the hobby's status away from in-progress", async () => {
    const user = userEvent.setup();
    render(<HobbiesPage />);
    await waitFor(() => expect(screen.getByText('Violão')).toBeInTheDocument());

    const buttons = screen.getAllByRole('button', { name: 'Registrar sessão' });
    await user.click(buttons[0]!);
    const dialog = await screen.findByRole('dialog', { name: 'Registrar experiência' });
    await user.click(within(dialog).getByRole('button', { name: 'Registrar' }));

    await waitFor(() => expect(screen.getByText('Sessão registrada.')).toBeInTheDocument());
    const history = await historyService.getHistory();
    expect(history.some((entry) => entry.leisureItemId === 'hobby-violao')).toBe(true);
  });

  it('opens the new-hobby page from Adicionar instead of a dialog', async () => {
    const user = userEvent.setup();
    render(<HobbiesPage />);
    await waitFor(() => expect(screen.getByText('Violão')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(mockPush).toHaveBeenCalledWith(leisureRoutes.hobbyNew);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows a pt-BR error and keeps the dialog open when planning a session fails', async () => {
    const user = userEvent.setup();
    const planSpy = vi
      .spyOn(leisurePlanService, 'createPlanEntry')
      .mockRejectedValueOnce(apiValidationError());
    render(<HobbiesPage />);
    await waitFor(() => expect(screen.getByText('Violão')).toBeInTheDocument());

    const buttons = screen.getAllByRole('button', { name: 'Planejar sessão' });
    await user.click(buttons[0]!);
    const dialog = await screen.findByRole('dialog', { name: 'Planejar atividade' });
    const dayGroup = within(dialog).getByRole('group', { name: 'Dia' });
    await user.click(dayGroup.querySelector('[aria-label="Day"]') as HTMLElement);
    await user.paste('01/01/2030');
    fireEvent.change(within(dialog).getByLabelText('Início'), { target: { value: '19:00' } });
    fireEvent.change(within(dialog).getByLabelText('Fim'), { target: { value: '20:00' } });
    await user.type(within(dialog).getByLabelText('Duração em minutos'), '60');
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Salvar' })).toBeEnabled(),
    );
    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText(VALIDATION_ERROR_MESSAGE)).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Planejar atividade' })).toBeInTheDocument();
    planSpy.mockRestore();
  });
});
