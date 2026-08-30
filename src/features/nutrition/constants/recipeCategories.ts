import type { RecipeCategoryDefinition } from '../types/recipe.types';

export const recipeCategoryDefinitions: RecipeCategoryDefinition[] = [
  { id: 'cafe-da-manha', label: 'Café da manhã', order: 0 },
  { id: 'almoco', label: 'Almoço', order: 1 },
  { id: 'jantar', label: 'Jantar', order: 2 },
  { id: 'lanche', label: 'Lanche', order: 3 },
  { id: 'sobremesa', label: 'Sobremesa', order: 4 },
];

const categoryById = new Map(recipeCategoryDefinitions.map((category) => [category.id, category]));

export function getRecipeCategoryLabel(category: string): string {
  return categoryById.get(category as RecipeCategoryDefinition['id'])?.label ?? category;
}
