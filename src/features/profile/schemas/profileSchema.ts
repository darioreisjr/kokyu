import { z } from 'zod';

import { birthDateSchema, nameSchema, usernameSchema } from '@/features/auth';

import { profileConfig } from '../constants/profileConfig';

/**
 * Reuses `nameSchema`/`usernameSchema`/`birthDateSchema` from
 * `features/auth` instead of a second copy — create-account and
 * profile editing must never accept different formats for the same
 * field. Only the under-18 message differs (parameterized), since
 * "para criar uma conta" doesn't apply once you already have one.
 */
export const profileSchema = z.object({
  firstName: nameSchema('Informe seu nome'),
  lastName: nameSchema('Informe seu sobrenome'),
  username: usernameSchema,
  bio: z
    .string()
    .trim()
    .max(
      profileConfig.bio.maxLength,
      `A bio deve ter no máximo ${profileConfig.bio.maxLength} caracteres`,
    ),
  birthDate: birthDateSchema('Você precisa ter pelo menos 18 anos.'),
  country: z.string().trim(),
  region: z.string().trim(),
  city: z.string().trim(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
