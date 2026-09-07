import { z } from 'zod';

import { birthDateSchema, nameSchema, usernameSchema } from '@/features/auth';
import { profileConfig } from '@/features/profile';

/**
 * Required fields reuse the exact same rules as create-account and
 * profile editing (`nameSchema`/`usernameSchema`/`birthDateSchema` from
 * `features/auth`) — onboarding must never accept a username or birth
 * date create-account/profile-edit would reject, or vice versa. The
 * "optional" fields (`bio`/`country`/`region`/`city`) are plain,
 * unconstrained-minimum strings — same shape `profileSchema` already
 * uses for the same fields — rather than `.optional()`/`.default()`:
 * an empty string already satisfies `z.string().trim()` with no extra
 * validation error, and `useOnboardingForm`'s `defaultValues` always
 * supplies `''` rather than `undefined`, so there's nothing for
 * `.optional()` to add here — only the four required fields above
 * actually block "Continuar".
 */
export const onboardingSchema = z.object({
  firstName: nameSchema('Informe seu nome'),
  lastName: nameSchema('Informe seu sobrenome'),
  username: usernameSchema,
  birthDate: birthDateSchema('Você precisa ter pelo menos 18 anos.'),
  bio: z
    .string()
    .trim()
    .max(
      profileConfig.bio.maxLength,
      `A bio deve ter no máximo ${profileConfig.bio.maxLength} caracteres`,
    ),
  country: z.string().trim(),
  region: z.string().trim(),
  city: z.string().trim(),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
