import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen, waitFor, within } from '../../../../../test/test-utils';
import { resetLeisureDb } from '../../services/leisureMockDb';
import { TodayPage } from './TodayPage';

describe('TodayPage', () => {
  beforeEach(() => {
    resetLeisureDb();
  });

  it("shows the header and today's plan", async () => {
    render(<TodayPage />);
    expect(screen.getByRole('heading', { name: 'Tempo Livre', level: 1 })).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('Planejado para hoje')).toBeInTheDocument());
    const planSection = screen.getByText('Planejado para hoje').closest('div') as HTMLElement;
    expect(within(planSection).getByText('O Hobbit')).toBeInTheDocument();
  });

  it('shows items in progress', async () => {
    render(<TodayPage />);
    await waitFor(() => expect(screen.getByText('Em andamento')).toBeInTheDocument());
    expect(screen.getByText('Fronteiras do Amanhã')).toBeInTheDocument();
  });

  it('completes a planned entry', async () => {
    const user = userEvent.setup();
    render(<TodayPage />);
    await waitFor(() => expect(screen.getByText('Planejado para hoje')).toBeInTheDocument());

    const planSection = screen.getByText('Planejado para hoje').closest('div') as HTMLElement;
    const row = within(planSection).getByText('O Hobbit').closest('div')!
      .parentElement as HTMLElement;
    await user.click(within(row).getByRole('button', { name: 'Concluir' }));

    await waitFor(() => expect(screen.getByText('Planejamento concluído.')).toBeInTheDocument());
  });

  it('surfaces "O que cabe agora?" suggestions', async () => {
    const user = userEvent.setup();
    render(<TodayPage />);
    await waitFor(() => expect(screen.getByText('O que cabe agora?')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: '15 min' }));
    expect(screen.getByText('Puzzle Rápido')).toBeInTheDocument();
  });

  it('starts a suggested activity, marking it in progress', async () => {
    const user = userEvent.setup();
    render(<TodayPage />);
    await waitFor(() => expect(screen.getByText('O que cabe agora?')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: '15 min' }));
    const card = screen.getByRole('link', { name: /Puzzle Rápido/ });
    const row = card.parentElement!.parentElement as HTMLElement;
    await user.click(within(row).getByRole('button', { name: 'Começar' }));

    await waitFor(() => expect(screen.getByText('Atividade iniciada.')).toBeInTheDocument());
  });

  it('quick-captures a "para depois" item with no type', async () => {
    const user = userEvent.setup();
    render(<TodayPage />);
    await waitFor(() => expect(screen.getByText('Planejado para hoje')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    await user.click(screen.getByRole('menuitem', { name: 'Item para depois' }));
    const dialog = await screen.findByRole('dialog', { name: 'Guardar para depois' });
    await user.type(within(dialog).getByLabelText('Título'), 'Restaurante indicado');
    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(screen.getByText('Adicionado para depois.')).toBeInTheDocument());
  });

  it('creates a note from the add menu', async () => {
    const user = userEvent.setup();
    render(<TodayPage />);
    await waitFor(() => expect(screen.getByText('Planejado para hoje')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    await user.click(screen.getByRole('menuitem', { name: 'Nota' }));
    const dialog = await screen.findByRole('dialog', { name: 'Nova nota' });
    await user.type(within(dialog).getByLabelText('Conteúdo'), 'Lembrar de comprar cordas.');
    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(screen.getByText('Nota salva.')).toBeInTheDocument());
  });

  it('creates a new item via a type shortcut', async () => {
    const user = userEvent.setup();
    render(<TodayPage />);
    await waitFor(() => expect(screen.getByText('Planejado para hoje')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    await user.click(screen.getByRole('menuitem', { name: 'Livro' }));
    const dialog = await screen.findByRole('dialog', { name: 'Novo item' });
    await user.type(within(dialog).getByLabelText('Título'), 'Novo Livro');
    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(screen.getByText('Item salvo.')).toBeInTheDocument());
  });
});
