import { describe, expect, it } from 'vitest';

import type { BookItem, MovieItem, PodcastItem, TvShowItem } from '../types/leisureItem.types';
import { getLeisureItemProgress } from './progress';

function baseFields() {
  return {
    id: 'item-1',
    title: 'Item',
    status: 'inProgress' as const,
    tags: [],
    favorite: false,
    durationType: 'flexible' as const,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  };
}

describe('getLeisureItemProgress', () => {
  it("derives a book's progress from current/total pages, never storing a percent directly", () => {
    const book: BookItem = {
      ...baseFields(),
      type: 'book',
      book: { currentPage: 123, pages: 350 },
    };
    expect(getLeisureItemProgress(book)).toEqual({ current: 123, total: 350, percent: 35 });
  });

  it("derives a tv show's progress from the current season's episodes", () => {
    const show: TvShowItem = {
      ...baseFields(),
      type: 'tvShow',
      tvShow: { currentEpisode: 4, totalEpisodesInSeason: 10 },
    };
    expect(getLeisureItemProgress(show)).toEqual({ current: 4, total: 10, percent: 40 });
  });

  it("derives a podcast's progress from episodes", () => {
    const podcast: PodcastItem = {
      ...baseFields(),
      type: 'podcast',
      podcast: { currentEpisode: 3, totalEpisodes: 12 },
    };
    expect(getLeisureItemProgress(podcast)).toEqual({ current: 3, total: 12, percent: 25 });
  });

  it('returns null for a type with no progress concept, like a movie', () => {
    const movie: MovieItem = { ...baseFields(), type: 'movie', movie: {} };
    expect(getLeisureItemProgress(movie)).toBeNull();
  });

  it('returns null when total is missing or zero', () => {
    const book: BookItem = { ...baseFields(), type: 'book', book: { currentPage: 10 } };
    expect(getLeisureItemProgress(book)).toBeNull();
  });

  it('caps percent at 100', () => {
    const book: BookItem = {
      ...baseFields(),
      type: 'book',
      book: { currentPage: 400, pages: 350 },
    };
    expect(getLeisureItemProgress(book)?.percent).toBe(100);
  });

  it('treats page 0 as a real position, not "no progress data"', () => {
    const book: BookItem = { ...baseFields(), type: 'book', book: { currentPage: 0, pages: 350 } };
    expect(getLeisureItemProgress(book)).toEqual({ current: 0, total: 350, percent: 0 });
  });
});
