import { z } from 'zod';

import { authConfig } from '../constants/authConfig';
import { meetsAllPasswordRequirements } from '../utils/passwordRequirements';
import { birthDateSchema } from './birthDateSchema';
import { nameSchema } from './nameSchema';
import { usernameSchema } from './usernameSchema';

export const createAccountSchema = z
  .object({
    firstName: nameSchema('Informe seu nome'),
    lastName: nameSchema('Informe seu sobrenome'),
    username: usernameSchema,
    birthDate: birthDateSchema(
      `Você precisa ter pelo menos ${authConfig.minAccountAge} anos para criar uma conta`,
    ),
    password: z
      .string()
      .min(1, 'Informe sua senha')
      .refine(meetsAllPasswordRequirements, 'A senha não atende aos requisitos mínimos'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type CreateAccountFormValues = z.infer<typeof createAccountSchema>;
