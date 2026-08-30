export type PersonalRecordType =
  'maxWeight' | 'maxReps' | 'maxVolume' | 'bestEstimatedOneRepMax' | 'repPR';

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  recordType: PersonalRecordType;
  value: number;
  /** Only meaningful for `repPR` — the rep count this record was set at (powers the "PR by rep range" table). */
  reps?: number;
  achievedAt: string;
  sessionId: string;
  previousValue?: number;
}

export interface PersonalRecordCheckResult {
  exerciseId: string;
  recordType: PersonalRecordType;
  isNewRecord: boolean;
  previousValue?: number;
  newValue: number;
  reps?: number;
}
