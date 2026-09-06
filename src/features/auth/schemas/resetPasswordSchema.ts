import { z } from 'zod';

import { meetsAllPasswordRequirements } from '../utils/passwordRequirements';

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Informe sua nova senha')
      .refine(meetsAllPasswordRequirements, 'A senha não atende aos requisitos mínimos'),
    confirmPassword: z.string().min(1, 'Confirme sua nova senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const resetPasswordDefaultValues: ResetPasswordFormValues = {
  password: '',
  confirmPassword: '',
};
