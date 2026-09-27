import { ApiError } from '@/lib/api/errors';

/** The 400 the backend sends for a body that fails its schema (e.g. an invalid link). */
export function apiValidationError(detail = 'sourceUrl: Invalid URL'): ApiError {
  return new ApiError(
    400,
    { status: 400, title: 'Validation error', code: 'VALIDATION_ERROR', detail },
    'Validation error',
  );
}

export const VALIDATION_ERROR_MESSAGE = 'Alguns dados são inválidos. Revise e tente novamente.';
