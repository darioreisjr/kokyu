import { z } from 'zod';

import { emailSchema } from './emailSchema';

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Informe sua senha'),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const loginDefaultValues: LoginFormValues = {
  email: '',
  password: '',
  rememberMe: false,
};
