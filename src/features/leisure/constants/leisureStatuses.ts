import type { LeisureItemStatus, LeisureItemType } from '../types/leisureItem.types';

/** Generic fallback labels — overridden per type below wherever the spec gives a more natural phrase ("Assistido" instead of "Concluído" for a movie). */
const defaultStatusLabels: Record<LeisureItemStatus, string> = {
  backlog: 'Quero aproveitar',
  planned: 'Planejado',
  inProgress: 'Em andamento',
  completed: 'Concluído',
  paused: 'Pausado',
  abandoned: 'Abandonado',
  archived: 'Arquivado',
};

/** Which of the 7 global statuses make sense for each type — a place is never "abandoned", a movie is rarely "paused". */
const applicableStatusesByType: Record<LeisureItemType, LeisureItemStatus[]> = {
  movie: ['backlog', 'planned', 'inProgress', 'completed', 'archived'],
  tvShow: ['backlog', 'planned', 'inProgress', 'paused', 'completed', 'abandoned', 'archived'],
  book: ['backlog', 'inProgress', 'paused', 'completed', 'abandoned', 'archived'],
  audiobook: ['backlog', 'inProgress', 'paused', 'completed', 'abandoned', 'archived'],
  game: ['backlog', 'inProgress', 'paused', 'completed', 'abandoned', 'archived'],
  podcast: ['backlog', 'inProgress', 'completed', 'abandoned', 'archived'],
  music: ['backlog', 'completed', 'archived'],
  video: ['backlog', 'completed', 'archived'],
  article: ['backlog', 'inProgress', 'completed', 'archived'],
  website: ['backlog', 'completed', 'archived'],
  place: ['backlog', 'planned', 'completed', 'archived'],
  event: ['backlog', 'planned', 'completed', 'archived'],
  activity: ['backlog', 'planned', 'inProgress', 'completed', 'archived'],
  hobby: ['backlog', 'inProgress', 'paused', 'completed', 'archived'],
  custom: ['backlog', 'planned', 'inProgress', 'completed', 'paused', 'abandoned', 'archived'],
  unsorted: ['backlog'],
};

/** Per-type overrides for how a status reads — only where the generic label would sound wrong. */
const statusLabelOverridesByType: Partial<
  Record<LeisureItemType, Partial<Record<LeisureItemStatus, string>>>
> = {
  movie: { backlog: 'Para assistir', completed: 'Assistido' },
  tvShow: { backlog: 'Quero assistir', inProgress: 'Assistindo', completed: 'Concluída' },
  book: { backlog: 'Quero ler', inProgress: 'Lendo', completed: 'Lido' },
  audiobook: { backlog: 'Quero ouvir', inProgress: 'Ouvindo', completed: 'Ouvido' },
  game: { backlog: 'Quero jogar', inProgress: 'Jogando', completed: 'Finalizado' },
  podcast: { backlog: 'Quero ouvir', inProgress: 'Ouvindo', completed: 'Concluído' },
  place: { backlog: 'Quero conhecer', completed: 'Visitado' },
  event: { backlog: 'Quero ir', completed: 'Aconteceu' },
  hobby: {
    backlog: 'Quero experimentar',
    inProgress: 'Praticando',
    completed: 'Concluído, quando aplicável',
  },
};

export function getApplicableStatuses(type: LeisureItemType): LeisureItemStatus[] {
  return applicableStatusesByType[type];
}

export function getStatusLabel(type: LeisureItemType, status: LeisureItemStatus): string {
  return statusLabelOverridesByType[type]?.[status] ?? defaultStatusLabels[status];
}
