import type { LeisureMoodId } from '../types/suggestion.types';

export interface MoodDefinition {
  id: LeisureMoodId;
  label: string;
}

/** "Estou com vontade de..." — a momentary filter, never stored as a mood/emotion record. */
export const moodDefinitions: MoodDefinition[] = [
  { id: 'relaxar', label: 'Relaxar' },
  { id: 'divertir', label: 'Me divertir' },
  { id: 'aprender', label: 'Aprender algo' },
  { id: 'sair', label: 'Sair de casa' },
  { id: 'ficar-em-casa', label: 'Ficar em casa' },
  { id: 'rapido', label: 'Algo rápido' },
  { id: 'longo', label: 'Algo mais longo' },
];

/** Mood → the tags/types it should bias toward. Kept intentionally loose (a hint, not a hard filter) so a mood never hides everything. */
export const moodTagHints: Record<LeisureMoodId, string[]> = {
  relaxar: ['relaxar'],
  divertir: ['diversao'],
  aprender: ['aprender'],
  sair: ['fora-de-casa'],
  'ficar-em-casa': ['em-casa'],
  rapido: [],
  longo: [],
};
