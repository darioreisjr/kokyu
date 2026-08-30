import type { SettingsCategoryConfig } from '../components/SettingsNavigation/SettingsNavigation';
import type { SettingsSearchEntry } from '../constants/searchIndex';

export interface SettingsSearchResult extends SettingsSearchEntry {
  categoryLabel: string;
}

/** Lowercase + strip diacritics, so "Região"/"regiao"/"REGIÃO" all match the same way — no search library needed for a fixed, short index. */
function normalize(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** "Buscar nas configurações" — a simple substring match against each entry's own label and its category's label. */
export function searchSettings(
  query: string,
  index: SettingsSearchEntry[],
  categories: SettingsCategoryConfig[],
): SettingsSearchResult[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];

  const categoryLabelById = new Map(categories.map((category) => [category.id, category.label]));

  return index
    .map((entry) => ({ ...entry, categoryLabel: categoryLabelById.get(entry.sectionId) ?? '' }))
    .filter(
      (entry) =>
        normalize(entry.label).includes(normalizedQuery) ||
        normalize(entry.categoryLabel).includes(normalizedQuery),
    );
}
