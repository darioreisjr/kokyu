import type { Ingredient, IngredientCategoryId } from '../types/ingredient.types';
import type { Unit } from '../types/units.types';
import { normalizeText } from '../utils/normalizeText';
import { generateId, nutritionDb } from './nutritionMockDb';

export interface CreateIngredientInput {
  name: string;
  category: IngredientCategoryId;
  defaultUnit: Unit;
}

/**
 * Mocked — no real backend. `findOrCreateByName` is what keeps the
 * "arroz" / "Arroz Branco" typo-of-each-other problem from ever
 * happening: every ingredient-entry point (recipe form, pantry form,
 * manual shopping item) resolves through it instead of pushing a new
 * `Ingredient` straight in.
 */
export const ingredientService = {
  async getIngredients(): Promise<Ingredient[]> {
    return [...nutritionDb.ingredients];
  },

  async getIngredient(id: string): Promise<Ingredient | null> {
    return nutritionDb.ingredients.find((ingredient) => ingredient.id === id) ?? null;
  },

  async searchIngredients(query: string): Promise<Ingredient[]> {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return [...nutritionDb.ingredients];
    return nutritionDb.ingredients.filter(
      (ingredient) =>
        ingredient.normalizedName.includes(normalizedQuery) ||
        ingredient.aliases?.some((alias) => normalizeText(alias).includes(normalizedQuery)),
    );
  },

  async createIngredient(input: CreateIngredientInput): Promise<Ingredient> {
    const ingredient: Ingredient = {
      id: generateId('ingredient'),
      name: input.name,
      normalizedName: normalizeText(input.name),
      category: input.category,
      defaultUnit: input.defaultUnit,
    };
    nutritionDb.ingredients.push(ingredient);
    return ingredient;
  },

  /** Resolves an existing ingredient by (normalized) name, or creates one — the single dedupe point for every "type a name, get an ingredient" flow. */
  async findOrCreateByName(
    name: string,
    category: IngredientCategoryId,
    defaultUnit: Unit,
  ): Promise<Ingredient> {
    const normalized = normalizeText(name);
    const existing = nutritionDb.ingredients.find(
      (ingredient) => ingredient.normalizedName === normalized,
    );
    if (existing) return existing;
    return ingredientService.createIngredient({ name, category, defaultUnit });
  },
};
