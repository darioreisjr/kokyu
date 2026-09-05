import { beforeEach, describe, expect, it } from 'vitest';
import { resetMissionDb } from './missionMockDb';
import { missionChecklistService } from './missionChecklistService';

describe('missionChecklistService', () => {
  beforeEach(() => {
    resetMissionDb();
  });

  it('adds items in order and toggles completion', async () => {
    const item = await missionChecklistService.addChecklistItem('mission-auth', 'Nova etapa');
    const items = await missionChecklistService.getChecklistItems('mission-auth');
    expect(items.at(-1)?.id).toBe(item.id);

    await missionChecklistService.updateChecklistItem(item.id, { completed: true });
    const updated = await missionChecklistService.getChecklistItems('mission-auth');
    expect(updated.find((i) => i.id === item.id)?.completed).toBe(true);
  });

  it('deletes an item', async () => {
    const items = await missionChecklistService.getChecklistItems('mission-auth');
    await missionChecklistService.deleteChecklistItem(items[0]!.id);
    const remaining = await missionChecklistService.getChecklistItems('mission-auth');
    expect(remaining.find((i) => i.id === items[0]!.id)).toBeUndefined();
  });
});
