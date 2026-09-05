/**
 * The sections a user can show/hide/reorder via "Personalizar Respiração".
 * `now`/`next` are excluded from what the customize dialog offers to hide
 * (see `HomePersonalizationDialog`) — they stay easy to get back to, per spec.
 */
export const HOME_SECTION_IDS = [
  'now',
  'next',
  'focus',
  'rhythm',
  'areas',
  'attention',
  'freeTime',
  'quickActions',
] as const;

export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

export const HOME_SECTION_LABELS: Record<HomeSectionId, string> = {
  now: 'Agora',
  next: 'Próximo',
  focus: 'Em foco',
  rhythm: 'Ritmo do dia',
  areas: 'Áreas de hoje',
  attention: 'Precisa de atenção',
  freeTime: 'Tempo livre',
  quickActions: 'Adicionar',
};

/** Sections a user is never allowed to hide from Home entirely (still reorderable). */
export const HOME_ESSENTIAL_SECTIONS: readonly HomeSectionId[] = ['now', 'next'];
