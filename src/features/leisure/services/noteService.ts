import { apiFetchClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';

import type { Note } from '../types/note.types';

export type NoteInput = Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'pinned' | 'archived'> & {
  pinned?: boolean;
  archived?: boolean;
};

export const noteService = {
  async getNotes(): Promise<Note[]> {
    return apiFetchClient<Note[]>('/leisure/notes');
  },

  async getNote(id: string): Promise<Note | null> {
    try {
      return await apiFetchClient<Note>(`/leisure/notes/${id}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  async createNote(input: NoteInput): Promise<Note> {
    return apiFetchClient<Note>('/leisure/notes', { method: 'POST', body: input });
  },

  async updateNote(id: string, patch: Partial<NoteInput>): Promise<Note | null> {
    try {
      return await apiFetchClient<Note>(`/leisure/notes/${id}`, { method: 'PATCH', body: patch });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  async archiveNote(id: string): Promise<Note | null> {
    return noteService.updateNote(id, { archived: true });
  },

  async deleteNote(id: string): Promise<void> {
    await apiFetchClient<void>(`/leisure/notes/${id}`, { method: 'DELETE' });
  },

  async togglePin(id: string): Promise<Note | null> {
    try {
      return await apiFetchClient<Note>(`/leisure/notes/${id}/pin`, { method: 'POST' });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  async toggleChecklistItem(noteId: string, checklistItemId: string): Promise<Note | null> {
    try {
      return await apiFetchClient<Note>(`/leisure/notes/${noteId}/checklist/${checklistItemId}`, {
        method: 'PATCH',
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },
};
