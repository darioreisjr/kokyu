import { describe, expect, it } from 'vitest';

import { ApiError, friendlyErrorMessage } from './errors';

function apiError(code: string, detail = 'sourceUrl: Invalid URL'): ApiError {
  return new ApiError(
    400,
    { type: 'about:blank', title: 'Validation error', status: 400, code, detail },
    'fallback',
  );
}

describe('friendlyErrorMessage', () => {
  it('translates VALIDATION_ERROR to pt-BR instead of showing the technical detail', () => {
    expect(friendlyErrorMessage(apiError('VALIDATION_ERROR'), 'Não foi possível salvar.')).toBe(
      'Alguns dados são inválidos. Revise e tente novamente.',
    );
  });

  it('falls back to the pt-BR fallback for an unknown code, never the English detail', () => {
    expect(friendlyErrorMessage(apiError('SOMETHING_NEW'), 'Não foi possível salvar.')).toBe(
      'Não foi possível salvar.',
    );
  });

  it('falls back for non-API errors', () => {
    expect(friendlyErrorMessage(new Error('boom'), 'Não foi possível salvar.')).toBe(
      'Não foi possível salvar.',
    );
  });
});
