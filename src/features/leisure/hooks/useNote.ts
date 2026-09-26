'use client';

import { useEffect, useState } from 'react';

import { noteService } from '../services/noteService';
import type { Note } from '../types/note.types';

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface UseNoteResult {
  status: LoadStatus;
  note: Note | null;
}

/** A single note by id — the edit page's own fetch, independent of the Notas list. */
export function useNote(id: string): UseNoteResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [note, setNote] = useState<Note | null>(null);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    noteService
      .getNote(id)
      .then((loadedNote) => {
        if (cancelled) return;
        setNote(loadedNote);
        setStatus(loadedNote ? 'ready' : 'error');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { status, note };
}
