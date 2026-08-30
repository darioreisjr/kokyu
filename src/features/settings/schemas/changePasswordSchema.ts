import { z } from 'zod';

import { meetsAllPasswordRequirements } from '@/features/auth';

/** Reuses the exact same password policy as account creation — one rule set, not two that can drift apart. */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe sua senha atual'),
    newPassword: z
      .string()
      .min(1, 'Informe a nova senha')
      .refine(meetsAllPasswordRequirements, 'A senha não atende aos requisitos mínimos'),
    confirmNewPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmNewPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const changePasswordDefaultValues: ChangePasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
};
