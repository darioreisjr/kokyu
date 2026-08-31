export type CapacityStatus = 'light' | 'balanced' | 'full' | 'overcapacity';

export interface DailyCapacity {
  /** "yyyy-MM-dd" */
  date: string;
  /** Total awake minutes from day start to day end (e.g. 06:00 to 23:00 = 1020 min). */
  totalDayDurationMinutes: number;
  /** Sum of minutes occupied by fixed (locked) events, blocked times, and breaks. */
  fixedBlockedMinutes: number;
  /** Net available minutes = totalDayDurationMinutes - fixedBlockedMinutes. */
  availableMinutes: number;
  /** Sum of minutes planned for flexible activities. */
  plannedWorkloadMinutes: number;
  /** Utilization percentage (plannedWorkloadMinutes / availableMinutes * 100). */
  utilizationPercent: number;
  status: CapacityStatus;
  /** Overcapacity difference (> 0 means overtime overload) or remaining buffer minutes. */
  differenceMinutes: number;
}

export interface DailyWorkload {
  date: string;
  totalMinutes: number;
  bySource: Record<string, number>;
  byPriority: Record<string, number>;
}

