import { z } from 'zod';

/**
 * The one rule for "a person's name" — first name, last name, and
 * (via `features/profile`) profile edits all build on this instead of
 * repeating `.trim().min(2, ...)`. Deliberately no character-class
 * regex: names carry accents, apostrophes, hyphens and non-Latin
 * scripts, and a restrictive pattern would reject real ones.
 */
export function nameSchema(message: string) {
  return z.string().trim().min(2, message);
}
