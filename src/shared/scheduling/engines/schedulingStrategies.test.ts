import { describe, expect, it } from 'vitest';
import type { FreeTimeSlot, ScheduleEntry } from '../types';
import { evaluateItemForSlot } from './schedulingStrategies';

function createEntry(partial: Partial<ScheduleEntry>): ScheduleEntry {
  return {
    id: 'test-1',
    sourceType: 'mission',
    sourceId: 'm-1',
    title: 'Desenvolver Feature',
    date: '2026-08-31',
    duration: 60,
    status: 'planned',
    createdAt: '2026-08-31T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z',
    ...partial,
  };
}

describe('schedulingStrategies', () => {
  const slot: FreeTimeSlot = {
    id: 'slot-1',
    date: '2026-08-31',
    startAt: '09:00',
    endAt: '11:00',
    duration: 120,
  };

  it('scores high priority items higher', () => {
    const highItem = createEntry({ priority: 'high', duration: 45 });
    const lowItem = createEntry({ priority: 'low', duration: 45 });

    const evalHigh = evaluateItemForSlot(highItem, slot, { bufferMinutes: 0 });
    const evalLow = evaluateItemForSlot(lowItem, slot, { bufferMinutes: 0 });

    expect(evalHigh.fits).toBe(true);
    expect(evalLow.fits).toBe(true);
    expect(evalHigh.score).toBeGreaterThan(evalLow.score);
    expect(evalHigh.reason).toContain('alta prioridade');
  });

  it('rejects slots outside required timeWindow', () => {
    const item = createEntry({
      duration: 30,
      timeWindow: { start: '14:00', end: '18:00' },
    });

    const evalResult = evaluateItemForSlot(item, slot);
    expect(evalResult.fits).toBe(false);
    expect(evalResult.score).toBe(-1);
    expect(evalResult.reason).toContain('Fora da janela');
  });

  it('supports chunking for splittable items when item duration exceeds slot', () => {
    const longItem = createEntry({
      duration: 180,
      splittable: true,
      minChunkDuration: 30,
    });

    const smallSlot: FreeTimeSlot = {
      id: 'slot-2',
      date: '2026-08-31',
      startAt: '09:00',
      endAt: '10:00',
      duration: 60,
    };

    const evalResult = evaluateItemForSlot(longItem, smallSlot, { bufferMinutes: 0 });
    expect(evalResult.fits).toBe(false);
    expect(evalResult.canChunk).toBe(true);
    expect(evalResult.chunkDuration).toBe(60);
  });

  it('rejects chunking when item is NOT splittable', () => {
    const unsplittableItem = createEntry({
      duration: 120,
      splittable: false,
    });

    const smallSlot: FreeTimeSlot = {
      id: 'slot-2',
      date: '2026-08-31',
      startAt: '09:00',
      endAt: '09:45',
      duration: 45,
    };

    const evalResult = evaluateItemForSlot(unsplittableItem, smallSlot, { bufferMinutes: 0 });
    expect(evalResult.fits).toBe(false);
    expect(evalResult.canChunk).toBe(false);
  });
});

