import { beforeEach, describe, expect, it } from 'vitest';

import { historyService } from './historyService';
import { resetLeisureDb } from './leisureMockDb';

describe('historyService', () => {
  beforeEach(() => {
    resetLeisureDb();
  });

  it('lists history sorted most-recent-first', async () => {
    const history = await historyService.getHistory();
    expect(history.length).toBeGreaterThan(0);
    for (let i = 1; i < history.length; i += 1) {
      expect(history[i - 1]!.completedAt >= history[i]!.completedAt).toBe(true);
    }
  });

  it('creates a new log entry without duplicating the source item', async () => {
    const before = await historyService.getHistory();
    await historyService.createLogEntry({
      leisureItemId: 'movie-interestelar',
      activityType: 'movie',
      title: 'Interestelar',
      completedAt: new Date().toISOString(),
    });
    const after = await historyService.getHistory();
    expect(after.length).toBe(before.length + 1);
  });

  it('allows the same item to be logged more than once (rewatch)', async () => {
    await historyService.createLogEntry({
      leisureItemId: 'movie-interestelar',
      activityType: 'movie',
      title: 'Interestelar',
      completedAt: '2030-01-01T20:00:00.000Z',
    });
    await historyService.createLogEntry({
      leisureItemId: 'movie-interestelar',
      activityType: 'movie',
      title: 'Interestelar',
      completedAt: '2030-02-01T20:00:00.000Z',
    });
    const history = await historyService.getHistory();
    expect(history.filter((entry) => entry.leisureItemId === 'movie-interestelar')).toHaveLength(2);
  });
});
