// Unicode's "combining diacritical marks" block — stripping it after NFD normalization is what
// turns "é"/"ã" into their plain-letter equivalents for accent-insensitive search.
const COMBINING_DIACRITICS_START = 0x0300;
const COMBINING_DIACRITICS_END = 0x036f;

/** Shared by every Treinamento filter util — accent-insensitive, case-insensitive. */
export function normalizeSearchText(value: string): string {
  return Array.from(value.normalize('NFD'))
    .filter((char) => {
      const codePoint = char.codePointAt(0) ?? 0;
      return codePoint < COMBINING_DIACRITICS_START || codePoint > COMBINING_DIACRITICS_END;
    })
    .join('')
    .toLowerCase();
}
