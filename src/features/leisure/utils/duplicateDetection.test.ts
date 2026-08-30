import { describe, expect, it } from 'vitest';

import type { LeisureItem, MovieItem } from '../types/leisureItem.types';
import { findPossibleDuplicate } from './duplicateDetection';

function movie(overrides: Partial<MovieItem> = {}): MovieItem {
  return {
    id: 'movie-1',
    title: 'Interestelar',
    status: 'backlog',
    tags: [],
    favorite: false,
    durationType: 'fixed',
    estimatedDuration: 169,
    sourceUrl: undefined,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
    type: 'movie',
    movie: {},
    ...overrides,
  };
}

describe('findPossibleDuplicate', () => {
  const items: LeisureItem[] = [movie()];

  it('matches on a normalized (diacritic/case-insensitive) title', () => {
    expect(findPossibleDuplicate(items, { title: 'interestelar' })).toBe(items[0]);
  });

  it('matches on an identical sourceUrl even with a different title', () => {
    const withUrl = [movie({ sourceUrl: 'https://example.com/interestelar' })];
    expect(
      findPossibleDuplicate(withUrl, {
        title: 'Something else',
        sourceUrl: 'https://example.com/interestelar',
      }),
    ).toBe(withUrl[0]);
  });

  it('returns undefined when nothing matches', () => {
    expect(findPossibleDuplicate(items, { title: 'Duna' })).toBeUndefined();
  });
});
