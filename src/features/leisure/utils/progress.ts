import type { LeisureItem } from '../types/leisureItem.types';

export interface LeisureItemProgress {
  current: number;
  total: number;
  /** Always derived, never stored separately — see the spec's own "Não armazenar percentual separadamente." */
  percent: number;
}

function toProgress(
  current: number | undefined,
  total: number | undefined,
): LeisureItemProgress | null {
  // `current === 0` is a real, valid position (page 0 of a book just started) —
  // only its *absence* (`undefined`) means "no progress data at all."
  if (current === undefined || !total || total <= 0) return null;
  return { current, total, percent: Math.min(100, Math.round((current / total) * 100)) };
}

/** Reads whichever current/total pair applies to the item's own type — a book's pages, a series' episodes, an audiobook's minutes. Everything else returns `null` (no meaningful progress concept). */
export function getLeisureItemProgress(item: LeisureItem): LeisureItemProgress | null {
  if (item.type === 'book') return toProgress(item.book.currentPage, item.book.pages);
  if (item.type === 'audiobook')
    return toProgress(item.audiobook.currentMinute, item.audiobook.totalMinutes);
  if (item.type === 'tvShow')
    return toProgress(item.tvShow.currentEpisode, item.tvShow.totalEpisodesInSeason);
  if (item.type === 'podcast')
    return toProgress(item.podcast.currentEpisode, item.podcast.totalEpisodes);
  return null;
}
