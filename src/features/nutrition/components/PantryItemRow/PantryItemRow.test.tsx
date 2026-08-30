import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import type { Ingredient } from '../../types/ingredient.types';
import type { PantryItem } from '../../types/pantry.types';
import { PantryItemRow } from './PantryItemRow';

const ingredient: Ingredient = {
  id: 'leite',
  name: 'Leite',
  normalizedName: 'leite',
  category: 'laticinios',
  defaultUnit: 'ml',
};

function pantryItem(overrides: Partial<PantryItem> = {}): PantryItem {
  return {
    id: 'item-1',
    ingredientId: 'leite',
    quantity: 500,
    unit: 'ml',
    storageLocationId: 'geladeira',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('PantryItemRow', () => {
  it('shows the ingredient name, quantity and location', () => {
    render(
      <PantryItemRow
        item={pantryItem()}
        ingredient={ingredient}
        storageLocationName="Geladeira"
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onMarkOut={vi.fn()}
      />,
    );

    expect(screen.getByText('Leite')).toBeInTheDocument();
    expect(screen.getByText('500 ml · Geladeira')).toBeInTheDocument();
  });

  it('shows no freshness badge when there is no expiration date', () => {
    render(
      <PantryItemRow
        item={pantryItem()}
        ingredient={ingredient}
        storageLocationName="Geladeira"
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onMarkOut={vi.fn()}
      />,
    );

    expect(screen.queryByText('Válido')).not.toBeInTheDocument();
    expect(screen.queryByText('Vencido')).not.toBeInTheDocument();
  });

  it('shows "Vencido" for a past expiration date', () => {
    render(
      <PantryItemRow
        item={pantryItem({ expirationDate: '2020-01-01' })}
        ingredient={ingredient}
        storageLocationName="Geladeira"
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onMarkOut={vi.fn()}
      />,
    );

    expect(screen.getByText('Vencido')).toBeInTheDocument();
  });

  it('shows "Estoque baixo" when quantity is at or below the minimum', () => {
    render(
      <PantryItemRow
        item={pantryItem({ quantity: 100, minimumStock: 200 })}
        ingredient={ingredient}
        storageLocationName="Geladeira"
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onMarkOut={vi.fn()}
      />,
    );

    expect(screen.getByText('Estoque baixo')).toBeInTheDocument();
  });

  it('calls onRemove from the actions menu', async () => {
    const onRemove = vi.fn();
    render(
      <PantryItemRow
        item={pantryItem()}
        ingredient={ingredient}
        storageLocationName="Geladeira"
        onEdit={vi.fn()}
        onRemove={onRemove}
        onMarkOut={vi.fn()}
      />,
    );

    screen.getByRole('button', { name: 'Mais ações' }).click();
    (await screen.findByRole('menuitem', { name: 'Remover' })).click();
    expect(onRemove).toHaveBeenCalled();
  });
});
