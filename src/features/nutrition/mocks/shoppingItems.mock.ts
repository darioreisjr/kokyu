import type { ShoppingItem } from '../types/shopping.types';

export function createMockShoppingItems(referenceDate: Date = new Date()): ShoppingItem[] {
  const createdAt = referenceDate.toISOString();
  return [
    {
      id: 'shopping-frango',
      ingredientId: 'frango',
      quantity: 200,
      unit: 'g',
      category: 'carnes',
      checked: false,
      source: 'meal-plan',
      recipeIds: ['frango-arroz-feijao'],
      plannedMealIds: ['meal-today-almoco'],
      createdAt,
    },
    {
      id: 'shopping-macarrao',
      ingredientId: 'macarrao',
      quantity: 300,
      unit: 'g',
      category: 'massas',
      checked: false,
      source: 'recipe',
      recipeIds: ['macarrao-molho-tomate'],
      createdAt,
    },
    {
      id: 'shopping-feijao',
      ingredientId: 'feijao',
      quantity: 500,
      unit: 'g',
      category: 'graos',
      checked: false,
      source: 'low-stock',
      createdAt,
    },
    {
      id: 'shopping-guardanapo',
      quantity: 1,
      unit: 'pacote',
      category: 'outros',
      checked: false,
      source: 'manual',
      name: 'Guardanapo',
      createdAt,
    },
    {
      id: 'shopping-leite',
      ingredientId: 'leite',
      quantity: 1,
      unit: 'l',
      category: 'laticinios',
      checked: true,
      source: 'manual',
      createdAt,
    },
  ];
}
