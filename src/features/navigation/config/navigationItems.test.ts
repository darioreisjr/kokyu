import { describe, expect, it } from 'vitest';

import { bottomNavigationItems, navigationItems } from './navigationItems';

describe('navigationItems', () => {
  it('lists the eight primary sections in the specified order', () => {
    expect(navigationItems.map((item) => item.label)).toEqual([
      'Respiração',
      'Missões',
      'Ritmo Diário',
      'Treinamento',
      'Nutrição',
      'Hábitos',
      'Metas',
      'Tempo Livre',
    ]);
  });

  it('routes every primary item under /app', () => {
    for (const item of navigationItems) {
      expect(item.href === '/app' || item.href.startsWith('/app/')).toBe(true);
    }
  });

  it('has no duplicate ids or hrefs across both lists', () => {
    const all = [...navigationItems, ...bottomNavigationItems];
    expect(new Set(all.map((item) => item.id)).size).toBe(all.length);
    expect(new Set(all.map((item) => item.href)).size).toBe(all.length);
  });

  it('gives every item an icon component', () => {
    for (const item of [...navigationItems, ...bottomNavigationItems]) {
      expect(item.icon).toBeDefined();
    }
  });
});

describe('bottomNavigationItems', () => {
  it('lists Perfil and Configurações', () => {
    expect(bottomNavigationItems.map((item) => item.label)).toEqual(['Perfil', 'Configurações']);
  });

  it('routes to /app/perfil and /app/configuracoes', () => {
    expect(bottomNavigationItems.map((item) => item.href)).toEqual([
      '/app/perfil',
      '/app/configuracoes',
    ]);
  });
});
