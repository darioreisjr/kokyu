import type { Recipe } from '../types/recipe.types';

function steps(...texts: string[]): Recipe['steps'] {
  return texts.map((text, index) => ({ id: `step-${index + 1}`, order: index, text }));
}

/** 3–6 realistic recipes, enough to exercise every category/tag/favorite/ingredient-availability path without padding the mock database. */
export const mockRecipes: Recipe[] = [
  {
    id: 'frango-arroz-feijao',
    name: 'Frango grelhado com arroz e feijão',
    description: 'O prato do dia a dia — proteína, grão e feijão em uma refeição só.',
    category: 'almoco',
    tags: ['proteína', 'rápido'],
    preparationTime: 15,
    cookingTime: 30,
    servings: 4,
    ingredients: [
      { ingredientId: 'frango', quantity: 600, unit: 'g' },
      { ingredientId: 'arroz', quantity: 500, unit: 'g' },
      { ingredientId: 'feijao', quantity: 400, unit: 'g' },
      { ingredientId: 'alho', quantity: 2, unit: 'unidade' },
      { ingredientId: 'cebola', quantity: 1, unit: 'unidade' },
      { ingredientId: 'azeite', quantity: 30, unit: 'ml' },
      { ingredientId: 'sal', quantity: 10, unit: 'g' },
    ],
    steps: steps(
      'Tempere o frango com sal e metade do alho picado.',
      'Grelhe o frango em fogo médio até dourar dos dois lados.',
      'Refogue a cebola e o restante do alho no azeite, junte o arroz e cubra com água.',
      'Cozinhe o feijão em panela separada até ficar macio.',
      'Sirva o frango com o arroz e o feijão.',
    ),
    favorite: true,
    createdAt: '2026-08-01T12:00:00.000Z',
    updatedAt: '2026-08-01T12:00:00.000Z',
  },
  {
    id: 'omelete-aveia',
    name: 'Omelete com aveia',
    description: 'Café da manhã rápido com mais proteína e fibra.',
    category: 'cafe-da-manha',
    tags: ['rápido', 'proteína', 'vegetariano'],
    preparationTime: 5,
    cookingTime: 8,
    servings: 1,
    ingredients: [
      { ingredientId: 'ovo', quantity: 2, unit: 'unidade' },
      { ingredientId: 'aveia', quantity: 20, unit: 'g' },
      { ingredientId: 'sal', quantity: 1, unit: 'g' },
      { ingredientId: 'manteiga', quantity: 5, unit: 'g' },
    ],
    steps: steps(
      'Bata os ovos com a aveia e o sal.',
      'Derreta a manteiga na frigideira em fogo baixo.',
      'Despeje a mistura e cozinhe até firmar dos dois lados.',
    ),
    favorite: false,
    createdAt: '2026-08-05T09:00:00.000Z',
    updatedAt: '2026-08-05T09:00:00.000Z',
  },
  {
    id: 'macarrao-molho-tomate',
    name: 'Macarrão ao molho de tomate',
    description: 'Clássico de fim de dia, pronto em menos de meia hora.',
    category: 'jantar',
    tags: ['vegetariano', 'marmita'],
    preparationTime: 10,
    cookingTime: 20,
    servings: 3,
    ingredients: [
      { ingredientId: 'macarrao', quantity: 300, unit: 'g' },
      { ingredientId: 'molho-tomate', quantity: 400, unit: 'ml' },
      { ingredientId: 'alho', quantity: 2, unit: 'unidade' },
      { ingredientId: 'queijo', quantity: 100, unit: 'g' },
      { ingredientId: 'azeite', quantity: 15, unit: 'ml' },
    ],
    steps: steps(
      'Cozinhe o macarrão em água fervente com sal até ficar al dente.',
      'Refogue o alho no azeite e junte o molho de tomate.',
      'Misture o macarrão escorrido ao molho e finalize com queijo ralado.',
    ),
    favorite: true,
    createdAt: '2026-08-10T18:00:00.000Z',
    updatedAt: '2026-08-10T18:00:00.000Z',
  },
  {
    id: 'banana-com-aveia',
    name: 'Banana com aveia e iogurte',
    description: 'Lanche simples de montar, sem fogão.',
    category: 'lanche',
    tags: ['rápido', 'vegetariano'],
    preparationTime: 5,
    cookingTime: 0,
    servings: 1,
    ingredients: [
      { ingredientId: 'banana', quantity: 1, unit: 'unidade' },
      { ingredientId: 'aveia', quantity: 15, unit: 'g' },
      { ingredientId: 'iogurte', quantity: 1, unit: 'pote' },
    ],
    steps: steps(
      'Corte a banana em rodelas.',
      'Misture com o iogurte e finalize com a aveia por cima.',
    ),
    favorite: false,
    createdAt: '2026-08-12T15:00:00.000Z',
    updatedAt: '2026-08-12T15:00:00.000Z',
  },
  {
    id: 'pao-com-ovo',
    name: 'Pão com ovo e café',
    description: 'O café da manhã de sempre.',
    category: 'cafe-da-manha',
    tags: ['rápido'],
    preparationTime: 5,
    cookingTime: 5,
    servings: 1,
    ingredients: [
      { ingredientId: 'pao-frances', quantity: 1, unit: 'unidade' },
      { ingredientId: 'ovo', quantity: 1, unit: 'unidade' },
      { ingredientId: 'manteiga', quantity: 5, unit: 'g' },
      { ingredientId: 'cafe', quantity: 10, unit: 'g' },
    ],
    steps: steps('Frite o ovo na manteiga.', 'Monte o pão com o ovo.', 'Prepare o café.'),
    favorite: false,
    createdAt: '2026-08-15T07:00:00.000Z',
    updatedAt: '2026-08-15T07:00:00.000Z',
  },
];

const recipeById = new Map(mockRecipes.map((recipe) => [recipe.id, recipe]));

export function getMockRecipe(id: string): Recipe | undefined {
  return recipeById.get(id);
}
