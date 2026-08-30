/** Lowercase + strip diacritics — every search/match/duplicate-check in this feature goes through this instead of a bespoke `toLowerCase()`. */
export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
