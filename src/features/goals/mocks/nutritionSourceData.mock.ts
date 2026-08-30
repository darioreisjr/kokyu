/** Mirrors `features/nutrition`'s real shape closely enough for `nutritionGoalAdapter` to integrate today, without a cross-feature import — see `leisureSourceData.mock.ts` for the same reasoning. */
export interface NutritionSourceSnapshot {
  recipesCookedThisYear: number;
  mealsPlannedThisYear: number;
  weeksWithPlanCompleted: number;
  homeCookedWeeksThisYear: number;
}

export const nutritionSourceSnapshot: NutritionSourceSnapshot = {
  recipesCookedThisYear: 17,
  mealsPlannedThisYear: 96,
  weeksWithPlanCompleted: 14,
  homeCookedWeeksThisYear: 20,
};
