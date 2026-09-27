import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiValidationError, VALIDATION_ERROR_MESSAGE } from '../../../../../test/apiErrors';
import { leisureItemService } from '../../services/leisureItemService';
import { render, screen, waitFor, within } from '../../../../../test/test-utils';
import { resetLeisureDb } from '../../services/leisureMockDb';
import { PlacesPage } from './PlacesPage';

describe('PlacesPage', () => {
  beforeEach(() => {
    resetLeisureDb();
  });

  it('shows the header and lists places and events only', async () => {
    render(<PlacesPage />);
    expect(
      screen.getByRole('heading', { name: 'Lugares & Passeios', level: 1 }),
    ).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('MASP')).toBeInTheDocument());
    expect(screen.getByText('Show da banda favorita')).toBeInTheDocument();
    expect(screen.queryByText('Interestelar')).not.toBeInTheDocument();
  });

  it('filters to visited places', async () => {
    const user = userEvent.setup();
    render(<PlacesPage />);
    await waitFor(() => expect(screen.getByText('MASP')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Visitado' }));
    await waitFor(() => expect(screen.queryByText('MASP')).not.toBeInTheDocument());
    expect(screen.getByText('Café Cantinho')).toBeInTheDocument();
  });

  it('plans a place', async () => {
    const user = userEvent.setup();
    render(<PlacesPage />);
    await waitFor(() => expect(screen.getByText('MASP')).toBeInTheDocument());

    const buttons = screen.getAllByRole('button', { name: 'Planejar' });
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

    await waitFor(() => expect(screen.getByText('Atividade planejada.')).toBeInTheDocument());
  });

  it('marks a place as visited', async () => {
    const user = userEvent.setup();
    render(<PlacesPage />);
    await waitFor(() => expect(screen.getByText('MASP')).toBeInTheDocument());

    const buttons = screen.getAllByRole('button', { name: 'Marcar visitado' });
    await user.click(buttons[0]!);
    const dialog = await screen.findByRole('dialog', { name: 'Registrar experiência' });
    await user.click(within(dialog).getByRole('button', { name: 'Registrar' }));

    await waitFor(() => expect(screen.getByText('Visita registrada.')).toBeInTheDocument());
  });

  it('adds a new place', async () => {
    const user = userEvent.setup();
    render(<PlacesPage />);
    await waitFor(() => expect(screen.getByText('MASP')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    const dialog = await screen.findByRole('dialog', { name: 'Novo item' });
    await user.click(within(dialog).getByLabelText('Tipo'));
    await user.click(screen.getByRole('option', { name: 'Lugar' }));
    await user.type(within(dialog).getByLabelText('Título'), 'Parque Ibirapuera');
    await user.click(within(dialog).getByLabelText('Categoria'));
    await user.click(screen.getByRole('option', { name: 'Parque' }));
    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(screen.getByText('Item salvo.')).toBeInTheDocument());
  });

  it('shows a pt-BR error and keeps the dialog open when the API rejects the place', async () => {
    const user = userEvent.setup();
    const createSpy = vi
      .spyOn(leisureItemService, 'createLeisureItem')
      .mockRejectedValueOnce(apiValidationError());
    render(<PlacesPage />);
    await waitFor(() => expect(screen.getByText('MASP')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    const dialog = await screen.findByRole('dialog', { name: 'Novo item' });
    await user.click(within(dialog).getByLabelText('Tipo'));
    await user.click(screen.getByRole('option', { name: 'Lugar' }));
    await user.type(within(dialog).getByLabelText('Título'), 'Parque Ibirapuera');
    await user.click(within(dialog).getByLabelText('Categoria'));
    await user.click(screen.getByRole('option', { name: 'Parque' }));
    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText(VALIDATION_ERROR_MESSAGE)).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Novo item' })).toBeInTheDocument();
    createSpy.mockRestore();
  });
});
