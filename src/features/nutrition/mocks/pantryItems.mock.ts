import { addDays, format } from 'date-fns';

import type { PantryItem } from '../types/pantry.types';

function dateKey(referenceDate: Date, offsetDays: number): string {
  return format(addDays(referenceDate, offsetDays), 'yyyy-MM-dd');
}

/**
 * Expiration dates are offsets from `referenceDate` (real "today" in
 * the running service, a fixed date in tests) rather than baked-in
 * literals — a static mock would read as expired/fresh at the wrong
 * moment depending on when the app happens to be opened.
 */
export function createMockPantryItems(referenceDate: Date = new Date()): PantryItem[] {
  const createdAt = dateKey(referenceDate, -20);
  return [
    {
      id: 'pantry-arroz',
      ingredientId: 'arroz',
      quantity: 2000,
      unit: 'g',
      storageLocationId: 'despensa',
      purchaseDate: dateKey(referenceDate, -10),
      minimumStock: 500,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 'pantry-feijao',
      ingredientId: 'feijao',
      quantity: 300,
      unit: 'g',
      storageLocationId: 'despensa',
      purchaseDate: dateKey(referenceDate, -15),
      minimumStock: 500,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 'pantry-frango',
      ingredientId: 'frango',
      quantity: 400,
      unit: 'g',
      storageLocationId: 'freezer',
      purchaseDate: dateKey(referenceDate, -3),
      expirationDate: dateKey(referenceDate, 2),
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 'pantry-leite',
      ingredientId: 'leite',
      quantity: 500,
      unit: 'ml',
      storageLocationId: 'geladeira',
      purchaseDate: dateKey(referenceDate, -7),
      expirationDate: dateKey(referenceDate, -1),
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 'pantry-ovo',
      ingredientId: 'ovo',
      quantity: 6,
      unit: 'unidade',
      storageLocationId: 'geladeira',
      purchaseDate: dateKey(referenceDate, -2),
      expirationDate: dateKey(referenceDate, 15),
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 'pantry-tomate',
      ingredientId: 'tomate',
      quantity: 3,
      unit: 'unidade',
      storageLocationId: 'geladeira',
      purchaseDate: dateKey(referenceDate, -2),
      expirationDate: dateKey(referenceDate, 0),
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 'pantry-queijo',
      ingredientId: 'queijo',
      quantity: 150,
      unit: 'g',
      storageLocationId: 'geladeira',
      purchaseDate: dateKey(referenceDate, -5),
      expirationDate: dateKey(referenceDate, 20),
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 'pantry-aveia',
      ingredientId: 'aveia',
      quantity: 500,
      unit: 'g',
      storageLocationId: 'despensa',
      purchaseDate: dateKey(referenceDate, -12),
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 'pantry-manteiga',
      ingredientId: 'manteiga',
      quantity: 20,
      unit: 'g',
      storageLocationId: 'geladeira',
      purchaseDate: dateKey(referenceDate, -8),
      expirationDate: dateKey(referenceDate, 25),
      minimumStock: 50,
      createdAt,
      updatedAt: createdAt,
    },
  ];
}
