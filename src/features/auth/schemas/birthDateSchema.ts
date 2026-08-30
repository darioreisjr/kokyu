import { z } from 'zod';

import { authConfig } from '../constants/authConfig';
import { calculateAge } from '../utils/calculateAge';

/**
 * The one birth-date rule (no future date, `authConfig.minAccountAge`
 * via `calculateAge`) — create-account and profile editing both build
 * on this. The under-age message is parameterized: the rule itself
 * must never differ between contexts, but "para criar uma conta"
 * doesn't make sense once you already have one.
 */
export function birthDateSchema(underageMessage: string) {
  return z
    .date({ error: 'Informe sua data de nascimento' })
    .refine((date) => date <= new Date(), 'Informe uma data de nascimento válida')
    .refine((date) => calculateAge(date) >= authConfig.minAccountAge, underageMessage);
}
