import { z } from 'zod';

import { emailSchema } from './emailSchema';

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const forgotPasswordDefaultValues: ForgotPasswordFormValues = {
  email: '',
};
