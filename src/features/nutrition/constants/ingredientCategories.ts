import type { IngredientCategoryDefinition, IngredientCategoryId } from '../types/ingredient.types';

/** Centralized so pantry/shopping/recipe grouping all sort and label categories identically — never hardcoded per feature. */
export const ingredientCategoryDefinitions: IngredientCategoryDefinition[] = [
  { id: 'hortifruti', label: 'Hortifruti', order: 0 },
  { id: 'carnes', label: 'Carnes', order: 1 },
  { id: 'peixes', label: 'Peixes', order: 2 },
  { id: 'laticinios', label: 'Laticínios', order: 3 },
  { id: 'ovos', label: 'Ovos', order: 4 },
  { id: 'graos', label: 'Grãos', order: 5 },
  { id: 'massas', label: 'Massas', order: 6 },
  { id: 'paes', label: 'Pães', order: 7 },
  { id: 'cereais', label: 'Cereais', order: 8 },
  { id: 'congelados', label: 'Congelados', order: 9 },
  { id: 'bebidas', label: 'Bebidas', order: 10 },
  { id: 'temperos', label: 'Temperos', order: 11 },
  { id: 'molhos', label: 'Molhos', order: 12 },
  { id: 'enlatados', label: 'Enlatados', order: 13 },
  { id: 'snacks', label: 'Snacks', order: 14 },
  { id: 'doces', label: 'Doces', order: 15 },
  { id: 'outros', label: 'Outros', order: 16 },
];

const categoryById = new Map(
  ingredientCategoryDefinitions.map((category) => [category.id, category]),
);

export function getIngredientCategoryLabel(category: IngredientCategoryId): string {
  return categoryById.get(category)?.label ?? category;
}
