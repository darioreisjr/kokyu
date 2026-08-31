'use client';

import { useCallback, useEffect, useState } from 'react';
import { scheduleInboxService } from '@/shared/scheduling/services/scheduleInboxService';
import type {
  InboxConversionTarget,
  ScheduleInboxItem,
  ScheduleInboxItemInput,
} from '@/shared/scheduling/types';

export function useScheduleInbox() {
  const [items, setItems] = useState<ScheduleInboxItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await scheduleInboxService.getInboxItems();
      setItems(list);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const addItem = useCallback(async (input: ScheduleInboxItemInput) => {
    const created = await scheduleInboxService.createInboxItem(input);
    setItems((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateItem = useCallback(async (id: string, patch: Partial<ScheduleInboxItemInput>) => {
    const updated = await scheduleInboxService.updateInboxItem(id, patch);
    if (updated) {
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    }
    return updated;
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    await scheduleInboxService.deleteInboxItem(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const convertItem = useCallback(
    async (id: string, target: InboxConversionTarget, entityId?: string) => {
      const processed = await scheduleInboxService.markAsProcessed(id, target, entityId);
      if (processed) {
        setItems((prev) => prev.map((item) => (item.id === id ? processed : item)));
      }
      return processed;
    },
    [],
  );

  return {
    items,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    convertItem,
    refreshInbox: loadItems,
  };
}

