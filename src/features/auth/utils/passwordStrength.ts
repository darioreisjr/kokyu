import { getMetPasswordRequirements } from './passwordRequirements';

export type PasswordStrength = 'weak' | 'medium' | 'strong';

const LONG_PASSWORD_LENGTH = 12;

/**
 * A simple, honest strength indicator — not a security guarantee.
 * Score = how many of the 5 policy requirements are met, plus one
 * bonus point for extra length. Meeting every requirement always
 * reads as at least "strong"; this never claims a password is safe,
 * only that it clears more of the checklist than a weaker one.
 */
export function getPasswordStrength(value: string): PasswordStrength {
  if (!value) return 'weak';

  const metCount = getMetPasswordRequirements(value).length;
  const lengthBonus = value.length >= LONG_PASSWORD_LENGTH ? 1 : 0;
  const score = metCount + lengthBonus;

  if (score >= 5) return 'strong';
  if (score >= 3) return 'medium';
  return 'weak';
}
