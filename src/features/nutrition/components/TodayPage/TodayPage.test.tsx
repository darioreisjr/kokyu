import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen, waitFor, within } from '../../../../../test/test-utils';
import { resetNutritionDb } from '../../services/nutritionMockDb';
import { TodayPage } from './TodayPage';

describe('TodayPage', () => {
  beforeEach(() => {
    resetNutritionDb();
  });

  it("shows the header and loads today's meals", async () => {
    render(<TodayPage />);
    expect(screen.getByRole('heading', { name: 'Nutrição', level: 1 })).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('Refeições planejadas')).toBeInTheDocument());
    expect(screen.getByText('Café da manhã')).toBeInTheDocument();
    expect(screen.getByText('Almoço')).toBeInTheDocument();
  });

  it('opens "Adicionar refeição" for an empty slot and adds a note', async () => {
    const user = userEvent.setup();
    render(<TodayPage />);
    await waitFor(() => expect(screen.getByText('Ceia')).toBeInTheDocument());

    const ceiaCard = screen.getByText('Ceia').closest('li') as HTMLElement;
    await user.click(within(ceiaCard).getByRole('button', { name: 'Adicionar refeição' }));

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Adicionar anotação' }));
    await user.click(within(dialog).getByRole('button', { name: 'Livre' }));
    await user.click(within(dialog).getByRole('button', { name: 'Adicionar' }));

    await waitFor(() =>
      expect(screen.getByText('Refeição adicionada ao planejamento.')).toBeInTheDocument(),
    );
  });

  it('toggles the prepared indicator on a planned meal', async () => {
    const user = userEvent.setup();
    render(<TodayPage />);
    await waitFor(() => expect(screen.getByText('Almoço')).toBeInTheDocument());

    const almocoCard = screen.getByText('Almoço').closest('li') as HTMLElement;
    await user.click(within(almocoCard).getByRole('button', { name: 'Marcar como preparada' }));

    await waitFor(() =>
      expect(
        within(almocoCard).getByRole('button', { name: 'Marcar como não preparada' }),
      ).toBeInTheDocument(),
    );
  });

  it('removes a meal after confirming', async () => {
    const user = userEvent.setup();
    render(<TodayPage />);
    await waitFor(() => expect(screen.getByText('Almoço')).toBeInTheDocument());

    const almocoCard = screen.getByText('Almoço').closest('li') as HTMLElement;
    await user.click(within(almocoCard).getByRole('button', { name: 'Mais ações' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Remover' }));

    const confirmDialog = await screen.findByRole('dialog', { name: 'Remover refeição?' });
    await user.click(within(confirmDialog).getByRole('button', { name: 'Remover' }));

    await waitFor(() => expect(screen.getByText('Refeição removida.')).toBeInTheDocument());
  });

  it('opens the move dialog and moves a meal to a new time', async () => {
    const user = userEvent.setup();
    render(<TodayPage />);
    await waitFor(() => expect(screen.getByText('Almoço')).toBeInTheDocument());

    const almocoCard = screen.getByText('Almoço').closest('li') as HTMLElement;
    await user.click(within(almocoCard).getByRole('button', { name: 'Mais ações' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Mover para...' }));

    const moveDialog = await screen.findByRole('dialog', { name: 'Mover refeição' });
    await user.type(within(moveDialog).getByLabelText('Horário (opcional)'), '13:00');
    await user.click(within(moveDialog).getByRole('button', { name: 'Mover' }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Mover refeição' })).not.toBeInTheDocument(),
    );
  });
});
