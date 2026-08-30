import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import type { Recipe } from '../../types/recipe.types';
import { RecipeCard } from './RecipeCard';

const recipe: Recipe = {
  id: 'recipe-1',
  name: 'Frango grelhado com arroz e feijão',
  category: 'almoco',
  tags: ['proteína', 'rápido'],
  preparationTime: 15,
  cookingTime: 30,
  servings: 4,
  ingredients: [],
  steps: [],
  favorite: true,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

describe('RecipeCard', () => {
  it('links to the recipe detail route', () => {
    render(<RecipeCard recipe={recipe} />);
    expect(
      screen.getByRole('link', { name: /Frango grelhado com arroz e feijão/ }),
    ).toHaveAttribute('href', '/app/nutricao/receitas/recipe-1');
  });

  it('shows category, total time and servings', () => {
    render(<RecipeCard recipe={recipe} />);
    expect(screen.getByText('Almoço · 45 min · 4 porções')).toBeInTheDocument();
  });

  it('marks a favorite recipe', () => {
    render(<RecipeCard recipe={recipe} />);
    expect(screen.getByLabelText('Favorita')).toBeInTheDocument();
  });

  it('does not show a favorite marker for a non-favorite recipe', () => {
    render(<RecipeCard recipe={{ ...recipe, favorite: false }} />);
    expect(screen.queryByLabelText('Favorita')).not.toBeInTheDocument();
  });
});
