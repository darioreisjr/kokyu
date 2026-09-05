import { describe, expect, it } from 'vitest';
import { computeDayProgress, getDayMoment, getLogicalToday } from './homeDayService';

describe('homeDayService', () => {
  describe('getLogicalToday', () => {
    it('returns a yyyy-MM-dd key matching the local date', () => {
      const today = getLogicalToday();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('computeDayProgress', () => {
    it('clamps elapsed minutes to 0 before the day starts', () => {
      const now = new Date(2026, 0, 1, 4, 0);
      const progress = computeDayProgress(now, '06:00', '23:00');
      expect(progress.elapsedMinutes).toBe(0);
      expect(progress.percent).toBe(0);
    });

    it('computes elapsed/percent at the midpoint of the day', () => {
      const now = new Date(2026, 0, 1, 14, 30);
      const progress = computeDayProgress(now, '06:00', '23:00');
      expect(progress.totalMinutes).toBe(17 * 60);
      expect(progress.elapsedMinutes).toBe(8 * 60 + 30);
      expect(progress.percent).toBe(50);
    });

    it('clamps elapsed minutes to the total after the day ends', () => {
      const now = new Date(2026, 0, 1, 23, 59);
      const progress = computeDayProgress(now, '06:00', '20:00');
      expect(progress.elapsedMinutes).toBe(progress.totalMinutes);
      expect(progress.percent).toBe(100);
    });
  });

  describe('getDayMoment', () => {
    it('categorizes morning/afternoon/evening/night correctly', () => {
      expect(getDayMoment(new Date(2026, 0, 1, 8, 0))).toBe('morning');
      expect(getDayMoment(new Date(2026, 0, 1, 13, 0))).toBe('afternoon');
      expect(getDayMoment(new Date(2026, 0, 1, 19, 0))).toBe('evening');
      expect(getDayMoment(new Date(2026, 0, 1, 2, 0))).toBe('night');
    });
  });
});
