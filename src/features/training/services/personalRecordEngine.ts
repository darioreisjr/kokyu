import type {
  PerformedSet,
  PersonalRecord,
  PersonalRecordCheckResult,
  PersonalRecordType,
} from '../types';
import { calculateEstimatedOneRepMax } from './estimatedOneRepMaxCalculator';

function isRecordEligible(set: PerformedSet): boolean {
  return set.completed && set.setType !== 'warmup';
}

function findExisting(
  records: PersonalRecord[],
  recordType: PersonalRecordType,
  reps?: number,
): PersonalRecord | undefined {
  return records.find(
    (record) =>
      record.recordType === recordType && (recordType !== 'repPR' || record.reps === reps),
  );
}

/**
 * Compares one session's performed sets for a single exercise against its existing records —
 * returns one result per record type that has enough data to evaluate, `isNewRecord: false`
 * included so callers/tests can see "checked, no PR" as distinct from "not evaluable". Warmup sets
 * never count. `repPR` returns one entry per distinct rep count actually performed (the "PR by rep
 * range" table needs several, not just the single heaviest lift).
 */
export function checkForPersonalRecords(
  exerciseId: string,
  performedSets: PerformedSet[],
  existingRecords: PersonalRecord[],
): PersonalRecordCheckResult[] {
  const eligibleSets = performedSets.filter(isRecordEligible);
  if (eligibleSets.length === 0) return [];

  const results: PersonalRecordCheckResult[] = [];

  const weightedSets = eligibleSets.filter((set) => typeof set.weightKg === 'number');
  if (weightedSets.length > 0) {
    const best = weightedSets.reduce((max, set) => (set.weightKg! > max.weightKg! ? set : max));
    const existing = findExisting(existingRecords, 'maxWeight');
    results.push({
      exerciseId,
      recordType: 'maxWeight',
      newValue: best.weightKg!,
      previousValue: existing?.value,
      isNewRecord: !existing || best.weightKg! > existing.value,
    });
  }

  const bodyweightRepSets = eligibleSets.filter(
    (set) => typeof set.reps === 'number' && typeof set.weightKg !== 'number',
  );
  if (bodyweightRepSets.length > 0) {
    const best = bodyweightRepSets.reduce((max, set) => (set.reps! > max.reps! ? set : max));
    const existing = findExisting(existingRecords, 'maxReps');
    results.push({
      exerciseId,
      recordType: 'maxReps',
      newValue: best.reps!,
      previousValue: existing?.value,
      isNewRecord: !existing || best.reps! > existing.value,
    });
  }

  const volumeSets = eligibleSets.filter(
    (set) => typeof set.weightKg === 'number' && typeof set.reps === 'number',
  );

  if (volumeSets.length > 0) {
    const sessionVolume = volumeSets.reduce((total, set) => total + set.weightKg! * set.reps!, 0);
    const existingVolume = findExisting(existingRecords, 'maxVolume');
    results.push({
      exerciseId,
      recordType: 'maxVolume',
      newValue: sessionVolume,
      previousValue: existingVolume?.value,
      isNewRecord: !existingVolume || sessionVolume > existingVolume.value,
    });

    const bestE1rm = Math.max(
      ...volumeSets.map((set) => calculateEstimatedOneRepMax(set.weightKg!, set.reps!)),
    );
    const existingE1rm = findExisting(existingRecords, 'bestEstimatedOneRepMax');
    results.push({
      exerciseId,
      recordType: 'bestEstimatedOneRepMax',
      newValue: bestE1rm,
      previousValue: existingE1rm?.value,
      isNewRecord: !existingE1rm || bestE1rm > existingE1rm.value,
    });

    const bestWeightByReps = new Map<number, number>();
    for (const set of volumeSets) {
      const current = bestWeightByReps.get(set.reps!);
      if (current === undefined || set.weightKg! > current)
        bestWeightByReps.set(set.reps!, set.weightKg!);
    }
    for (const [reps, weightKg] of bestWeightByReps) {
      const existing = findExisting(existingRecords, 'repPR', reps);
      results.push({
        exerciseId,
        recordType: 'repPR',
        reps,
        newValue: weightKg,
        previousValue: existing?.value,
        isNewRecord: !existing || weightKg > existing.value,
      });
    }
  }

  return results;
}
