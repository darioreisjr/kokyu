import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor, within } from '../../../../../test/test-utils';
import { leisureItemService } from '../../services/leisureItemService';
import { resetLeisureDb } from '../../services/leisureMockDb';
import { LaterPage } from './LaterPage';

describe('LaterPage', () => {
  beforeEach(() => {
    resetLeisureDb();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the empty state when there is nothing unsorted', async () => {
    render(<LaterPage />);
    await waitFor(() => expect(screen.getByText('Sua lista está vazia.')).toBeInTheDocument());
  });

  it('lists an unsorted item and lets it be organized into a real type', async () => {
    const user = userEvent.setup();
    await leisureItemService.createLeisureItem({
      title: 'Restaurante que o Bruno indicou',
      type: 'unsorted',
      status: 'backlog',
      tags: [],
      favorite: false,
      durationType: 'unknown',
      unsorted: {},
    });

    render(<LaterPage />);
    await waitFor(() =>
      expect(screen.getByText('Restaurante que o Bruno indicou')).toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: 'Organizar' }));
    const dialog = await screen.findByRole('dialog');
    // MUI's Select popup renders in a portal, outside the dialog's own DOM subtree.
    await user.click(within(dialog).getByLabelText('Tipo'));
    await user.click(screen.getByRole('option', { name: 'Lugar' }));
    await user.click(within(dialog).getByLabelText('Categoria'));
    await user.click(screen.getByRole('option', { name: 'Restaurante' }));
    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(screen.getByText('Item organizado.')).toBeInTheDocument());
    const item = await leisureItemService.getLeisureItem(
      (await leisureItemService.getLeisureItems()).find(
        (entry) => entry.title === 'Restaurante que o Bruno indicou',
      )!.id,
    );
    expect(item?.type).toBe('place');
  });

  it('starts an item directly from the row menu', async () => {
    const user = userEvent.setup();
    await leisureItemService.createLeisureItem({
      title: 'Novo podcast',
      type: 'unsorted',
      status: 'backlog',
      tags: [],
      favorite: false,
      durationType: 'unknown',
      unsorted: {},
    });

    render(<LaterPage />);
    await waitFor(() => expect(screen.getByText('Novo podcast')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Mais ações' }));
    await user.click(await screen.findByRole('menuitem', { name: /Iniciar/ }));

    await waitFor(() => expect(screen.getByText('Atividade iniciada.')).toBeInTheDocument());
  });

  it('plans an item directly from the row menu, with a usable default date', async () => {
    // Fixed, well-into-the-morning "now" so the dialog's default date
    // (today) stays usable as-is, and Início/Fim below are deterministically
    // "later today" regardless of the real wall-clock time this test runs at.
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2030-01-01T08:00:00'));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await leisureItemService.createLeisureItem({
      title: 'Sessão de leitura',
      type: 'unsorted',
      status: 'backlog',
      tags: [],
      favorite: false,
      durationType: 'unknown',
      unsorted: {},
    });

    render(<LaterPage />);
    await waitFor(() => expect(screen.getByText('Sessão de leitura')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Mais ações' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Planejar' }));
    const dialog = await screen.findByRole('dialog', { name: 'Planejar atividade' });
    fireEvent.change(within(dialog).getByLabelText('Início'), { target: { value: '20:00' } });
    fireEvent.change(within(dialog).getByLabelText('Fim'), { target: { value: '21:00' } });
    await user.type(within(dialog).getByLabelText('Duração em minutos'), '60');
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Salvar' })).toBeEnabled(),
    );
    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(screen.getByText('Atividade planejada.')).toBeInTheDocument());
  });

  it('archives an item from the row menu', async () => {
    const user = userEvent.setup();
    await leisureItemService.createLeisureItem({
      title: 'Vídeo interessante',
      type: 'unsorted',
      status: 'backlog',
      tags: [],
      favorite: false,
      durationType: 'unknown',
      unsorted: {},
    });

    render(<LaterPage />);
    await waitFor(() => expect(screen.getByText('Vídeo interessante')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Mais ações' }));
    await user.click(await screen.findByRole('menuitem', { name: /Arquivar/ }));

    await waitFor(() => expect(screen.getByText('Item arquivado.')).toBeInTheDocument());
  });

  it('deletes an item after confirming', async () => {
    const user = userEvent.setup();
    await leisureItemService.createLeisureItem({
      title: 'Link qualquer',
      type: 'unsorted',
      status: 'backlog',
      tags: [],
      favorite: false,
      durationType: 'unknown',
      unsorted: {},
    });

    render(<LaterPage />);
    await waitFor(() => expect(screen.getByText('Link qualquer')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Mais ações' }));
    await user.click(await screen.findByRole('menuitem', { name: /Excluir/ }));

    const confirmDialog = await screen.findByRole('dialog', { name: 'Excluir item?' });
    await user.click(within(confirmDialog).getByRole('button', { name: 'Excluir' }));

    await waitFor(() => expect(screen.getByText('Item excluído.')).toBeInTheDocument());
  });

  it('quick-captures a new item', async () => {
    const user = userEvent.setup();
    render(<LaterPage />);
    await waitFor(() => expect(screen.getByText('Sua lista está vazia.')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Guardar para depois' }));
    const dialog = await screen.findByRole('dialog', { name: 'Guardar para depois' });
    await user.type(within(dialog).getByLabelText('Título'), 'Algo novo');
    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(screen.getByText('Adicionado para depois.')).toBeInTheDocument());
  });
});
