import { describe, expect, it } from 'vitest';

import type { LeisureItem } from '../types/leisureItem.types';
import { getItemDetailRows } from './itemDetails';

const base = {
  id: 'item-1',
  title: 'Item',
  status: 'wantToTry',
  tags: [],
  durationType: 'unknown',
  favorite: false,
  createdAt: '2030-01-01T00:00:00.000Z',
  updatedAt: '2030-01-01T00:00:00.000Z',
} as const;

function rows(item: Partial<LeisureItem> & Pick<LeisureItem, 'type'>) {
  return getItemDetailRows({ ...base, ...item } as LeisureItem).map(
    ({ label, value, href }) => `${label}: ${value}${href ? ` -> ${href}` : ''}`,
  );
}

describe('getItemDetailRows', () => {
  it('shows only the filled-in fields', () => {
    expect(rows({ type: 'hobby', hobby: {} })).toEqual([]);
  });

  it("lists a hobby's fields plus the shared ones, with a clickable http(s) link", () => {
    expect(
      rows({
        type: 'hobby',
        hobby: { startedAt: '2026-03-15', estimatedSessionDuration: 90 },
        priority: 'high',
        estimatedDuration: 120,
        durationType: 'flexible',
        minimumUsefulDuration: 30,
        sourceUrl: 'https://www.astrobin.com',
        recommendedBy: 'Canal Space Today',
      }),
    ).toEqual([
      'Começou em: 15/03/2026',
      'Duração da sessão: 1h30',
      'Prioridade: Alta',
      'Duração estimada: 2h',
      'Tipo de duração: Flexível',
      'Sessão mínima útil: 30 min',
      'Link: https://www.astrobin.com -> https://www.astrobin.com',
      'Recomendado por: Canal Space Today',
    ]);
  });

  it('never turns a non-http link into an anchor', () => {
    expect(rows({ type: 'hobby', hobby: {}, sourceUrl: 'javascript:alert(1)' })).toEqual([
      'Link: javascript:alert(1)',
    ]);
  });

  it('uses the type-specific labels for a book and a place', () => {
    expect(rows({ type: 'book', book: { author: 'Frank Herbert', pages: 412 } })).toEqual([
      'Autor: Frank Herbert',
      'Páginas: 412',
    ]);
    expect(
      rows({
        type: 'place',
        place: { category: 'parque', address: 'Av. Pedro Álvares Cabral', city: 'São Paulo' },
      }),
    ).toEqual(['Categoria: Parque', 'Endereço: Av. Pedro Álvares Cabral', 'Cidade: São Paulo']);
  });

  it('formats an event, including the ticket', () => {
    expect(
      rows({
        type: 'event',
        event: {
          date: '2026-11-20',
          time: '20:00',
          location: 'Allianz Parque',
          ticket: { purchased: true, price: 250, ticketUrl: 'https://tickets.example.com/x' },
        },
      }),
    ).toEqual([
      'Data: 20/11/2026',
      'Horário: 20:00',
      'Local: Allianz Parque',
      'Ingresso: Comprado',
      `Preço: ${(250).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      'Link do ingresso: https://tickets.example.com/x -> https://tickets.example.com/x',
    ]);
  });
});
