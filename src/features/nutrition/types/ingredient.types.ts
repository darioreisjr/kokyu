import type { Unit } from './units.types';

export type IngredientCategoryId =
  | 'hortifruti'
  | 'carnes'
  | 'peixes'
  | 'laticinios'
  | 'ovos'
  | 'graos'
  | 'massas'
  | 'paes'
  | 'cereais'
  | 'congelados'
  | 'bebidas'
  | 'temperos'
  | 'molhos'
  | 'enlatados'
  | 'snacks'
  | 'doces'
  | 'outros';

export interface IngredientCategoryDefinition {
  id: IngredientCategoryId;
  label: string;
  /** Sort position for grouped displays (shopping-by-category, pantry-by-category). */
  order: number;
}

/**
 * The canonical, deduplicated ingredient — `normalizedName` (accent
 * and case stripped) is what recipe/pantry/shopping search and
 * autocomplete match against, so "Arroz Branco" and "arroz branco"
 * resolve to the same `Ingredient` instead of silently forking into
 * two.
 */
export interface Ingredient {
  id: string;
  name: string;
  normalizedName: string;
  category: IngredientCategoryId;
  defaultUnit: Unit;
  imageUrl?: string;
  /** Alternate spellings/names that should also resolve to this ingredient during search — e.g. "tomate" / "tomate maduro". */
  aliases?: string[];
}
