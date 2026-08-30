import { z } from 'zod';

import { authConfig } from '../constants/authConfig';
import { USERNAME_PATTERN } from '../utils/username';

/**
 * The one username rule — create-account and profile editing both
 * build on this instead of risking two schemas drifting apart.
 * Shape-only; availability is a separate, async concern (see
 * `useUsernameAvailability`).
 */
export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(authConfig.username.minLength, 'O username deve ter entre 3 e 30 caracteres')
  .max(authConfig.username.maxLength, 'O username deve ter entre 3 e 30 caracteres')
  .regex(USERNAME_PATTERN, 'Use letras minúsculas, números, "_" ou "." — começando com uma letra');
