import { describe, expect, it } from 'vitest';

import type { SettingsCategoryConfig } from '../components/SettingsNavigation/SettingsNavigation';
import type { SettingsSearchEntry } from '../constants/searchIndex';
import { searchSettings } from './searchSettings';

const categories: SettingsCategoryConfig[] = [
  { id: 'aparencia', label: 'Aparência', icon: () => null },
  { id: 'idioma-e-regiao', label: 'Idioma e região', icon: () => null },
];

const index: SettingsSearchEntry[] = [
  { anchorId: 'setting-aparencia-tema', sectionId: 'aparencia', label: 'Tema' },
  { anchorId: 'setting-idioma-regiao', sectionId: 'idioma-e-regiao', label: 'Região' },
];

describe('searchSettings', () => {
  it('returns nothing for an empty query', () => {
    expect(searchSettings('', index, categories)).toEqual([]);
    expect(searchSettings('   ', index, categories)).toEqual([]);
  });

  it('matches by label, case-insensitively', () => {
    const results = searchSettings('tema', index, categories);
    expect(results).toHaveLength(1);
    expect(results[0]?.anchorId).toBe('setting-aparencia-tema');
  });

  it('matches accented labels without the accent in the query', () => {
    const results = searchSettings('regiao', index, categories);
    expect(results).toHaveLength(1);
    expect(results[0]?.anchorId).toBe('setting-idioma-regiao');
  });

  it('also matches by category label', () => {
    const results = searchSettings('aparência', index, categories);
    expect(results).toHaveLength(1);
    expect(results[0]?.anchorId).toBe('setting-aparencia-tema');
  });

  it('returns no results for an unrelated query', () => {
    expect(searchSettings('xyzxyz', index, categories)).toEqual([]);
  });
});
