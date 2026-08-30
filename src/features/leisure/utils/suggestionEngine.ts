import { getLeisureItemTypeDefinition } from '../constants/leisureItemTypes';
import { leisureConfig } from '../constants/leisureConfig';
import { moodTagHints } from '../constants/moods';
import type { LeisureItem, LeisureItemStatus } from '../types/leisureItem.types';
import type { AvailableTimeSuggestionInput, RankedSuggestion } from '../types/suggestion.types';

const defaultEligibleStatuses: LeisureItemStatus[] = ['backlog', 'planned', 'inProgress', 'paused'];

/** Opposite-context pairs — having one excludes an item explicitly tagged with the other, per "não retornar atividade marcada exclusivamente Fora de casa" when the user is home. An item with neither tag is never excluded (silence isn't a claim). */
const oppositeContextTag: Record<string, string> = {
  'em-casa': 'fora-de-casa',
  'fora-de-casa': 'em-casa',
  sozinho: 'com-outras-pessoas',
  'com-outras-pessoas': 'sozinho',
};

/**
 * The duration actually used to judge whether an item fits — the
 * single place this decision is made, never re-derived per screen.
 * `fixed` items need their own `estimatedDuration`; `flexible` items
 * fall back to the item's `minimumUsefulDuration`, then the type's
 * own default, then a global fallback; `unknown` never fits (there's
 * nothing to judge against).
 */
export function getEffectiveDuration(item: LeisureItem): number | null {
  if (item.durationType === 'fixed') {
    return item.estimatedDuration ?? null;
  }
  if (item.durationType === 'flexible') {
    if (item.minimumUsefulDuration) return item.minimumUsefulDuration;
    const typeDefault = getLeisureItemTypeDefinition(item.type).defaultMinimumUsefulDuration;
    return typeDefault ?? leisureConfig.fallbackMinimumUsefulDuration;
  }
  return null;
}

function priorityWeight(item: LeisureItem): number {
  if (item.priority === 'high') return 3;
  if (item.priority === 'medium') return 2;
  if (item.priority === 'low') return 1;
  return 0;
}

/**
 * "O que cabe agora?" — the one algorithm behind every entry point
 * that asks it (Hoje's own picker, and any future surface), so it's
 * never re-implemented per component. No AI: a plain filter-then-sort
 * pipeline, exactly as the spec's own "ALGORITMO INICIAL" describes.
 */
export function getSuggestionsForAvailableTime(
  items: LeisureItem[],
  input: AvailableTimeSuggestionInput,
): RankedSuggestion[] {
  const eligibleStatuses = input.statuses ?? defaultEligibleStatuses;
  const excludedContextTag = input.contextTag ? oppositeContextTag[input.contextTag] : undefined;
  const moodTags = input.mood ? moodTagHints[input.mood] : [];

  const ranked: RankedSuggestion[] = [];

  for (const item of items) {
    if (!eligibleStatuses.includes(item.status)) continue;
    if (input.type && item.type !== input.type) continue;
    if (excludedContextTag && item.tags.includes(excludedContextTag)) continue;

    const effectiveDuration = getEffectiveDuration(item);
    if (effectiveDuration === null || effectiveDuration > input.durationMinutes) continue;

    ranked.push({ item, effectiveDuration });
  }

  const preferShorter = input.mood === 'rapido';
  const moodMatches = (entry: RankedSuggestion) =>
    moodTags.length > 0 && moodTags.some((tag) => entry.item.tags.includes(tag)) ? 1 : 0;

  ranked.sort((a, b) => {
    const moodDelta = moodMatches(b) - moodMatches(a);
    if (moodDelta !== 0) return moodDelta;
    const favoriteDelta = Number(b.item.favorite) - Number(a.item.favorite);
    if (favoriteDelta !== 0) return favoriteDelta;
    const priorityDelta = priorityWeight(b.item) - priorityWeight(a.item);
    if (priorityDelta !== 0) return priorityDelta;
    const durationDelta = (a.effectiveDuration ?? 0) - (b.effectiveDuration ?? 0);
    return preferShorter ? durationDelta : -durationDelta;
  });

  return ranked;
}
