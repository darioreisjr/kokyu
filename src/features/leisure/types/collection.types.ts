/** A personal list — items are referenced by id and can belong to several collections at once; nothing is ever physically moved into one. */
export interface LeisureCollection {
  id: string;
  name: string;
  description?: string;
  itemIds: string[];
  createdAt: string;
  updatedAt: string;
}
