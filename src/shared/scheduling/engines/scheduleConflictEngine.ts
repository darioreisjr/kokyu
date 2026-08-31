import type {
  ScheduleConflict,
  ScheduleConflictResolution,
  ScheduleEntry,
} from '../types';
import {
  addMinutesToTime,
  calculateDurationMinutes,
  isTimeOverlapping,
  timeToMinutes,
} from '../utils/timeHelpers';

export interface ConflictEngineOptions {
  dayStartsAt?: string; // "06:00"
  dayEndsAt?: string;   // "23:00"
  travelBufferMinutes?: number; // default 15 min
}

export function detectScheduleConflicts(
  entries: ScheduleEntry[],
  options: ConflictEngineOptions = {},
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  const dayStartsAt = options.dayStartsAt ?? '06:00';
  const dayEndsAt = options.dayEndsAt ?? '23:00';
  const travelBuffer = options.travelBufferMinutes ?? 15;

  const activeTimedEntries = entries.filter(
    (e) => !e.allDay && e.startAt && e.status !== 'cancelled' && e.status !== 'skipped',
  );

  // 1. Check bounds against awake day window
  const dayStartMin = timeToMinutes(dayStartsAt);
  const dayEndMin = timeToMinutes(dayEndsAt);

  for (const entry of activeTimedEntries) {
    if (!entry.startAt) continue;
    const startMin = timeToMinutes(entry.startAt);
    const endAt = entry.endAt ?? addMinutesToTime(entry.startAt, entry.duration);
    const endMin = timeToMinutes(endAt);

    if (startMin < dayStartMin || endMin > dayEndMin) {
      conflicts.push({
        id: `outside-avail-${entry.id}`,
        type: 'outsideAvailability',
        severity: 'warning',
        entryIds: [entry.id],
        message: `"${entry.title}" está agendado fora do seu horário habitual (${dayStartsAt} - ${dayEndsAt}).`,
        suggestedResolutions: [
          {
            action: 'move',
            entryId: entry.id,
            label: 'Mover para horário disponível',
          },
          { action: 'ignore', label: 'Manter mesmo assim' },
        ],
      });
    }
  }

  // 2. Check Overlaps
  for (let i = 0; i < activeTimedEntries.length; i++) {
    const a = activeTimedEntries[i]!;
    const aStart = a.startAt!;
    const aEnd = a.endAt ?? addMinutesToTime(aStart, a.duration);

    for (let j = i + 1; j < activeTimedEntries.length; j++) {
      const b = activeTimedEntries[j]!;
      const bStart = b.startAt!;
      const bEnd = b.endAt ?? addMinutesToTime(bStart, b.duration);

      if (isTimeOverlapping(aStart, aEnd, bStart, bEnd)) {
        const bothLocked = a.locked && b.locked;
        const conflictType = bothLocked ? 'lockedConflict' : 'overlap';
        const severity = bothLocked ? 'error' : 'warning';

        const resolutions: ScheduleConflictResolution[] = [];
        if (!a.locked) {
          resolutions.push({
            action: 'move',
            entryId: a.id,
            label: `Mover "${a.title}"`,
          });
        }
        if (!b.locked) {
          resolutions.push({
            action: 'move',
            entryId: b.id,
            label: `Mover "${b.title}"`,
          });
        }
        resolutions.push({ action: 'ignore', label: 'Ignorar sobreposição' });

        conflicts.push({
          id: `overlap-${a.id}-${b.id}`,
          type: conflictType,
          severity,
          entryIds: [a.id, b.id],
          message: `"${a.title}" (${aStart} - ${aEnd}) e "${b.title}" (${bStart} - ${bEnd}) estão sobrepostos.`,
          suggestedResolutions: resolutions,
        });
      }
    }
  }

  // 3. Check Travel buffer conflicts (consecutive entries with differing physical locations)
  const sorted = [...activeTimedEntries].sort(
    (a, b) => timeToMinutes(a.startAt!) - timeToMinutes(b.startAt!),
  );

  for (let i = 0; i < sorted.length - 1; i++) {
    const first = sorted[i]!;
    const second = sorted[i + 1]!;
    const firstEnd = first.endAt ?? addMinutesToTime(first.startAt!, first.duration);
    const secondStart = second.startAt!;

    const gapMinutes = calculateDurationMinutes(firstEnd, secondStart);

    const firstLoc = first.location?.type ?? 'other';
    const secondLoc = second.location?.type ?? 'other';

    const isDifferentPhysical =
      firstLoc !== 'online' &&
      secondLoc !== 'online' &&
      firstLoc !== secondLoc &&
      (first.location?.name !== second.location?.name || !first.location?.name);

    if (isDifferentPhysical && gapMinutes < travelBuffer && timeToMinutes(firstEnd) <= timeToMinutes(secondStart)) {
      conflicts.push({
        id: `travel-${first.id}-${second.id}`,
        type: 'travelConflict',
        severity: 'warning',
        entryIds: [first.id, second.id],
        message: `Intervalo insuficiente (${gapMinutes} min) para deslocamento entre "${first.title}" e "${second.title}" (mínimo sugerido: ${travelBuffer} min).`,
        suggestedResolutions: [
          {
            action: 'move',
            entryId: second.id,
            targetTime: addMinutesToTime(firstEnd, travelBuffer),
            label: `Ajustar início de "${second.title}" para ${addMinutesToTime(firstEnd, travelBuffer)}`,
          },
          { action: 'ignore', label: 'Ignorar' },
        ],
      });
    }
  }

  return conflicts;
}

