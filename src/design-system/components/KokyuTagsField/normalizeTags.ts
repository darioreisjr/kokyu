/** Same limits the API enforces (kokyu-sam `leisure-tags.schema.ts`). */
export const TAG_MAX_LENGTH = 40;
export const TAGS_MAX_COUNT = 30;

/**
 * Canonical tag form, identical to the backend's: trimmed, inner
 * whitespace collapsed, lower-cased (pt-BR). Accents and spaces are kept —
 * "Fim de Semana" becomes "fim de semana", never a slug.
 */
export function normalizeTag(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
}

/** Normalizes a whole list, dropping blanks and duplicates — for data that didn't come through `KokyuTagsField`. */
export function normalizeTags(tags: readonly string[]): string[] {
  return [...new Set(tags.map(normalizeTag).filter(Boolean))];
}

export interface AddTagsResult {
  tags: string[];
  /** Set when a tag couldn't be added — the caller keeps `rejected` in the input so nothing typed is lost. */
  error: string | null;
  rejected: string;
}

/** Appends raw user input to `current`, normalized and de-duplicated, stopping at the first tag that breaks a limit. */
export function addTags(current: string[], rawTags: string[]): AddTagsResult {
  const tags = [...current];
  for (let index = 0; index < rawTags.length; index += 1) {
    const tag = normalizeTag(rawTags[index]!);
    if (!tag || tags.includes(tag)) continue;
    const rejected = rawTags.slice(index).join(', ').trim();
    if (tag.length > TAG_MAX_LENGTH) {
      return {
        tags,
        error: `Cada tag pode ter até ${TAG_MAX_LENGTH} caracteres.`,
        rejected,
      };
    }
    if (tags.length >= TAGS_MAX_COUNT) {
      return { tags, error: `Use no máximo ${TAGS_MAX_COUNT} tags.`, rejected };
    }
    tags.push(tag);
  }
  return { tags, error: null, rejected: '' };
}

/** Normalizes, de-duplicates and sorts (pt-BR) a pool of tags for suggestions. */
export function toTagSuggestions(tags: Iterable<string>): string[] {
  const unique = new Set<string>();
  for (const tag of tags) {
    const normalized = normalizeTag(tag);
    if (normalized) unique.add(normalized);
  }
  return [...unique].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
