import { z } from 'zod';

const recurrenceValues = ['none', 'daily', 'weekly', 'custom'] as const;

/**
 * Plain `z.number().optional()`, not `z.preprocess(...)` — wrapping in
 * `z.preprocess` makes the resolver's *input* type `unknown`, which
 * breaks `zodResolver`'s generic match against `useForm<T>()` (the
 * same pitfall documented for Nutrição's `recipeSchema`). The real fix
 * for "RHF's `valueAsNumber` turns a blank field into `NaN`" belongs
 * at the `register()` call site instead, via `setValueAs`.
 */
export const planEntrySchema = z.object({
  title: z.string().min(1, 'Informe um título'),
  date: z.string().min(1, 'Informe uma data'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  duration: z.number().min(0, 'Informe uma duração válida').optional(),
  recurrence: z.enum(recurrenceValues).optional(),
  notes: z.string().optional(),
  reminder: z.boolean().optional(),
});

export type PlanEntryFormValues = z.infer<typeof planEntrySchema>;

export const planEntryDefaultValues: PlanEntryFormValues = {
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  recurrence: 'none',
  notes: '',
  reminder: false,
};
