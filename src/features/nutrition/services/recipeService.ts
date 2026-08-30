import type { Recipe, RecipeIngredient, RecipeStep } from '../types/recipe.types';
import { generateId, nutritionDb } from './nutritionMockDb';

export interface RecipeInput {
  name: string;
  description?: string;
  imageUrl?: string;
  category: Recipe['category'];
  tags: string[];
  preparationTime: number;
  cookingTime: number;
  servings: number;
  ingredients: RecipeIngredient[];
  steps: Pick<RecipeStep, 'text'>[];
  notes?: string;
}

function toSteps(steps: Pick<RecipeStep, 'text'>[]): RecipeStep[] {
  return steps.map((step, index) => ({ id: generateId('step'), order: index, text: step.text }));
}

/** Mocked — no real backend, no HTTP. */
export const recipeService = {
  async getRecipes(): Promise<Recipe[]> {
    return [...nutritionDb.recipes];
  },

  async getRecipe(id: string): Promise<Recipe | null> {
    return nutritionDb.recipes.find((recipe) => recipe.id === id) ?? null;
  },

  async createRecipe(input: RecipeInput): Promise<Recipe> {
    const now = new Date().toISOString();
    const recipe: Recipe = {
      id: generateId('recipe'),
      name: input.name,
      description: input.description,
      imageUrl: input.imageUrl,
      category: input.category,
      tags: input.tags,
      preparationTime: input.preparationTime,
      cookingTime: input.cookingTime,
      servings: input.servings,
      ingredients: input.ingredients,
      steps: toSteps(input.steps),
      notes: input.notes,
      favorite: false,
      createdAt: now,
      updatedAt: now,
    };
    nutritionDb.recipes.push(recipe);
    return recipe;
  },

  async updateRecipe(id: string, input: RecipeInput): Promise<Recipe | null> {
    const index = nutritionDb.recipes.findIndex((recipe) => recipe.id === id);
    if (index === -1) return null;
    const existing = nutritionDb.recipes[index]!;
    const updated: Recipe = {
      ...existing,
      name: input.name,
      description: input.description,
      imageUrl: input.imageUrl,
      category: input.category,
      tags: input.tags,
      preparationTime: input.preparationTime,
      cookingTime: input.cookingTime,
      servings: input.servings,
      ingredients: input.ingredients,
      steps: toSteps(input.steps),
      notes: input.notes,
      updatedAt: new Date().toISOString(),
    };
    nutritionDb.recipes[index] = updated;
    return updated;
  },

  async deleteRecipe(id: string): Promise<void> {
    nutritionDb.recipes = nutritionDb.recipes.filter((recipe) => recipe.id !== id);
  },

  async toggleFavorite(id: string): Promise<Recipe | null> {
    const index = nutritionDb.recipes.findIndex((recipe) => recipe.id === id);
    if (index === -1) return null;
    const existing = nutritionDb.recipes[index]!;
    const updated = { ...existing, favorite: !existing.favorite };
    nutritionDb.recipes[index] = updated;
    return updated;
  },
};
