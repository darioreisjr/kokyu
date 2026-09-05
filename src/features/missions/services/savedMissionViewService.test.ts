import { beforeEach, describe, expect, it } from 'vitest';
import { resetMissionDb } from './missionMockDb';
import { savedMissionViewService } from './savedMissionViewService';

describe('savedMissionViewService', () => {
  beforeEach(() => {
    resetMissionDb();
  });

  it('persists a saved view configuration', async () => {
    const view = await savedMissionViewService.createSavedMissionView({
      name: 'Até 30 minutos',
      filters: { durationMax: 30 },
      sorting: { field: 'duration', direction: 'asc' },
      grouping: 'none',
      layout: 'list',
    });

    const all = await savedMissionViewService.getSavedMissionViews();
    expect(all.find((v) => v.id === view.id)?.filters.durationMax).toBe(30);
  });

  it('updates an existing saved view in place', async () => {
    const views = await savedMissionViewService.getSavedMissionViews();
    const existing = views[0]!;
    await savedMissionViewService.updateSavedMissionView(existing.id, { name: 'Renomeada' });

    const updated = (await savedMissionViewService.getSavedMissionViews()).find((v) => v.id === existing.id);
    expect(updated?.name).toBe('Renomeada');
  });
});
