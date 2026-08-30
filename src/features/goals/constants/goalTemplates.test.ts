import { describe, expect, it } from 'vitest';

import { goalTemplates } from './goalTemplates';

const VALID_AREAS = [
  'work',
  'routine',
  'training',
  'nutrition',
  'habits',
  'leisure',
  'personal',
  'other',
];
const VALID_TYPES = ['numeric', 'binary', 'milestone', 'consistency', 'average', 'keyResult'];

describe('goalTemplates', () => {
  it('every template has a valid area and type', () => {
    for (const template of goalTemplates) {
      expect(VALID_AREAS).toContain(template.area);
      expect(VALID_TYPES).toContain(template.type);
    }
  });

  it('never pre-fills a required numeric value — the user always fills it in', () => {
    for (const template of goalTemplates) {
      expect(template).not.toHaveProperty('targetValue');
      expect(template).not.toHaveProperty('currentValue');
    }
  });

  it('has both generic and integrated templates', () => {
    expect(goalTemplates.some((template) => template.category === 'generic')).toBe(true);
    expect(goalTemplates.some((template) => template.category === 'integrated')).toBe(true);
  });

  it('every integrated template with a suggested source points at a real registered adapter metric', async () => {
    const { getGoalProgressSource } = await import('../services/adapters');
    for (const template of goalTemplates) {
      if (!template.suggestedSource) continue;
      const source = getGoalProgressSource(template.suggestedSource.module);
      expect(
        source.metrics.some((metric) => metric.id === template.suggestedSource!.metricId),
      ).toBe(true);
    }
  });
});
