/** Stable error codes the kokyu-sam backend documents — see the spec this feature was built against. */
export type ApiErrorCode =
  | 'PROFILE_SETUP_REQUIRED'
  | 'USERNAME_TAKEN'
  | 'USERNAME_INVALID'
  | 'BIRTH_DATE_INVALID'
  | 'AGE_REQUIREMENT_NOT_MET'
  | 'PROFILE_VALIDATION_ERROR'
  | 'PROFILE_NOT_FOUND'
  | 'AVATAR_INVALID'
  | 'AVATAR_TOO_LARGE'
  | 'LEISURE_ITEM_NOT_FOUND'
  | 'LEISURE_ITEM_DETAILS_INVALID'
  | 'LEISURE_PLAN_ENTRY_NOT_FOUND'
  | 'LEISURE_NOTE_NOT_FOUND'
  | 'LEISURE_COLLECTION_NOT_FOUND'
  | (string & {});

/** RFC 9457 Problem Details, plus the backend's own `code`/`redirectTo` extensions. */
export interface ProblemDetails {
  status?: number;
  code?: string;
  title?: string;
  detail?: string;
  redirectTo?: string;
  [key: string]: unknown;
}

/**
 * Thrown by every non-2xx response from `apiRequest`. Carries the parsed
 * `code` (when the backend sent one) so call sites can branch on stable
 * identifiers instead of parsing prose, and `redirectTo` for the one
 * code (`PROFILE_SETUP_REQUIRED`) that means "stop, go here instead".
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode | null;
  readonly redirectTo: string | null;
  readonly problem: ProblemDetails | null;

  constructor(status: number, problem: ProblemDetails | null, fallbackMessage: string) {
    super(problem?.detail || problem?.title || fallbackMessage);
    this.name = 'ApiError';
    this.status = status;
    this.code = typeof problem?.code === 'string' ? problem.code : null;
    this.redirectTo = typeof problem?.redirectTo === 'string' ? problem.redirectTo : null;
    this.problem = problem;
  }
}

/**
 * pt-BR copy for every stable error code this feature is documented to
 * handle. Deliberately not merged into `authText`/`profileConfig` — this
 * is the one place a call site looks up "what do I show the user for
 * this backend error code", independent of which screen triggered it.
 */
const FRIENDLY_ERROR_MESSAGES: Partial<Record<string, string>> = {
  USERNAME_TAKEN: 'Este username já está em uso.',
  USERNAME_INVALID:
    'Username inválido. Use letras minúsculas, números, "_" ou "." — começando com uma letra.',
  BIRTH_DATE_INVALID: 'Informe uma data de nascimento válida.',
  AGE_REQUIREMENT_NOT_MET: 'Você precisa ter pelo menos 18 anos.',
  PROFILE_VALIDATION_ERROR: 'Alguns dados do perfil são inválidos. Revise e tente novamente.',
  PROFILE_NOT_FOUND: 'Não foi possível encontrar seu perfil.',
  AVATAR_INVALID: 'Selecione uma imagem JPEG, PNG ou WebP.',
  AVATAR_TOO_LARGE: 'A imagem deve ter no máximo 5 MB.',
  LEISURE_ITEM_NOT_FOUND: 'Este item não foi encontrado.',
  LEISURE_ITEM_DETAILS_INVALID: 'Alguns dados desse item são inválidos. Revise e tente novamente.',
  LEISURE_PLAN_ENTRY_NOT_FOUND: 'Este planejamento não foi encontrado.',
  LEISURE_NOTE_NOT_FOUND: 'Esta nota não foi encontrada.',
  LEISURE_COLLECTION_NOT_FOUND: 'Esta coleção não foi encontrada.',
};

/** Maps a stable error code to pt-BR copy; falls back to the error's own message, then to `fallback`. */
export function friendlyErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.code && FRIENDLY_ERROR_MESSAGES[error.code]) {
      return FRIENDLY_ERROR_MESSAGES[error.code]!;
    }
    if (error.message) return error.message;
  }
  return fallback;
}
