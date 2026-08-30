import { z } from 'zod';

/**
 * The one place the "what counts as a valid e-mail" rule lives —
 * `loginSchema` and `forgotPasswordSchema` both import this instead of
 * repeating the regex/rule. Trimmed and lowercased before validation,
 * so incidental whitespace or casing never turns a valid address into
 * a rejected one.
 */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Informe seu e-mail')
  .email('Informe um e-mail válido');
