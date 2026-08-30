export type GoalReflectionContext = 'checkIn' | 'completion' | 'periodicReview';

/** A short, optional reflection — never a mandatory gate on completing or checking in on a goal. */
export interface GoalReflection {
  id: string;
  goalId: string;
  context: GoalReflectionContext;
  whatWorked?: string;
  whatLearned?: string;
  whatWouldChangeNextTime?: string;
  ratingOutOfFive?: number;
  createdAt: string;
}
