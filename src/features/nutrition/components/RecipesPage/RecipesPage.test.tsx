import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen, waitFor } from '../../../../../test/test-utils';
import { resetNutritionDb } from '../../services/nutritionMockDb';
import { RecipesPage } from './RecipesPage';

describe('RecipesPage', () => {
  beforeEach(() => {
    resetNutritionDb();
  });

  it('shows the header and lists every recipe', async () => {
    render(<RecipesPage />);
    expect(screen.getByRole('heading', { name: 'Receitas', level: 1 })).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText('Frango grelhado com arroz e feijão')).toBeInTheDocument(),
    );
    expect(screen.getByText('Macarrão ao molho de tomate')).toBeInTheDocument();
  });

  it('links "Nova receita" to the create route', async () => {
    render(<RecipesPage />);
    await waitFor(() =>
      expect(screen.getByText('Frango grelhado com arroz e feijão')).toBeInTheDocument(),
    );
    expect(screen.getByRole('link', { name: 'Nova receita' })).toHaveAttribute(
      'href',
      '/app/nutricao/receitas/nova',
    );
  });

  it('filters to favorites only', async () => {
    const user = userEvent.setup();
    render(<RecipesPage />);
    await waitFor(() => expect(screen.getByText('Omelete com aveia')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Favoritas' }));
    await waitFor(() => expect(screen.queryByText('Omelete com aveia')).not.toBeInTheDocument());
    expect(screen.getByText('Frango grelhado com arroz e feijão')).toBeInTheDocument();
  });

  it('searches by name', async () => {
    const user = userEvent.setup();
    render(<RecipesPage />);
    await waitFor(() => expect(screen.getByText('Omelete com aveia')).toBeInTheDocument());

    await user.type(screen.getByLabelText('Buscar receitas'), 'banana');
    await waitFor(() => expect(screen.queryByText('Omelete com aveia')).not.toBeInTheDocument());
    expect(screen.getByText('Banana com aveia e iogurte')).toBeInTheDocument();
  });

  it('shows "O que posso preparar?" grouped by availability', async () => {
    const user = userEvent.setup();
    render(<RecipesPage />);
    await waitFor(() => expect(screen.getByText('Omelete com aveia')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'O que posso preparar?' }));
    await waitFor(() => expect(screen.getByText('Tenho tudo')).toBeInTheDocument());
    expect(screen.getByText('Falta pouco')).toBeInTheDocument();
  });
});
