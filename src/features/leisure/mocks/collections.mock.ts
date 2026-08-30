import type { LeisureCollection } from '../types/collection.types';

export const mockCollections: LeisureCollection[] = [
  {
    id: 'collection-filmes-domingo',
    name: 'Filmes para domingo',
    itemIds: ['movie-interestelar', 'movie-curta-noite'],
    createdAt: '2026-08-10T10:00:00.000Z',
    updatedAt: '2026-08-10T10:00:00.000Z',
  },
  {
    id: 'collection-recomendacoes-joao',
    name: 'Recomendações do João',
    description: 'Coisas que o João indicou.',
    itemIds: ['book-hiperfoco'],
    createdAt: '2026-08-15T10:00:00.000Z',
    updatedAt: '2026-08-15T10:00:00.000Z',
  },
  {
    id: 'collection-passeios-sp',
    name: 'Passeios em São Paulo',
    itemIds: ['place-masp', 'place-cafe-cantinho'],
    createdAt: '2026-08-05T10:00:00.000Z',
    updatedAt: '2026-08-05T10:00:00.000Z',
  },
];
