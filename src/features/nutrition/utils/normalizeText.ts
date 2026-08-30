/** Lowercase + strip diacritics — every search/match in this feature (ingredient dedupe, recipe search, pantry search) goes through this instead of a bespoke `toLowerCase()`. */
export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
