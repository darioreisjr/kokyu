import { describe, expect, it } from 'vitest';
import type { ScheduleEntry } from '../types';
import { detectScheduleConflicts } from './scheduleConflictEngine';

function createEntry(partial: Partial<ScheduleEntry>): ScheduleEntry {
  return {
    id: 'test-1',
    sourceType: 'manual',
    sourceId: 'src-1',
    title: 'Test Entry',
    date: '2026-08-31',
    duration: 60,
    status: 'planned',
    createdAt: '2026-08-31T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z',
    ...partial,
  };
}

describe('scheduleConflictEngine', () => {
  it('detects no conflicts when entries do not overlap', () => {
    const entries = [
      createEntry({ id: '1', title: 'Manhã', startAt: '09:00', endAt: '10:00', duration: 60 }),
      createEntry({ id: '2', title: 'Tarde', startAt: '14:00', endAt: '15:00', duration: 60 }),
    ];
    const conflicts = detectScheduleConflicts(entries);
    expect(conflicts).toHaveLength(0);
  });

  it('detects overlap between two entries', () => {
    const entries = [
      createEntry({ id: '1', title: 'Reunião', startAt: '10:00', endAt: '11:00', duration: 60 }),
      createEntry({ id: '2', title: 'Treino', startAt: '10:30', endAt: '11:30', duration: 60 }),
    ];
    const conflicts = detectScheduleConflicts(entries);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]!.type).toBe('overlap');
    expect(conflicts[0]!.severity).toBe('warning');
  });

  it('marks conflict as lockedConflict with error severity if both are locked', () => {
    const entries = [
      createEntry({ id: '1', title: 'Consulta', startAt: '10:00', endAt: '11:00', duration: 60, locked: true }),
      createEntry({ id: '2', title: 'Reunião Fixa', startAt: '10:30', endAt: '11:30', duration: 60, locked: true }),
    ];
    const conflicts = detectScheduleConflicts(entries);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]!.type).toBe('lockedConflict');
    expect(conflicts[0]!.severity).toBe('error');
  });

  it('detects outsideAvailability when an event falls outside configured day bounds', () => {
    const entries = [
      createEntry({ id: '1', title: 'Madrugada', startAt: '04:00', endAt: '05:00', duration: 60 }),
    ];
    const conflicts = detectScheduleConflicts(entries, { dayStartsAt: '06:00', dayEndsAt: '23:00' });
    expect(conflicts.some((c) => c.type === 'outsideAvailability')).toBe(true);
  });

  it('detects travelConflict when two physical locations have insufficient travel gap', () => {
    const entries = [
      createEntry({
        id: '1',
        title: 'Trabalho Escritório',
        startAt: '10:00',
        endAt: '11:00',
        duration: 60,
        location: { type: 'work', name: 'Escritório Central' },
      }),
      createEntry({
        id: '2',
        title: 'Treino Academia',
        startAt: '11:05',
        endAt: '12:00',
        duration: 55,
        location: { type: 'gym', name: 'Academia Smart' },
      }),
    ];
    const conflicts = detectScheduleConflicts(entries, { travelBufferMinutes: 15 });
    expect(conflicts.some((c) => c.type === 'travelConflict')).toBe(true);
  });
});

