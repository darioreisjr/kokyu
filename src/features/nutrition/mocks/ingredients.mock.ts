import { normalizeText } from '../utils/normalizeText';
import type { Ingredient } from '../types/ingredient.types';

function ingredient(
  id: string,
  name: string,
  category: Ingredient['category'],
  defaultUnit: Ingredient['defaultUnit'],
  aliases?: string[],
): Ingredient {
  return { id, name, normalizedName: normalizeText(name), category, defaultUnit, aliases };
}

/** A small, genuinely varied set — enough to demonstrate every category/unit path without hundreds of throwaway rows. */
export const mockIngredients: Ingredient[] = [
  ingredient('arroz', 'Arroz branco', 'graos', 'g'),
  ingredient('feijao', 'Feijão carioca', 'graos', 'g'),
  ingredient('frango', 'Peito de frango', 'carnes', 'g', ['frango']),
  ingredient('carne-moida', 'Carne moída', 'carnes', 'g'),
  ingredient('tomate', 'Tomate', 'hortifruti', 'unidade'),
  ingredient('cebola', 'Cebola', 'hortifruti', 'unidade'),
  ingredient('alho', 'Alho', 'temperos', 'unidade'),
  ingredient('banana', 'Banana', 'hortifruti', 'unidade'),
  ingredient('ovo', 'Ovo', 'ovos', 'unidade'),
  ingredient('leite', 'Leite', 'laticinios', 'ml'),
  ingredient('queijo', 'Queijo muçarela', 'laticinios', 'g'),
  ingredient('iogurte', 'Iogurte natural', 'laticinios', 'pote'),
  ingredient('aveia', 'Aveia em flocos', 'cereais', 'g'),
  ingredient('pao-frances', 'Pão francês', 'paes', 'unidade'),
  ingredient('macarrao', 'Macarrão espaguete', 'massas', 'g'),
  ingredient('azeite', 'Azeite de oliva', 'temperos', 'ml'),
  ingredient('sal', 'Sal', 'temperos', 'g'),
  ingredient('manteiga', 'Manteiga', 'laticinios', 'g'),
  ingredient('cafe', 'Café em pó', 'bebidas', 'g'),
  ingredient('molho-tomate', 'Molho de tomate', 'molhos', 'ml'),
] as const;

const ingredientById = new Map(mockIngredients.map((item) => [item.id, item]));

export function getMockIngredient(id: string): Ingredient | undefined {
  return ingredientById.get(id);
}
