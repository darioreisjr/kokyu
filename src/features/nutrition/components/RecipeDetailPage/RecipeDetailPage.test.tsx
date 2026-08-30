import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen, waitFor, within } from '../../../../../test/test-utils';
import { resetNutritionDb } from '../../services/nutritionMockDb';
import { RecipeDetailPage } from './RecipeDetailPage';

describe('RecipeDetailPage', () => {
  beforeEach(() => {
    resetNutritionDb();
  });

  it('shows the recipe name, time, servings and ingredients', async () => {
    render(<RecipeDetailPage recipeId="frango-arroz-feijao" />);
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Frango grelhado com arroz e feijão' }),
      ).toBeInTheDocument(),
    );

    expect(
      screen.getByText(/Preparo 15 min · Cozimento 30 min · Total 45 min/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Peito de frango/)).toBeInTheDocument();
    expect(
      screen.getByText('Tempere o frango com sal e metade do alho picado.'),
    ).toBeInTheDocument();
  });

  it('shows a "not found" message for an unknown recipe', async () => {
    render(<RecipeDetailPage recipeId="does-not-exist" />);
    await waitFor(() => expect(screen.getByText('Receita não encontrada.')).toBeInTheDocument());
  });

  it('toggles favorite', async () => {
    const user = userEvent.setup();
    render(<RecipeDetailPage recipeId="omelete-aveia" />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Omelete com aveia' })).toBeInTheDocument(),
    );

    const favoriteButton = screen.getByRole('button', { name: 'Favoritar' });
    await user.click(favoriteButton);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Remover dos favoritos' })).toBeInTheDocument(),
    );
  });

  it('rescales ingredient quantities without mutating the stored recipe', async () => {
    const user = userEvent.setup();
    render(<RecipeDetailPage recipeId="frango-arroz-feijao" />);
    await waitFor(() => expect(screen.getByText(/600.*Peito de frango/)).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: '2x' }));
    await waitFor(() => expect(screen.getByText(/1\.200.*Peito de frango/)).toBeInTheDocument());
    expect(screen.getByText('8 porções')).toBeInTheDocument();
  });

  it('adds the recipe to the plan', async () => {
    const user = userEvent.setup();
    render(<RecipeDetailPage recipeId="macarrao-molho-tomate" />);
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Macarrão ao molho de tomate' }),
      ).toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: 'Adicionar ao planejamento' }));
    const dialog = await screen.findByRole('dialog', { name: 'Adicionar ao planejamento' });
    await user.click(within(dialog).getByRole('button', { name: 'Adicionar' }));

    await waitFor(() =>
      expect(screen.getByText('Receita adicionada ao planejamento.')).toBeInTheDocument(),
    );
  });

  it('links "Editar" to the recipe edit route', async () => {
    render(<RecipeDetailPage recipeId="pao-com-ovo" />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Pão com ovo e café' })).toBeInTheDocument(),
    );
    expect(screen.getByRole('link', { name: /Editar/ })).toHaveAttribute(
      'href',
      '/app/nutricao/receitas/pao-com-ovo/editar',
    );
  });
});
