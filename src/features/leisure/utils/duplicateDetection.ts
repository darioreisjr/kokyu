import type { LeisureItem } from '../types/leisureItem.types';
import { normalizeText } from './normalizeText';

/**
 * Warns before saving, never blocks — "Não impedir obrigatoriamente."
 * Matches on normalized title or an identical `sourceUrl`, the two
 * signals the spec calls out explicitly.
 */
export function findPossibleDuplicate(
  items: LeisureItem[],
  candidate: { title: string; sourceUrl?: string },
): LeisureItem | undefined {
  const normalizedTitle = normalizeText(candidate.title);
  return items.find((item) => {
    if (candidate.sourceUrl && item.sourceUrl && item.sourceUrl === candidate.sourceUrl)
      return true;
    return normalizeText(item.title) === normalizedTitle;
  });
}
