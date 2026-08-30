import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import type { PlannedMeal } from '../../types/mealPlan.types';
import type { Recipe } from '../../types/recipe.types';
import { PlannerMealChip } from './PlannerMealChip';

describe('PlannerMealChip', () => {
  it('shows "+ Adicionar" for an empty slot and calls onClick', () => {
    const onClick = vi.fn();
    render(<PlannerMealChip onClick={onClick} />);
    expect(screen.getByText('+ Adicionar')).toBeInTheDocument();
    screen.getByRole('button').click();
    expect(onClick).toHaveBeenCalled();
  });

  it('shows the recipe name for a recipe meal', () => {
    const meal: PlannedMeal = {
      id: 'meal-1',
      date: '2026-08-29',
      mealTypeId: 'almoco',
      contentType: 'recipe',
      recipeId: 'recipe-1',
      servings: 2,
      prepared: false,
      createdAt: '2026-08-29T00:00:00.000Z',
    };
    const recipe: Recipe = {
      id: 'recipe-1',
      name: 'Frango grelhado',
      category: 'almoco',
      tags: [],
      preparationTime: 10,
      cookingTime: 20,
      servings: 4,
      ingredients: [],
      steps: [],
      favorite: false,
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
    };
    render(<PlannerMealChip meal={meal} recipe={recipe} onClick={vi.fn()} />);
    expect(screen.getByText('Frango grelhado')).toBeInTheDocument();
  });

  it('shows the note text for a note meal', () => {
    const meal: PlannedMeal = {
      id: 'meal-2',
      date: '2026-08-29',
      mealTypeId: 'almoco',
      contentType: 'note',
      note: 'Almoçar fora',
      prepared: false,
      createdAt: '2026-08-29T00:00:00.000Z',
    };
    render(<PlannerMealChip meal={meal} onClick={vi.fn()} />);
    expect(screen.getByText('Almoçar fora')).toBeInTheDocument();
  });

  it('shows a generic label for a food meal', () => {
    const meal: PlannedMeal = {
      id: 'meal-3',
      date: '2026-08-29',
      mealTypeId: 'almoco',
      contentType: 'food',
      foodItems: [{ ingredientId: 'banana', quantity: 1, unit: 'unidade' }],
      prepared: false,
      createdAt: '2026-08-29T00:00:00.000Z',
    };
    render(<PlannerMealChip meal={meal} onClick={vi.fn()} />);
    expect(screen.getByText('Alimento')).toBeInTheDocument();
  });
});
