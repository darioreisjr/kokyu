import { describe, expect, it } from 'vitest';

import { nutritionRoutes, nutritionTabs } from './nutritionRoutes';

describe('nutritionRoutes', () => {
  it('centralizes every static route', () => {
    expect(nutritionRoutes.today).toBe('/app/nutricao');
    expect(nutritionRoutes.planner).toBe('/app/nutricao/planejamento');
    expect(nutritionRoutes.pantry).toBe('/app/nutricao/despensa');
    expect(nutritionRoutes.shopping).toBe('/app/nutricao/compras');
    expect(nutritionRoutes.recipes).toBe('/app/nutricao/receitas');
    expect(nutritionRoutes.newRecipe).toBe('/app/nutricao/receitas/nova');
  });

  it('builds a recipe detail route from an id', () => {
    expect(nutritionRoutes.recipe('abc-123')).toBe('/app/nutricao/receitas/abc-123');
  });

  it('drives the 5 internal tabs from the same routes', () => {
    expect(nutritionTabs.map((tab) => tab.href)).toEqual([
      nutritionRoutes.today,
      nutritionRoutes.planner,
      nutritionRoutes.pantry,
      nutritionRoutes.shopping,
      nutritionRoutes.recipes,
    ]);
  });
});
