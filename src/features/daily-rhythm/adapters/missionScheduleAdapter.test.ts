import { beforeEach, describe, expect, it } from 'vitest';
import { missionScheduleAdapter, resetMissionDb } from './missionScheduleAdapter';

describe('missionScheduleAdapter', () => {
  beforeEach(() => {
    resetMissionDb();
  });

  it('fetches mission entries for date and supports completion', async () => {
    const today = new Date().toISOString().split('T')[0]!;
    const entries = await missionScheduleAdapter.getEntriesForDate(today);
    expect(entries.length).toBeGreaterThanOrEqual(1);

    const first = entries[0]!;
    expect(first.sourceType).toBe('mission');
    expect(first.status).toBe('planned');

    await missionScheduleAdapter.onEntryCompleted!(first);
    const updated = await missionScheduleAdapter.getEntriesForDate(today);
    expect(updated[0]!.status).toBe('completed');
  });
});

