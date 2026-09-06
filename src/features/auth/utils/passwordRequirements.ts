import { authText } from '../constants/authText';

export interface PasswordRequirement {
  id: 'length' | 'uppercase' | 'lowercase' | 'number' | 'special';
  label: string;
  test: (value: string) => boolean;
}

/**
 * Single source of truth for the password policy — the Zod schema,
 * the live checklist and the strength meter all read from this list
 * instead of duplicating regexes. `\p{Lu}`/`\p{Ll}` (Unicode letter
 * categories) accept accented letters too, so an international
 * password isn't penalized for not having an unaccented A-Z.
 */
export const passwordRequirements: PasswordRequirement[] = [
  {
    id: 'length',
    label: authText.passwordRequirements.length,
    test: (value) => value.length >= 12,
  },
  {
    id: 'uppercase',
    label: authText.passwordRequirements.uppercase,
    test: (value) => /\p{Lu}/u.test(value),
  },
  {
    id: 'lowercase',
    label: authText.passwordRequirements.lowercase,
    test: (value) => /\p{Ll}/u.test(value),
  },
  {
    id: 'number',
    label: authText.passwordRequirements.number,
    test: (value) => /[0-9]/.test(value),
  },
  {
    id: 'special',
    label: authText.passwordRequirements.special,
    test: (value) => /[!@#$%^&*()_+\-=]/.test(value),
  },
];

export function getMetPasswordRequirements(value: string): PasswordRequirement[] {
  return passwordRequirements.filter((requirement) => requirement.test(value));
}

export function meetsAllPasswordRequirements(value: string): boolean {
  return passwordRequirements.every((requirement) => requirement.test(value));
}
