'use client';

import { useEffect } from 'react';

export interface ScheduleShortcutsHandlers {
  onNewItem?: () => void;
  onGoToToday?: () => void;
  onStartFocus?: () => void;
  onOpenPlan?: () => void;
}

export function useScheduleShortcuts(handlers: ScheduleShortcutsHandlers) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Don't trigger shortcuts if user is typing in form controls
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Ignore if modifier keys are pressed (e.g. Ctrl+N, Cmd+P)
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      switch (event.key.toUpperCase()) {
        case 'N':
          event.preventDefault();
          handlers.onNewItem?.();
          break;
        case 'T':
          event.preventDefault();
          handlers.onGoToToday?.();
          break;
        case 'F':
          event.preventDefault();
          handlers.onStartFocus?.();
          break;
        case 'P':
          event.preventDefault();
          handlers.onOpenPlan?.();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}

