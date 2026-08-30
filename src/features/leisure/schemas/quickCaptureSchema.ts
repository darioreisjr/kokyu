import { z } from 'zod';

/**
 * "Guardar para depois" — deliberately minimal, per the spec's own
 * "Não obrigar o usuário a preencher todos os metadados." A type left
 * blank saves as `unsorted` ("Ainda não sei"), organized later.
 */
export const quickCaptureSchema = z.object({
  title: z.string().min(1, 'Informe um título'),
  type: z.string().optional(),
  sourceUrl: z.string().optional(),
  notes: z.string().optional(),
});

export type QuickCaptureFormValues = z.infer<typeof quickCaptureSchema>;

export const quickCaptureDefaultValues: QuickCaptureFormValues = {
  title: '',
  type: '',
  sourceUrl: '',
  notes: '',
};
