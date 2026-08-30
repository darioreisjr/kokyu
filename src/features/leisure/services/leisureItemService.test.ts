import { beforeEach, describe, expect, it } from 'vitest';

import { resetLeisureDb } from './leisureMockDb';
import { leisureItemService } from './leisureItemService';

describe('leisureItemService', () => {
  beforeEach(() => {
    resetLeisureDb();
  });

  it('lists every item', async () => {
    const items = await leisureItemService.getLeisureItems();
    expect(items.length).toBeGreaterThan(0);
  });

  it('creates an item and reads it back by id', async () => {
    const created = await leisureItemService.createLeisureItem({
      type: 'book',
      title: 'Novo Livro',
      status: 'backlog',
      tags: [],
      favorite: false,
      durationType: 'flexible',
      book: {},
    });
    expect(created.id).toBeTruthy();
    const fetched = await leisureItemService.getLeisureItem(created.id);
    expect(fetched?.title).toBe('Novo Livro');
  });

  it('updates an item', async () => {
    const updated = await leisureItemService.updateLeisureItem('movie-curta-noite', {
      title: 'Novo título',
    });
    expect(updated?.title).toBe('Novo título');
  });

  it('deletes an item', async () => {
    await leisureItemService.deleteLeisureItem('movie-curta-noite');
    expect(await leisureItemService.getLeisureItem('movie-curta-noite')).toBeNull();
  });

  it('archives an item, setting status and archivedAt', async () => {
    const archived = await leisureItemService.archiveLeisureItem('movie-curta-noite');
    expect(archived?.status).toBe('archived');
    expect(archived?.archivedAt).toBeTruthy();
  });

  it('toggles favorite', async () => {
    const first = await leisureItemService.toggleFavorite('movie-curta-noite');
    expect(first?.favorite).toBe(true);
    const second = await leisureItemService.toggleFavorite('movie-curta-noite');
    expect(second?.favorite).toBe(false);
  });

  it('updates progress by merging into the type-specific data slice only', async () => {
    const updated = await leisureItemService.updateProgress('book-hobbit', { currentPage: 250 });
    expect(updated?.type).toBe('book');
    if (updated?.type === 'book') {
      expect(updated.book.currentPage).toBe(250);
      expect(updated.book.pages).toBe(310);
      expect(updated.book.author).toBe('J.R.R. Tolkien');
    }
  });

  it('reclassifies an unsorted item into a real type, replacing the old data slice', async () => {
    const unsorted = await leisureItemService.createLeisureItem({
      type: 'unsorted',
      title: 'Restaurante que vi',
      status: 'backlog',
      tags: [],
      favorite: false,
      durationType: 'unknown',
      unsorted: {},
    });
    const reclassified = await leisureItemService.reclassifyLeisureItem(unsorted.id, 'place', {
      category: 'restaurante',
    });
    expect(reclassified?.type).toBe('place');
    if (reclassified?.type === 'place') {
      expect(reclassified.place.category).toBe('restaurante');
    }
    expect((reclassified as unknown as Record<string, unknown>).unsorted).toBeUndefined();
  });
});
