import { describe, expect, it } from 'vitest';

import type {
  ArticleItem,
  GameItem,
  HobbyItem,
  LeisureItem,
  MovieItem,
  PodcastItem,
  VideoItem,
} from '../types/leisureItem.types';
import { getEffectiveDuration, getSuggestionsForAvailableTime } from './suggestionEngine';

function base(overrides: Partial<LeisureItem> & Pick<LeisureItem, 'id' | 'title' | 'type'>) {
  return {
    status: 'backlog' as const,
    tags: [],
    favorite: false,
    durationType: 'fixed' as const,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
    ...overrides,
  };
}

const podcast: PodcastItem = base({
  id: 'podcast-1',
  title: 'Podcast',
  type: 'podcast',
  estimatedDuration: 20,
  podcast: {},
}) as PodcastItem;
const video: VideoItem = base({
  id: 'video-1',
  title: 'Vídeo',
  type: 'video',
  estimatedDuration: 15,
  video: {},
}) as VideoItem;
const movie: MovieItem = base({
  id: 'movie-1',
  title: 'Filme',
  type: 'movie',
  estimatedDuration: 120,
  movie: {},
}) as MovieItem;

describe('getSuggestionsForAvailableTime', () => {
  it('with 30 minutes available, suggests the podcast and video but not the 2h movie', () => {
    const results = getSuggestionsForAvailableTime([podcast, video, movie], {
      durationMinutes: 30,
    });
    const ids = results.map((entry) => entry.item.id);
    expect(ids).toContain('podcast-1');
    expect(ids).toContain('video-1');
    expect(ids).not.toContain('movie-1');
  });

  it('lets a flexible item with a low minimumUsefulDuration through a short window', () => {
    const book: LeisureItem = {
      ...base({ id: 'book-1', title: 'Livro', type: 'book' }),
      durationType: 'flexible',
      minimumUsefulDuration: 15,
      book: {},
    } as LeisureItem;

    const results = getSuggestionsForAvailableTime([book, movie], { durationMinutes: 30 });
    expect(results.map((entry) => entry.item.id)).toEqual(['book-1']);
  });

  it('excludes an item explicitly tagged for the opposite context', () => {
    const homeOk: HobbyItem = {
      ...base({ id: 'hobby-home', title: 'Violão', type: 'hobby' }),
      durationType: 'flexible',
      minimumUsefulDuration: 30,
      hobby: {},
    } as HobbyItem;
    const outOnly: LeisureItem = {
      ...base({
        id: 'activity-out',
        title: 'Caminhada no parque',
        type: 'activity',
        tags: ['fora-de-casa'],
      }),
      durationType: 'flexible',
      minimumUsefulDuration: 30,
      activity: {},
    } as LeisureItem;

    const results = getSuggestionsForAvailableTime([homeOk, outOnly], {
      durationMinutes: 120,
      contextTag: 'em-casa',
    });
    const ids = results.map((entry) => entry.item.id);
    expect(ids).toContain('hobby-home');
    expect(ids).not.toContain('activity-out');
  });

  it('never suggests an item with unknown duration', () => {
    const unknown: LeisureItem = {
      ...base({ id: 'unknown-1', title: 'Mistério', type: 'custom' }),
      durationType: 'unknown',
      custom: {},
    } as LeisureItem;
    const results = getSuggestionsForAvailableTime([unknown], { durationMinutes: 999 });
    expect(results).toHaveLength(0);
  });

  it('filters by status, excluding completed/abandoned/archived by default', () => {
    const done: LeisureItem = { ...podcast, id: 'podcast-done', status: 'completed' };
    const results = getSuggestionsForAvailableTime([podcast, done], { durationMinutes: 30 });
    expect(results.map((entry) => entry.item.id)).toEqual(['podcast-1']);
  });

  it('filters by an explicit type', () => {
    const results = getSuggestionsForAvailableTime([podcast, video], {
      durationMinutes: 30,
      type: 'video',
    });
    expect(results.map((entry) => entry.item.id)).toEqual(['video-1']);
  });

  it('ranks a favorite item above a non-favorite one that otherwise fits equally well', () => {
    const favoriteVideo: VideoItem = { ...video, id: 'video-fav', favorite: true };
    const results = getSuggestionsForAvailableTime([video, favoriteVideo], { durationMinutes: 30 });
    expect(results[0]!.item.id).toBe('video-fav');
  });

  it('respects an explicit statuses override', () => {
    const paused: GameItem = base({
      id: 'game-1',
      title: 'Jogo',
      type: 'game',
      status: 'completed',
      estimatedDuration: 20,
      game: {},
    }) as GameItem;
    const results = getSuggestionsForAvailableTime([paused], {
      durationMinutes: 30,
      statuses: ['completed'],
    });
    expect(results.map((entry) => entry.item.id)).toEqual(['game-1']);
  });
});

describe('getEffectiveDuration', () => {
  it('uses estimatedDuration for a fixed item', () => {
    expect(getEffectiveDuration(movie)).toBe(120);
  });

  it('returns null for a fixed item with no estimatedDuration', () => {
    const noDuration: MovieItem = { ...movie, estimatedDuration: undefined };
    expect(getEffectiveDuration(noDuration)).toBeNull();
  });

  it('falls back to the type default for a flexible item with no minimumUsefulDuration of its own', () => {
    const book: LeisureItem = {
      ...base({ id: 'book-1', title: 'Livro', type: 'book' }),
      durationType: 'flexible',
      book: {},
    } as LeisureItem;
    expect(getEffectiveDuration(book)).toBe(15);
  });

  it('falls back to the global default when the type itself has no default either', () => {
    const article: ArticleItem = {
      ...base({ id: 'article-1', title: 'Artigo', type: 'article' }),
      durationType: 'flexible',
      article: {},
    } as ArticleItem;
    expect(getEffectiveDuration(article)).toBe(20);
  });

  it('returns null for unknown duration', () => {
    const unknown: LeisureItem = {
      ...base({ id: 'unknown-1', title: 'Mistério', type: 'custom' }),
      durationType: 'unknown',
      custom: {},
    } as LeisureItem;
    expect(getEffectiveDuration(unknown)).toBeNull();
  });
});
