import type { Note } from '../types/note.types';
import { generateId, leisureDb } from './leisureMockDb';

export type NoteInput = Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'pinned' | 'archived'> & {
  pinned?: boolean;
  archived?: boolean;
};

/** Mocked — no real backend. */
export const noteService = {
  async getNotes(): Promise<Note[]> {
    return [...leisureDb.notes];
  },

  async getNote(id: string): Promise<Note | null> {
    return leisureDb.notes.find((note) => note.id === id) ?? null;
  },

  async createNote(input: NoteInput): Promise<Note> {
    const now = new Date().toISOString();
    const note: Note = {
      id: generateId('note'),
      pinned: false,
      archived: false,
      createdAt: now,
      updatedAt: now,
      ...input,
    };
    leisureDb.notes.push(note);
    return note;
  },

  async updateNote(id: string, patch: Partial<NoteInput>): Promise<Note | null> {
    const index = leisureDb.notes.findIndex((note) => note.id === id);
    if (index === -1) return null;
    const updated = { ...leisureDb.notes[index]!, ...patch, updatedAt: new Date().toISOString() };
    leisureDb.notes[index] = updated;
    return updated;
  },

  async archiveNote(id: string): Promise<Note | null> {
    return noteService.updateNote(id, { archived: true });
  },

  async deleteNote(id: string): Promise<void> {
    leisureDb.notes = leisureDb.notes.filter((note) => note.id !== id);
  },

  async togglePin(id: string): Promise<Note | null> {
    const index = leisureDb.notes.findIndex((note) => note.id === id);
    if (index === -1) return null;
    const existing = leisureDb.notes[index]!;
    const updated = { ...existing, pinned: !existing.pinned, updatedAt: new Date().toISOString() };
    leisureDb.notes[index] = updated;
    return updated;
  },

  async toggleChecklistItem(noteId: string, checklistItemId: string): Promise<Note | null> {
    const index = leisureDb.notes.findIndex((note) => note.id === noteId);
    if (index === -1) return null;
    const existing = leisureDb.notes[index]!;
    const updated = {
      ...existing,
      checklistItems: existing.checklistItems?.map((entry) =>
        entry.id === checklistItemId ? { ...entry, checked: !entry.checked } : entry,
      ),
      updatedAt: new Date().toISOString(),
    };
    leisureDb.notes[index] = updated;
    return updated;
  },
};
