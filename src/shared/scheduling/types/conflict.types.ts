export type ConflictType =
  | 'overlap'
  | 'outsideAvailability'
  | 'deadlineRisk'
  | 'insufficientTime'
  | 'lockedConflict'
  | 'travelConflict';

export interface ScheduleConflictResolution {
  action: 'move' | 'shorten' | 'ignore';
  entryId?: string;
  targetTime?: string;
  label: string;
}

export interface ScheduleConflict {
  id: string;
  type: ConflictType;
  severity: 'warning' | 'error';
  entryIds: string[];
  message: string;
  suggestedResolutions?: ScheduleConflictResolution[];
}

