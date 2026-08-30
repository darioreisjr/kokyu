import { describe, expect, it } from 'vitest';

import { leisureItemFormDefaultValues } from '../schemas/leisureItemSchema';
import type { BookItem, UnsortedItem } from '../types/leisureItem.types';
import {
  mapFormValuesToLeisureItemInput,
  mapFormValuesToLeisureItemPatch,
  mapLeisureItemToFormValues,
} from './leisureItemFormMapper';

describe('mapFormValuesToLeisureItemInput', () => {
  it('builds a book with its own type-specific data slice', () => {
    const input = mapFormValuesToLeisureItemInput({
      ...leisureItemFormDefaultValues,
      title: 'O Hobbit',
      type: 'book',
      author: 'Tolkien',
      pages: 310,
    });
    expect(input.type).toBe('book');
    if (input.type === 'book') {
      expect(input.book).toEqual({ author: 'Tolkien', pages: 310 });
    }
  });

  it('never leaks a type-specific field into an unrelated type', () => {
    const input = mapFormValuesToLeisureItemInput({
      ...leisureItemFormDefaultValues,
      title: 'Duna',
      type: 'movie',
      author: 'Should be ignored',
    });
    expect(input.type).toBe('movie');
    if (input.type === 'movie') {
      expect(input.movie).toEqual({});
    }
  });

  it('only keeps estimatedDuration for a fixed-duration item', () => {
    const input = mapFormValuesToLeisureItemInput({
      ...leisureItemFormDefaultValues,
      title: 'X',
      durationType: 'flexible',
      estimatedDuration: 60,
      minimumUsefulDuration: 15,
    });
    expect(input.estimatedDuration).toBeUndefined();
    expect(input.minimumUsefulDuration).toBe(15);
  });

  it('defaults favorite to false for a fresh item', () => {
    const input = mapFormValuesToLeisureItemInput({ ...leisureItemFormDefaultValues, title: 'X' });
    expect(input.favorite).toBe(false);
  });
});

describe('mapFormValuesToLeisureItemPatch', () => {
  it("preserves the existing item's favorite flag", () => {
    const existing = { id: 'x', favorite: true } as Parameters<
      typeof mapFormValuesToLeisureItemPatch
    >[1];
    const patch = mapFormValuesToLeisureItemPatch(
      { ...leisureItemFormDefaultValues, title: 'X' },
      existing,
    );
    expect(patch.favorite).toBe(true);
  });
});

describe('mapLeisureItemToFormValues', () => {
  it("round-trips a book's type-specific fields back into the flat form shape", () => {
    const book: BookItem = {
      id: 'book-1',
      type: 'book',
      title: 'O Hobbit',
      status: 'inProgress',
      tags: ['fantasia'],
      favorite: true,
      durationType: 'flexible',
      minimumUsefulDuration: 15,
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
      book: { author: 'Tolkien', pages: 310, currentPage: 190 },
    };
    const values = mapLeisureItemToFormValues(book);
    expect(values.title).toBe('O Hobbit');
    expect(values.type).toBe('book');
    expect(values.author).toBe('Tolkien');
    expect(values.pages).toBe(310);
  });

  it('falls back an unsorted item to "custom" instead of an invalid type', () => {
    const unsorted: UnsortedItem = {
      id: 'unsorted-1',
      type: 'unsorted',
      title: 'Algo',
      status: 'backlog',
      tags: [],
      favorite: false,
      durationType: 'unknown',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
      unsorted: {},
    };
    expect(mapLeisureItemToFormValues(unsorted).type).toBe('custom');
  });
});
