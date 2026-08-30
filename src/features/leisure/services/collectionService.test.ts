import { beforeEach, describe, expect, it } from 'vitest';

import { collectionService } from './collectionService';
import { resetLeisureDb } from './leisureMockDb';

describe('collectionService', () => {
  beforeEach(() => {
    resetLeisureDb();
  });

  it('lists every collection', async () => {
    const collections = await collectionService.getCollections();
    expect(collections.length).toBeGreaterThan(0);
  });

  it('creates a collection', async () => {
    const created = await collectionService.createCollection({ name: 'Jogos curtos' });
    expect(created.itemIds).toEqual([]);
    expect(await collectionService.getCollection(created.id)).not.toBeNull();
  });

  it('adds an item to a collection without duplicating it', async () => {
    const collection = await collectionService.createCollection({ name: 'Favoritos' });
    await collectionService.addItemToCollection(collection.id, 'movie-interestelar');
    const updated = await collectionService.addItemToCollection(
      collection.id,
      'movie-interestelar',
    );
    expect(updated?.itemIds).toEqual(['movie-interestelar']);
  });

  it('lets one item belong to multiple collections', async () => {
    const a = await collectionService.createCollection({ name: 'Lista A' });
    const b = await collectionService.createCollection({ name: 'Lista B' });
    await collectionService.addItemToCollection(a.id, 'movie-interestelar');
    await collectionService.addItemToCollection(b.id, 'movie-interestelar');
    expect((await collectionService.getCollection(a.id))?.itemIds).toContain('movie-interestelar');
    expect((await collectionService.getCollection(b.id))?.itemIds).toContain('movie-interestelar');
  });

  it('removes an item from a collection', async () => {
    const collection = await collectionService.createCollection({
      name: 'Favoritos',
      itemIds: ['movie-interestelar'],
    });
    const updated = await collectionService.removeItemFromCollection(
      collection.id,
      'movie-interestelar',
    );
    expect(updated?.itemIds).toEqual([]);
  });

  it('deletes a collection', async () => {
    const collection = await collectionService.createCollection({ name: 'Temporária' });
    await collectionService.deleteCollection(collection.id);
    expect(await collectionService.getCollection(collection.id)).toBeNull();
  });
});
