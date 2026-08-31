export interface HabitPreferences {
  showStreak: boolean;
  showConsistencyScore: boolean;
  defaultTimerPresets: number[]; // in minutes, e.g. [5, 10, 15, 25, 30]
  soundOnComplete: boolean;
  celebrationAnimation: boolean;
}
