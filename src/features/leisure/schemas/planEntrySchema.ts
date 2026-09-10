import { format } from 'date-fns';
import { z } from 'zod';

import { toDateKey } from '../utils/dateHelpers';

const recurrenceValues = ['none', 'daily', 'weekly', 'custom'] as const;

/**
 * Plain `z.number().optional()`, not `z.preprocess(...)` — wrapping in
 * `z.preprocess` makes the resolver's *input* type `unknown`, which
 * breaks `zodResolver`'s generic match against `useForm<T>()` (the
 * same pitfall documented for Nutrição's `recipeSchema`). The real fix
 * for "RHF's `valueAsNumber` turns a blank field into `NaN`" belongs
 * at the `register()` call site instead, via `setValueAs`.
 */
const planEntryFieldsSchema = z.object({
  title: z.string().min(1, 'Informe um título'),
  date: z.string().min(1, 'Informe uma data'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  duration: z.number().min(0, 'Informe uma duração válida').optional(),
  recurrence: z.enum(recurrenceValues).optional(),
  notes: z.string().optional(),
  reminder: z.boolean().optional(),
});

export type PlanEntryFormValues = z.infer<typeof planEntryFieldsSchema>;

/**
 * The date/startTime/endTime a plan entry already had when its dialog
 * was opened for editing. The "not in the past" rules below only ever
 * hold *new* picks to account against `now` — an entry planned last
 * week must stay editable (title, notes, ...) without being forced
 * onto a fresh date just because its original date has since passed.
 * `undefined` (the `create` case) means every value is a fresh pick.
 */
export interface PlanEntryPastReference {
  date?: string;
  startTime?: string;
  endTime?: string;
}

/**
 * Builds the validated schema against `reference` — see
 * `PlanEntryPastReference`. `planEntrySchema` (no reference) is the
 * `create` case, where every value counts as new.
 */
export function buildPlanEntrySchema(reference?: PlanEntryPastReference) {
  return planEntryFieldsSchema.superRefine((values, ctx) => {
    const now = new Date();
    const todayKey = toDateKey(now);
    const nowTime = format(now, 'HH:mm');

    const dateChanged = values.date !== reference?.date;
    if (dateChanged && values.date < todayKey) {
      ctx.addIssue({ code: 'custom', path: ['date'], message: 'A data não pode estar no passado' });
    }

    const isToday = values.date === todayKey;
    if (isToday && values.startTime) {
      const startChanged = dateChanged || values.startTime !== reference?.startTime;
      if (startChanged && values.startTime < nowTime) {
        ctx.addIssue({
          code: 'custom',
          path: ['startTime'],
          message: 'O horário de início não pode estar no passado',
        });
      }
    }
    if (isToday && values.endTime) {
      const endChanged = dateChanged || values.endTime !== reference?.endTime;
      if (endChanged && values.endTime < nowTime) {
        ctx.addIssue({
          code: 'custom',
          path: ['endTime'],
          message: 'O horário de término não pode estar no passado',
        });
      }
    }
  });
}

export const planEntrySchema = buildPlanEntrySchema();

export const planEntryDefaultValues: PlanEntryFormValues = {
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  recurrence: 'none',
  notes: '',
  reminder: false,
};
