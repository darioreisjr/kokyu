export interface PlaceCategoryDefinition {
  id: string;
  label: string;
  order: number;
}

/** Configurable in spirit (a plain data table, not an enum) — future custom categories slot in without a type change. */
export const placeCategoryDefinitions: PlaceCategoryDefinition[] = [
  { id: 'cinema', label: 'Cinema', order: 0 },
  { id: 'restaurante', label: 'Restaurante', order: 1 },
  { id: 'cafe', label: 'Café', order: 2 },
  { id: 'parque', label: 'Parque', order: 3 },
  { id: 'museu', label: 'Museu', order: 4 },
  { id: 'teatro', label: 'Teatro', order: 5 },
  { id: 'show', label: 'Show', order: 6 },
  { id: 'evento', label: 'Evento', order: 7 },
  { id: 'trilha', label: 'Trilha', order: 8 },
  { id: 'praia', label: 'Praia', order: 9 },
  { id: 'bar', label: 'Bar', order: 10 },
  { id: 'shopping', label: 'Shopping', order: 11 },
  { id: 'viagem', label: 'Viagem', order: 12 },
  { id: 'passeio', label: 'Passeio', order: 13 },
  { id: 'outro', label: 'Outro', order: 14 },
];

const categoryById = new Map(placeCategoryDefinitions.map((category) => [category.id, category]));

export function getPlaceCategoryLabel(categoryId: string): string {
  return categoryById.get(categoryId)?.label ?? categoryId;
}
