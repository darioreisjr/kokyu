export type GoalPerceivedStatus = 'onTrack' | 'attention' | 'atRisk';

export type GoalCheckInFrequency = 'none' | 'weekly' | 'biweekly' | 'monthly' | 'custom';

/**
 * A check-in is a reflection, not a number — it can exist with or without a paired
 * `GoalProgressEntry`. Every field beyond `perceivedStatus` is optional; nothing here is required.
 */
export interface GoalCheckIn {
  id: string;
  goalId: string;
  perceivedStatus: GoalPerceivedStatus;
  /** 1 (baixa) to 5 (alta). */
  confidence?: number;
  /** The goal's progress percent at the moment of this check-in — a snapshot, not a live value. */
  progressSnapshot?: number;
  whatMovedForward?: string;
  whatIsBlocking?: string;
  nextStep?: string;
  note?: string;
  createdAt: string;
}
