import { describe, expect, it } from 'vitest';

import { goalFormDefaultValues } from '../schemas/goalSchema';
import type { Goal } from '../types';
import { mapFormValuesToGoalInput, mapGoalToFormValues } from './goalFormMapper';

describe('mapFormValuesToGoalInput', () => {
  it('builds a numeric measurement from the flat form', () => {
    const input = mapFormValuesToGoalInput(
      {
        ...goalFormDefaultValues,
        title: 'Ler 20 livros',
        type: 'numeric',
        unit: 'books',
        baseline: 0,
        currentValue: 5,
        targetValue: 20,
        direction: 'increase',
      },
      { milestones: [], keyResults: [] },
    );
    expect(input.measurement).toEqual({
      type: 'numeric',
      direction: 'increase',
      unit: 'books',
      baseline: 0,
      currentValue: 5,
      targetValue: 20,
      allowOverachievement: false,
    });
  });

  it('only attaches a source when progressMode is automatic and both fields are set', () => {
    const manual = mapFormValuesToGoalInput(
      {
        ...goalFormDefaultValues,
        progressMode: 'manual',
        sourceModule: 'leisure',
        sourceMetricId: 'leisure.booksCompleted',
      },
      { milestones: [], keyResults: [] },
    );
    expect(manual.source).toBeUndefined();

    const automatic = mapFormValuesToGoalInput(
      {
        ...goalFormDefaultValues,
        progressMode: 'automatic',
        sourceModule: 'leisure',
        sourceMetricId: 'leisure.booksCompleted',
      },
      { milestones: [], keyResults: [] },
    );
    expect(automatic.source).toEqual({ module: 'leisure', metricId: 'leisure.booksCompleted' });
  });

  it('only attaches milestones/keyResults for their matching type', () => {
    const milestones = [{ id: 'm1', title: 'M', completed: false, order: 0 }];
    const keyResults = [
      {
        id: 'kr1',
        title: 'KR',
        type: 'numeric' as const,
        baseline: 0,
        current: 0,
        target: 1,
        unit: 'units' as const,
        status: 'notStarted' as const,
      },
    ];

    const milestoneGoal = mapFormValuesToGoalInput(
      { ...goalFormDefaultValues, type: 'milestone' },
      { milestones, keyResults },
    );
    expect(milestoneGoal.milestones).toEqual(milestones);
    expect(milestoneGoal.keyResults).toBeUndefined();

    const keyResultGoal = mapFormValuesToGoalInput(
      { ...goalFormDefaultValues, type: 'keyResult' },
      { milestones, keyResults },
    );
    expect(keyResultGoal.keyResults).toEqual(keyResults);
    expect(keyResultGoal.milestones).toBeUndefined();
  });
});

describe('mapGoalToFormValues', () => {
  it('round-trips a numeric goal back into flat form values', () => {
    const goal: Goal = {
      id: 'goal-1',
      title: 'Ler 20 livros',
      area: 'leisure',
      type: 'numeric',
      status: 'onTrack',
      systemStatus: 'onTrack',
      priority: 'focus',
      measurement: {
        type: 'numeric',
        direction: 'increase',
        unit: 'books',
        baseline: 0,
        currentValue: 8,
        targetValue: 20,
        allowOverachievement: true,
      },
      progressMode: 'automatic',
      source: { module: 'leisure', metricId: 'leisure.booksCompleted' },
      startDate: '2026-01-01',
      targetDate: '2026-12-31',
      tags: ['2026'],
      motivation: 'Porque sim',
      checkInFrequency: 'monthly',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const values = mapGoalToFormValues(goal);
    expect(values.unit).toBe('books');
    expect(values.currentValue).toBe(8);
    expect(values.targetValue).toBe(20);
    expect(values.allowOverachievement).toBe(true);
    expect(values.sourceModule).toBe('leisure');
    expect(values.sourceMetricId).toBe('leisure.booksCompleted');
    expect(values.motivation).toBe('Porque sim');
  });

  it('round-trips a binary goal without pulling in numeric-only fields', () => {
    const goal: Goal = {
      id: 'goal-2',
      title: 'Publicar portfólio',
      area: 'work',
      type: 'binary',
      status: 'onTrack',
      systemStatus: 'onTrack',
      priority: 'medium',
      measurement: { type: 'binary', completed: false },
      progressMode: 'manual',
      startDate: '2026-01-01',
      tags: [],
      checkInFrequency: 'none',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const values = mapGoalToFormValues(goal);
    expect(values.targetValue).toBeUndefined();
    expect(values.baseline).toBe(0);
  });

  it('round-trips a consistency goal', () => {
    const goal: Goal = {
      id: 'goal-3',
      title: 'Treinar 4x por semana',
      area: 'training',
      type: 'consistency',
      status: 'onTrack',
      systemStatus: 'onTrack',
      priority: 'medium',
      measurement: {
        type: 'consistency',
        unit: 'times',
        baseline: 0,
        currentValue: 3,
        targetValue: 4,
        periodDays: 7,
      },
      progressMode: 'manual',
      startDate: '2026-01-01',
      tags: [],
      checkInFrequency: 'none',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const values = mapGoalToFormValues(goal);
    expect(values.currentValue).toBe(3);
    expect(values.periodDays).toBe(7);
  });

  it('round-trips an average goal', () => {
    const goal: Goal = {
      id: 'goal-4',
      title: 'Ler em média 30 min/dia',
      area: 'leisure',
      type: 'average',
      status: 'onTrack',
      systemStatus: 'onTrack',
      priority: 'medium',
      measurement: {
        type: 'average',
        unit: 'minutes',
        targetValue: 30,
        periodDays: 30,
        currentValue: 22,
      },
      progressMode: 'manual',
      startDate: '2026-01-01',
      tags: [],
      checkInFrequency: 'none',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const values = mapGoalToFormValues(goal);
    expect(values.currentValue).toBe(22);
    expect(values.periodDays).toBe(30);
  });

  it('round-trips a milestone goal with no measurement-specific fields', () => {
    const goal: Goal = {
      id: 'goal-5',
      title: 'Construir meu app',
      area: 'personal',
      type: 'milestone',
      status: 'onTrack',
      systemStatus: 'onTrack',
      priority: 'medium',
      measurement: { type: 'milestone' },
      progressMode: 'manual',
      startDate: '2026-01-01',
      tags: [],
      checkInFrequency: 'none',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const values = mapGoalToFormValues(goal);
    expect(values.unit).toBe('units');
    expect(values.targetValue).toBeUndefined();
  });
});
