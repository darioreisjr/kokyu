import { beforeEach, describe, expect, it } from 'vitest';
import { resetScheduleDb } from './scheduleMockDb';
import { scheduleInboxService } from './scheduleInboxService';

describe('scheduleInboxService', () => {
  beforeEach(() => {
    resetScheduleDb();
  });

  it('creates, updates and lists inbox items', async () => {
    const item = await scheduleInboxService.createInboxItem({
      title: 'Comprar ingressos',
      note: 'Para a pré-estreia.',
    });

    expect(item.id).toBeDefined();
    expect(item.title).toBe('Comprar ingressos');

    const updated = await scheduleInboxService.updateInboxItem(item.id, {
      title: 'Comprar ingressos IMAX',
    });
    expect(updated?.title).toBe('Comprar ingressos IMAX');

    const items = await scheduleInboxService.getInboxItems();
    expect(items.some((i) => i.id === item.id)).toBe(true);
  });

  it('marks item as processed when converted', async () => {
    const item = await scheduleInboxService.createInboxItem({
      title: 'Estudar TypeScript',
    });

    const processed = await scheduleInboxService.markAsProcessed(item.id, 'mission', 'mission-101');
    expect(processed?.processed).toBe(true);
    expect(processed?.convertedTarget).toBe('mission');
    expect(processed?.convertedEntityId).toBe('mission-101');
  });

  it('deletes an inbox item', async () => {
    const item = await scheduleInboxService.createInboxItem({
      title: 'Item temporário',
    });

    await scheduleInboxService.deleteInboxItem(item.id);
    const retrieved = await scheduleInboxService.getInboxItem(item.id);
    expect(retrieved).toBeNull();
  });
});

