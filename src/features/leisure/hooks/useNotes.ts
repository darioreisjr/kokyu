'use client';

import { useCallback, useEffect, useState } from 'react';

import { leisureItemService } from '../services/leisureItemService';
import { noteService } from '../services/noteService';
import type { LeisureItem } from '../types/leisureItem.types';
import type { Note } from '../types/note.types';

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface UseNotesResult {
  status: LoadStatus;
  notes: Note[];
  items: LeisureItem[];
  reload: () => void;
}

/** Notes alongside every item — a note related to a `LeisureItem` needs that item's title/type to render its reference without a second fetch. */
export function useNotes(): UseNotesResult {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [notes, setNotes] = useState<Note[]>([]);
  const [items, setItems] = useState<LeisureItem[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    Promise.all([noteService.getNotes(), leisureItemService.getLeisureItems()])
      .then(([loadedNotes, loadedItems]) => {
        if (cancelled) return;
        setNotes(loadedNotes);
        setItems(loadedItems);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return { status, notes, items, reload };
}
