/** Every kind of thing Tempo Livre can track — one flat union, not a separate system per category. `unsorted` is the "Ainda não sei" placeholder used by Quick Capture before the user classifies an item. */
export type LeisureItemType =
  | 'movie'
  | 'tvShow'
  | 'book'
  | 'audiobook'
  | 'game'
  | 'podcast'
  | 'music'
  | 'video'
  | 'article'
  | 'website'
  | 'place'
  | 'event'
  | 'activity'
  | 'hobby'
  | 'custom'
  | 'unsorted';

/**
 * Shared across every item type — not every status makes sense for
 * every type (a place is never "abandoned"), so `constants/leisureStatuses.ts`
 * narrows which of these apply, and what label each wears, per type.
 */
export type LeisureItemStatus =
  'backlog' | 'planned' | 'inProgress' | 'completed' | 'paused' | 'abandoned' | 'archived';

/** `fixed` (a movie's runtime), `flexible` (a book — any session works), `unknown` (no data yet). Drives whether "O que cabe agora?" can ever suggest it. */
export type DurationType = 'fixed' | 'flexible' | 'unknown';

export type LeisurePriority = 'low' | 'medium' | 'high';

export interface LeisureItemBase {
  id: string;
  title: string;
  description?: string;
  status: LeisureItemStatus;
  coverImage?: string;
  /** Free tags plus the recognized context tags from `constants/contextTags.ts` (e.g. "em-casa") — never a separate field, per the spec's own "podem ser tags da atividade". */
  tags: string[];
  priority?: LeisurePriority;
  /** Minutes. Only meaningful when `durationType` is `fixed`; a `flexible` item instead leans on `minimumUsefulDuration`. */
  estimatedDuration?: number;
  durationType: DurationType;
  /** Minutes — the shortest session actually worth starting (a book: 15min; a hobby: 30min). Lets "O que cabe agora?" surface a flexible item without pretending it has a fixed length. */
  minimumUsefulDuration?: number;
  favorite: boolean;
  source?: string;
  sourceUrl?: string;
  recommendedBy?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface MovieItem extends LeisureItemBase {
  type: 'movie';
  movie: { runtime?: number; releaseYear?: number; genres?: string[] };
}

export interface TvShowItem extends LeisureItemBase {
  type: 'tvShow';
  tvShow: {
    currentSeason?: number;
    currentEpisode?: number;
    totalSeasons?: number;
    /** Episodes in the current season, when known — powers "Marcar próximo episódio como assistido" without needing full series metadata. */
    totalEpisodesInSeason?: number;
    genres?: string[];
  };
}

export interface BookItem extends LeisureItemBase {
  type: 'book';
  book: { author?: string; pages?: number; currentPage?: number };
}

export interface AudiobookItem extends LeisureItemBase {
  type: 'audiobook';
  audiobook: { author?: string; narrator?: string; totalMinutes?: number; currentMinute?: number };
}

export interface GameItem extends LeisureItemBase {
  type: 'game';
  game: { platform?: string; hoursPlayed?: number };
}

export interface PodcastItem extends LeisureItemBase {
  type: 'podcast';
  podcast: { totalEpisodes?: number; currentEpisode?: number };
}

export interface MusicItem extends LeisureItemBase {
  type: 'music';
  music: { artist?: string; album?: string; kind?: 'album' | 'playlist' | 'track' | 'other' };
}

export interface VideoItem extends LeisureItemBase {
  type: 'video';
  video: Record<string, never>;
}

export interface ArticleItem extends LeisureItemBase {
  type: 'article';
  article: { estimatedReadMinutes?: number };
}

export interface WebsiteItem extends LeisureItemBase {
  type: 'website';
  website: Record<string, never>;
}

export interface PlaceItem extends LeisureItemBase {
  type: 'place';
  place: { category: string; address?: string; city?: string };
}

export interface EventItem extends LeisureItemBase {
  type: 'event';
  event: {
    date?: string;
    time?: string;
    location?: string;
    ticket?: { purchased?: boolean; price?: number; ticketUrl?: string };
  };
}

export interface ActivityItem extends LeisureItemBase {
  type: 'activity';
  activity: Record<string, never>;
}

export interface HobbyItem extends LeisureItemBase {
  type: 'hobby';
  hobby: { startedAt?: string; estimatedSessionDuration?: number };
}

export interface CustomItem extends LeisureItemBase {
  type: 'custom';
  custom: Record<string, never>;
}

/** Quick Capture's "Ainda não sei" — no type-specific slice at all until the user organizes it. */
export interface UnsortedItem extends LeisureItemBase {
  type: 'unsorted';
  unsorted: Record<string, never>;
}

export type LeisureItem =
  | MovieItem
  | TvShowItem
  | BookItem
  | AudiobookItem
  | GameItem
  | PodcastItem
  | MusicItem
  | VideoItem
  | ArticleItem
  | WebsiteItem
  | PlaceItem
  | EventItem
  | ActivityItem
  | HobbyItem
  | CustomItem
  | UnsortedItem;

/**
 * Plain `Omit<Union, K>` collapses a discriminated union down to its
 * *common* keys only (TS's `keyof` on a union is an intersection),
 * silently dropping every type-specific data slice (`movie`, `book`,
 * ...). This distributes `Omit` over each member first, so the result
 * is still a proper discriminated union.
 */
export type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;
