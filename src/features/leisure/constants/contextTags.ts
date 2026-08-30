export interface ContextTagDefinition {
  id: string;
  label: string;
}

/**
 * Recognized context tags — offered as quick-select chips wherever an
 * item's tags are edited, but stored in the same plain `tags: string[]`
 * as any free-text tag (never a dedicated field, per the spec).
 */
export const contextTagDefinitions: ContextTagDefinition[] = [
  { id: 'em-casa', label: 'Em casa' },
  { id: 'fora-de-casa', label: 'Fora de casa' },
  { id: 'sozinho', label: 'Sozinho' },
  { id: 'com-outras-pessoas', label: 'Com outras pessoas' },
];

export const contextTagIds = contextTagDefinitions.map((tag) => tag.id);
