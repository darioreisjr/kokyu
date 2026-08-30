import { describe, expect, it } from 'vitest';

import { isNavigationItemActive } from './isNavigationItemActive';

describe('isNavigationItemActive', () => {
  it('matches an exact route', () => {
    expect(isNavigationItemActive('/app/treinamento', '/app/treinamento')).toBe(true);
  });

  it('matches a future sub-route of a non-root item', () => {
    expect(isNavigationItemActive('/app/treinamento/novo', '/app/treinamento')).toBe(true);
  });

  it('does not match an unrelated route', () => {
    expect(isNavigationItemActive('/app/nutricao', '/app/treinamento')).toBe(false);
  });

  it('does not match a route that merely shares a prefix string', () => {
    expect(isNavigationItemActive('/app/treinamento-extra', '/app/treinamento')).toBe(false);
  });

  it('keeps the root item ("/app") active only on an exact match', () => {
    expect(isNavigationItemActive('/app', '/app')).toBe(true);
    expect(isNavigationItemActive('/app/missoes', '/app')).toBe(false);
  });
});
