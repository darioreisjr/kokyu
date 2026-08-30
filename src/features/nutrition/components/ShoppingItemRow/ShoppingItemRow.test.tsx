import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import type { Ingredient } from '../../types/ingredient.types';
import type { ShoppingItem } from '../../types/shopping.types';
import { ShoppingItemRow } from './ShoppingItemRow';

const ingredient: Ingredient = {
  id: 'arroz',
  name: 'Arroz branco',
  normalizedName: 'arroz branco',
  category: 'graos',
  defaultUnit: 'g',
};

function shoppingItem(overrides: Partial<ShoppingItem> = {}): ShoppingItem {
  return {
    id: 'item-1',
    ingredientId: 'arroz',
    quantity: 700,
    unit: 'g',
    category: 'graos',
    checked: false,
    source: 'meal-plan',
    createdAt: '2026-08-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('ShoppingItemRow', () => {
  it('shows the ingredient name, quantity and source', () => {
    render(<ShoppingItemRow item={shoppingItem()} ingredient={ingredient} onToggle={vi.fn()} />);
    expect(screen.getByText('Arroz branco')).toBeInTheDocument();
    expect(screen.getByText('700 g · Do planejamento')).toBeInTheDocument();
  });

  it('shows a generic item by its own name when there is no ingredient', () => {
    render(
      <ShoppingItemRow
        item={shoppingItem({ ingredientId: undefined, name: 'Guardanapo', source: 'manual' })}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByText('Guardanapo')).toBeInTheDocument();
    expect(screen.getByText('700 g')).toBeInTheDocument();
  });

  it('calls onToggle when the checkbox is clicked', () => {
    const onToggle = vi.fn();
    render(<ShoppingItemRow item={shoppingItem()} ingredient={ingredient} onToggle={onToggle} />);
    screen.getByRole('checkbox').click();
    expect(onToggle).toHaveBeenCalled();
  });

  it('reflects the checked state in the checkbox and label', () => {
    render(
      <ShoppingItemRow
        item={shoppingItem({ checked: true })}
        ingredient={ingredient}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
});
