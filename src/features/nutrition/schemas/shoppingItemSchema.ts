import { z } from 'zod';

/** For the "adicionar manualmente" flow — a free-text item (e.g. "Guardanapo") never needs `ingredientId`. */
export const shoppingItemSchema = z
  .object({
    name: z.string().optional(),
    ingredientId: z.string().optional(),
    quantity: z.coerce.number().positive('Informe uma quantidade válida'),
    unit: z.string().min(1, 'Selecione uma unidade'),
    category: z.string().min(1, 'Selecione uma categoria'),
  })
  .refine((data) => Boolean(data.name?.trim()) || Boolean(data.ingredientId), {
    message: 'Informe um item',
    path: ['name'],
  });

export type ShoppingItemFormValues = z.infer<typeof shoppingItemSchema>;

export const shoppingItemFormDefaultValues: ShoppingItemFormValues = {
  name: '',
  ingredientId: undefined,
  quantity: 1,
  unit: 'unidade',
  category: 'outros',
};
