export interface HabitReviewReflections {
  whatWorked?: string;
  whatWasHard?: string;
  changesPlanned?: string;
  timeAdjustments?: string;
  notes?: string;
}

export interface HabitReviewAdjustment {
  habitId: string;
  habitName: string;
  action: 'updated' | 'paused' | 'archived';
  note?: string;
}

export interface HabitReview {
  id: string;
  periodStart: string; // "yyyy-MM-dd"
  periodEnd: string;   // "yyyy-MM-dd"
  type: 'weekly' | 'monthly';
  reflections: HabitReviewReflections;
  adjustmentsMade: HabitReviewAdjustment[];
  createdAt: string;
}

