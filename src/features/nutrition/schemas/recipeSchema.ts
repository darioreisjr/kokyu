import { z } from 'zod';

const unitValues = [
  'g',
  'kg',
  'ml',
  'l',
  'unidade',
  'pacote',
  'caixa',
  'lata',
  'garrafa',
  'pote',
  'colher-cha',
  'colher-sopa',
  'xicara',
] as const;

/**
 * `ingredientName`, not `ingredientId` — the form is what the user
 * types into (an autocomplete that may resolve to an existing
 * `Ingredient` or a brand new name), so this validates what's
 * actually on screen. Resolving a name to a real `ingredientId`
 * (existing or freshly created, deduplicated by
 * `ingredientService.findOrCreateByName`) happens at submit time, not
 * as part of this schema.
 *
 * Numeric fields are plain `z.number()`, not `z.coerce.number()` —
 * `RecipeForm` reads them via `register(..., { valueAsNumber: true })`
 * so RHF's own form state is already a real `number`, keeping the
 * resolver's input and output types identical (mixing coercion into
 * the schema instead produces an `unknown` input type `zodResolver`
 * can't reconcile with `useForm<RecipeFormValues>`).
 */
const recipeIngredientFormSchema = z.object({
  ingredientName: z.string().min(1, 'Selecione um ingrediente'),
  quantity: z.number().positive('Informe uma quantidade válida'),
  unit: z.enum(unitValues, { message: 'Selecione uma unidade' }),
  preparationNote: z.string().optional(),
});

const recipeStepFormSchema = z.object({
  text: z.string().min(1, 'A etapa não pode ficar em branco'),
});

const recipeCategoryValues = ['cafe-da-manha', 'almoco', 'jantar', 'lanche', 'sobremesa'] as const;

export const recipeSchema = z.object({
  name: z.string().min(1, 'Informe o nome da receita'),
  description: z.string().optional(),
  category: z.enum(recipeCategoryValues, { message: 'Selecione uma categoria' }),
  tags: z.array(z.string()),
  preparationTime: z.number().min(0, 'Informe um tempo válido'),
  cookingTime: z.number().min(0, 'Informe um tempo válido'),
  servings: z.number().positive('Informe o número de porções'),
  ingredients: z.array(recipeIngredientFormSchema).min(1, 'Adicione pelo menos um ingrediente'),
  steps: z.array(recipeStepFormSchema).min(1, 'Adicione pelo menos uma etapa'),
  notes: z.string().optional(),
});

export type RecipeFormValues = z.infer<typeof recipeSchema>;

export const recipeFormDefaultValues: RecipeFormValues = {
  name: '',
  description: '',
  category: 'almoco',
  tags: [],
  preparationTime: 10,
  cookingTime: 20,
  servings: 2,
  ingredients: [],
  steps: [],
  notes: '',
};
