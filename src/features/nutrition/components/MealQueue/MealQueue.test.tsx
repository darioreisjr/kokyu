import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import type { MealQueueEntry } from '../../types/mealPlan.types';
import type { Recipe } from '../../types/recipe.types';
import { MealQueue } from './MealQueue';

const recipe: Recipe = {
  id: 'recipe-1',
  name: 'Omelete com aveia',
  category: 'cafe-da-manha',
  tags: [],
  preparationTime: 5,
  cookingTime: 8,
  servings: 1,
  ingredients: [],
  steps: [],
  favorite: false,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

const entry: MealQueueEntry = {
  id: 'queue-1',
  recipeId: 'recipe-1',
  addedAt: '2026-08-20T00:00:00.000Z',
};

describe('MealQueue', () => {
  it('renders nothing when the queue is empty', () => {
    const { container } = render(
      <MealQueue queue={[]} recipes={[]} onAssign={vi.fn()} onRemove={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows each queued recipe by name', () => {
    render(<MealQueue queue={[entry]} recipes={[recipe]} onAssign={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('Omelete com aveia')).toBeInTheDocument();
  });

  it('calls onAssign / onRemove for the right entry', () => {
    const onAssign = vi.fn();
    const onRemove = vi.fn();
    render(
      <MealQueue queue={[entry]} recipes={[recipe]} onAssign={onAssign} onRemove={onRemove} />,
    );

    screen.getByRole('button', { name: 'Atribuir a um dia' }).click();
    expect(onAssign).toHaveBeenCalledWith(entry);

    screen.getByRole('button', { name: 'Remover da fila' }).click();
    expect(onRemove).toHaveBeenCalledWith(entry);
  });
});
