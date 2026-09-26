'use client';

import { useEffect, useState } from 'react';

import { toTagSuggestions } from '@/design-system/components';

/**
 * Tags the user already used somewhere, offered back as suggestions so
 * the same tag keeps being reused instead of re-typed. `loadTags` must be
 * a stable (module-level) function; `fixedTags` are always included.
 * A failed load just means no suggestions — never an error state.
 */
export function useTagSuggestions(
  loadTags: () => Promise<string[]>,
  { enabled = true, fixedTags = [] }: { enabled?: boolean; fixedTags?: string[] } = {},
): string[] {
  const [loadedTags, setLoadedTags] = useState<string[]>([]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    loadTags()
      .then((tags) => {
        if (!cancelled) setLoadedTags(tags);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [enabled, loadTags]);

  return toTagSuggestions([...fixedTags, ...loadedTags]);
}
