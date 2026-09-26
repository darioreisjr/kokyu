import { describe, expect, it } from 'vitest';

import { addTags, normalizeTag, normalizeTags, toTagSuggestions } from './normalizeTags';

describe('normalizeTag', () => {
  it('lower-cases, trims and collapses inner whitespace, keeping accents and spaces', () => {
    expect(normalizeTag('  Fim   de Semana ')).toBe('fim de semana');
    expect(normalizeTag('RÁPIDO')).toBe('rápido');
    expect(normalizeTag('Em-Casa')).toBe('em-casa');
  });
});

describe('normalizeTags', () => {
  it('normalizes a list, dropping blanks and case-only duplicates', () => {
    expect(normalizeTags(['Praia', ' praia ', '', 'PRAIA', 'Sol'])).toEqual(['praia', 'sol']);
  });
});

describe('addTags', () => {
  it('appends normalized tags and skips ones already present', () => {
    expect(addTags(['praia'], ['Praia', 'Fim de Semana', ' '])).toEqual({
      tags: ['praia', 'fim de semana'],
      error: null,
      rejected: '',
    });
  });

  it('rejects a tag over 40 characters, keeping it (and what follows) as rejected text', () => {
    const long = 'a'.repeat(41);
    const result = addTags([], ['ok', long, 'depois']);
    expect(result.tags).toEqual(['ok']);
    expect(result.error).toBe('Cada tag pode ter até 40 caracteres.');
    expect(result.rejected).toBe(`${long}, depois`);
  });

  it('stops at 30 tags', () => {
    const current = Array.from({ length: 30 }, (_, index) => `t${index}`);
    const result = addTags(current, ['nova']);
    expect(result.tags).toHaveLength(30);
    expect(result.error).toBe('Use no máximo 30 tags.');
    expect(result.rejected).toBe('nova');
  });
});

describe('toTagSuggestions', () => {
  it('normalizes, de-duplicates and sorts in pt-BR order', () => {
    expect(toTagSuggestions(['Zebra', 'água', 'Água', 'banana'])).toEqual([
      'água',
      'banana',
      'zebra',
    ]);
  });
});
