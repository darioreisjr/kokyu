/** `features/training` doesn't exist yet — see the note in `missionsSourceData.mock.ts`; same forward-looking shape for `trainingGoalAdapter`. */
export interface TrainingSourceSnapshot {
  sessionsCompletedThisYear: number;
  minutesTrainedThisYear: number;
  weeklyFrequency: number;
}

export const trainingSourceSnapshot: TrainingSourceSnapshot = {
  sessionsCompletedThisYear: 30,
  minutesTrainedThisYear: 1620,
  weeklyFrequency: 3,
};
