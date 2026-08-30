import type { LeisureItemType } from '../types/leisureItem.types';

export interface LeisureItemTypeDefinition {
  id: LeisureItemType;
  label: string;
  /** Shown in "Biblioteca" filters, the item-type picker, etc. `null` types (place/event/hobby/unsorted) live in their own section instead. */
  section: 'library' | 'places' | 'hobbies' | 'hidden';
  /** Falls back to this when the item itself has no `minimumUsefulDuration` — used only for `flexible`/`unknown` duration types. */
  defaultMinimumUsefulDuration?: number;
}

/** The single source of truth for every item type's label and which section it belongs to — never hardcoded per component. */
export const leisureItemTypeDefinitions: LeisureItemTypeDefinition[] = [
  { id: 'movie', label: 'Filme', section: 'library' },
  { id: 'tvShow', label: 'Série', section: 'library' },
  { id: 'book', label: 'Livro', section: 'library', defaultMinimumUsefulDuration: 15 },
  { id: 'audiobook', label: 'Audiobook', section: 'library', defaultMinimumUsefulDuration: 15 },
  { id: 'game', label: 'Jogo', section: 'library', defaultMinimumUsefulDuration: 20 },
  { id: 'podcast', label: 'Podcast', section: 'library' },
  { id: 'music', label: 'Música', section: 'library' },
  { id: 'video', label: 'Vídeo', section: 'library' },
  { id: 'article', label: 'Artigo', section: 'library' },
  { id: 'website', label: 'Site', section: 'library' },
  { id: 'place', label: 'Lugar', section: 'places' },
  { id: 'event', label: 'Evento', section: 'places' },
  { id: 'activity', label: 'Atividade', section: 'library', defaultMinimumUsefulDuration: 15 },
  { id: 'hobby', label: 'Hobby', section: 'hobbies', defaultMinimumUsefulDuration: 30 },
  { id: 'custom', label: 'Personalizado', section: 'library' },
  { id: 'unsorted', label: 'Ainda não sei', section: 'hidden' },
];

const definitionById = new Map(
  leisureItemTypeDefinitions.map((definition) => [definition.id, definition]),
);

export function getLeisureItemTypeLabel(type: LeisureItemType): string {
  return definitionById.get(type)?.label ?? type;
}

export function getLeisureItemTypeDefinition(type: LeisureItemType): LeisureItemTypeDefinition {
  const definition = definitionById.get(type);
  if (!definition) throw new Error(`Unknown leisure item type: ${type}`);
  return definition;
}

/** Every "Biblioteca" filterable type, in display order. */
export const libraryItemTypes = leisureItemTypeDefinitions
  .filter((definition) => definition.section === 'library')
  .map((definition) => definition.id);
