export type NoteType = 'text' | 'checklist' | 'link' | 'idea';

export interface ChecklistNoteItem {
  id: string;
  text: string;
  checked: boolean;
}

/** A note can relate to any `LeisureItem` by id — never a copy of the item's content, always a reference. */
export interface NoteRelatedEntity {
  entityType: 'leisureItem';
  entityId: string;
}

export interface Note {
  id: string;
  title?: string;
  /** For `checklist` notes this is an optional description above the list; the items themselves live in `checklistItems`. */
  content: string;
  type: NoteType;
  checklistItems?: ChecklistNoteItem[];
  linkUrl?: string;
  tags: string[];
  pinned: boolean;
  archived: boolean;
  reminderDate?: string;
  relatedEntity?: NoteRelatedEntity;
  createdAt: string;
  updatedAt: string;
}
