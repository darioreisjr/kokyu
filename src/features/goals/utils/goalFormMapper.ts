import type { GoalInput } from '../services/goalService';
import type {
  Goal,
  GoalKeyResult,
  GoalMeasurement,
  GoalMilestone,
  GoalSourceModule,
} from '../types';
import type { GoalFormValues } from '../schemas/goalSchema';

export interface GoalFormExtras {
  milestones: GoalMilestone[];
  keyResults: GoalKeyResult[];
}

function buildMeasurement(values: GoalFormValues): GoalMeasurement {
  switch (values.type) {
    case 'numeric':
      return {
        type: 'numeric',
        direction: values.direction ?? 'increase',
        unit: values.unit ?? 'units',
        baseline: values.baseline ?? 0,
        currentValue: values.currentValue ?? values.baseline ?? 0,
        targetValue: values.targetValue ?? 0,
        allowOverachievement: values.allowOverachievement,
      };
    case 'consistency':
      return {
        type: 'consistency',
        unit: values.unit ?? 'units',
        baseline: values.baseline ?? 0,
        currentValue: values.currentValue ?? values.baseline ?? 0,
        targetValue: values.targetValue ?? 0,
        periodDays: values.periodDays,
        allowOverachievement: values.allowOverachievement,
      };
    case 'average':
      return {
        type: 'average',
        unit: values.unit ?? 'units',
        targetValue: values.targetValue ?? 0,
        periodDays: values.periodDays ?? 30,
        currentValue: values.currentValue ?? 0,
      };
    case 'binary':
      return { type: 'binary', completed: false };
    case 'milestone':
      return { type: 'milestone' };
    case 'keyResult':
      return { type: 'keyResult' };
  }
}

/** Builds the proper `GoalMeasurement` discriminated union at submit time — the flat form/schema never has to model the union itself (same pattern as `leisure`'s form mapper). */
export function mapFormValuesToGoalInput(
  values: GoalFormValues,
  extras: GoalFormExtras,
): GoalInput {
  return {
    title: values.title,
    description: values.description || undefined,
    area: values.area,
    type: values.type,
    priority: values.priority,
    measurement: buildMeasurement(values),
    progressMode: values.progressMode,
    source:
      values.progressMode === 'automatic' && values.sourceModule && values.sourceMetricId
        ? { module: values.sourceModule as GoalSourceModule, metricId: values.sourceMetricId }
        : undefined,
    startDate: values.startDate,
    targetDate: values.targetDate || undefined,
    milestones: values.type === 'milestone' ? extras.milestones : undefined,
    keyResults: values.type === 'keyResult' ? extras.keyResults : undefined,
    tags: values.tags,
    motivation: values.motivation || undefined,
    successCriteria: values.successCriteria || undefined,
    checkInFrequency: values.checkInFrequency,
  };
}

/** The inverse — populates the flat edit form from a stored `Goal`, reading whichever measurement fields exist for its type. */
export function mapGoalToFormValues(goal: Goal): GoalFormValues {
  const measurement = goal.measurement;
  const numericLike =
    measurement.type === 'numeric' ||
    measurement.type === 'consistency' ||
    measurement.type === 'average';

  return {
    title: goal.title,
    description: goal.description ?? '',
    area: goal.area,
    type: goal.type,
    priority: goal.priority,
    direction: measurement.type === 'numeric' ? measurement.direction : 'increase',
    unit: numericLike ? measurement.unit : 'units',
    baseline:
      measurement.type === 'numeric' || measurement.type === 'consistency'
        ? measurement.baseline
        : 0,
    currentValue:
      measurement.type === 'numeric' || measurement.type === 'consistency'
        ? measurement.currentValue
        : measurement.type === 'average'
          ? measurement.currentValue
          : 0,
    targetValue: numericLike ? measurement.targetValue : undefined,
    periodDays:
      measurement.type === 'consistency'
        ? measurement.periodDays
        : measurement.type === 'average'
          ? measurement.periodDays
          : undefined,
    allowOverachievement:
      measurement.type === 'numeric' || measurement.type === 'consistency'
        ? Boolean(measurement.allowOverachievement)
        : false,
    startDate: goal.startDate,
    targetDate: goal.targetDate ?? '',
    progressMode: goal.progressMode,
    sourceModule: goal.source?.module ?? '',
    sourceMetricId: goal.source?.metricId ?? '',
    tags: goal.tags,
    motivation: goal.motivation ?? '',
    successCriteria: goal.successCriteria ?? '',
    checkInFrequency: goal.checkInFrequency,
  };
}
