import { z } from 'zod';

export const pantryItemSchema = z.object({
  ingredientId: z.string().min(1, 'Selecione um ingrediente'),
  quantity: z.coerce.number().min(0, 'Informe uma quantidade válida'),
  unit: z.string().min(1, 'Selecione uma unidade'),
  storageLocationId: z.string().min(1, 'Selecione um local'),
  purchaseDate: z.string().optional(),
  expirationDate: z.string().optional(),
  minimumStock: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

export type PantryItemFormValues = z.infer<typeof pantryItemSchema>;

export const pantryItemFormDefaultValues: PantryItemFormValues = {
  ingredientId: '',
  quantity: 1,
  unit: 'unidade',
  storageLocationId: 'despensa',
  purchaseDate: '',
  expirationDate: '',
  notes: '',
};
