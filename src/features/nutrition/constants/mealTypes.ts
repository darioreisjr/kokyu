import type { MealType } from '../types/mealPlan.types';

/**
 * The six starting meal slots — data, not an enum. Every component
 * reads this list (or a future user-edited version of it) instead of
 * assuming exactly these six exist; renaming/reordering/disabling one
 * is a data change here, not a code change everywhere it's rendered.
 */
export const defaultMealTypes: MealType[] = [
  { id: 'cafe-da-manha', name: 'Café da manhã', order: 0, defaultTime: '07:00', enabled: true },
  { id: 'lanche-da-manha', name: 'Lanche da manhã', order: 1, defaultTime: '10:00', enabled: true },
  { id: 'almoco', name: 'Almoço', order: 2, defaultTime: '12:30', enabled: true },
  { id: 'lanche-da-tarde', name: 'Lanche da tarde', order: 3, defaultTime: '16:00', enabled: true },
  { id: 'jantar', name: 'Jantar', order: 4, defaultTime: '19:30', enabled: true },
  { id: 'ceia', name: 'Ceia', order: 5, defaultTime: '21:30', enabled: true },
];

export function getEnabledMealTypes(mealTypes: MealType[] = defaultMealTypes): MealType[] {
  return mealTypes.filter((mealType) => mealType.enabled).sort((a, b) => a.order - b.order);
}
