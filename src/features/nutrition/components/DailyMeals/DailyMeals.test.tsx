import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { defaultMealTypes } from '../../constants/mealTypes';
import type { PlannedMeal } from '../../types/mealPlan.types';
import { DailyMeals } from './DailyMeals';

describe('DailyMeals', () => {
  it('renders one card per enabled meal type', () => {
    render(
      <DailyMeals
        mealTypes={defaultMealTypes}
        meals={[]}
        recipes={[]}
        onAddMeal={vi.fn()}
        onRemoveMeal={vi.fn()}
        onTogglePrepared={vi.fn()}
        onMoveMeal={vi.fn()}
      />,
    );
    expect(screen.getAllByText('Nenhuma refeição planejada')).toHaveLength(6);
  });

  it('skips a disabled meal type', () => {
    const mealTypes = defaultMealTypes.map((type) =>
      type.id === 'ceia' ? { ...type, enabled: false } : type,
    );
    render(
      <DailyMeals
        mealTypes={mealTypes}
        meals={[]}
        recipes={[]}
        onAddMeal={vi.fn()}
        onRemoveMeal={vi.fn()}
        onTogglePrepared={vi.fn()}
        onMoveMeal={vi.fn()}
      />,
    );
    expect(screen.getAllByText('Nenhuma refeição planejada')).toHaveLength(5);
  });

  it('calls onAddMeal with the meal type when its "Adicionar refeição" is clicked', () => {
    const onAddMeal = vi.fn();
    render(
      <DailyMeals
        mealTypes={defaultMealTypes}
        meals={[]}
        recipes={[]}
        onAddMeal={onAddMeal}
        onRemoveMeal={vi.fn()}
        onTogglePrepared={vi.fn()}
        onMoveMeal={vi.fn()}
      />,
    );
    screen.getAllByRole('button', { name: 'Adicionar refeição' })[0]!.click();
    expect(onAddMeal).toHaveBeenCalledWith(defaultMealTypes[0]);
  });

  it('matches a planned meal to its meal type card', () => {
    const meal: PlannedMeal = {
      id: 'meal-1',
      date: '2026-08-29',
      mealTypeId: 'almoco',
      contentType: 'note',
      note: 'Almoçar fora',
      prepared: false,
      createdAt: '2026-08-29T00:00:00.000Z',
    };
    render(
      <DailyMeals
        mealTypes={defaultMealTypes}
        meals={[meal]}
        recipes={[]}
        onAddMeal={vi.fn()}
        onRemoveMeal={vi.fn()}
        onTogglePrepared={vi.fn()}
        onMoveMeal={vi.fn()}
      />,
    );
    expect(screen.getByText('Almoçar fora')).toBeInTheDocument();
  });
});
