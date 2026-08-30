import { beforeEach, describe, expect, it } from 'vitest';

import { programService } from './programService';
import { resetTrainingDb } from './trainingMockDb';

describe('programService', () => {
  beforeEach(() => {
    resetTrainingDb();
  });

  it('creates a program as a draft', async () => {
    const program = await programService.createProgram({
      name: 'Programa de teste',
      durationWeeks: 4,
      blocks: [],
    });
    expect(program.status).toBe('draft');
  });

  it('starting a program sets status, startDate and a derived endDate', async () => {
    const program = await programService.createProgram({
      name: 'Programa',
      durationWeeks: 4,
      blocks: [],
    });
    const started = await programService.startProgram(program.id, '2026-01-01');
    expect(started?.status).toBe('active');
    expect(started?.startDate).toBe('2026-01-01');
    expect(started?.endDate).toBe('2026-01-29');
  });

  it('pausing then resuming a program returns it to active status', async () => {
    const program = await programService.createProgram({
      name: 'Programa',
      durationWeeks: 4,
      blocks: [],
    });
    await programService.startProgram(program.id, '2026-01-01');
    const paused = await programService.pauseProgram(program.id);
    expect(paused?.status).toBe('paused');
    expect(paused?.pausedAt).toBeDefined();

    const resumed = await programService.resumeProgram(program.id);
    expect(resumed?.status).toBe('active');
    expect(resumed?.pausedAt).toBeUndefined();
  });

  it('completing a program sets status to completed', async () => {
    const program = await programService.createProgram({
      name: 'Programa',
      durationWeeks: 4,
      blocks: [],
    });
    const completed = await programService.completeProgram(program.id);
    expect(completed?.status).toBe('completed');
  });

  it('getActiveProgram returns the seeded active program', async () => {
    const active = await programService.getActiveProgram();
    expect(active?.status).toBe('active');
  });
});
