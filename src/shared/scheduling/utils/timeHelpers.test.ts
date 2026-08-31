import { describe, expect, it } from 'vitest';
import {
  addMinutesToTime,
  calculateDurationMinutes,
  formatDurationDisplay,
  getTimeOfDay,
  isTimeOverlapping,
  isWithinWindow,
  minutesToTime,
  snapToGrid,
  timeToMinutes,
} from './timeHelpers';

describe('timeHelpers', () => {
  it('converts HH:mm to minutes and back', () => {
    expect(timeToMinutes('00:00')).toBe(0);
    expect(timeToMinutes('08:30')).toBe(510);
    expect(timeToMinutes('23:59')).toBe(1439);
    expect(timeToMinutes('invalid')).toBe(0);

    expect(minutesToTime(0)).toBe('00:00');
    expect(minutesToTime(510)).toBe('08:30');
    expect(minutesToTime(1439)).toBe('23:59');
  });

  it('calculates duration in minutes', () => {
    expect(calculateDurationMinutes('09:00', '10:30')).toBe(90);
    expect(calculateDurationMinutes('10:00', '10:00')).toBe(0);
    expect(calculateDurationMinutes('11:00', '10:00')).toBe(0);
  });

  it('adds minutes correctly', () => {
    expect(addMinutesToTime('08:30', 45)).toBe('09:15');
    expect(addMinutesToTime('23:30', 60)).toBe('23:59');
  });

  it('detects overlapping time intervals', () => {
    expect(isTimeOverlapping('10:00', '11:00', '10:30', '11:30')).toBe(true);
    expect(isTimeOverlapping('10:00', '11:00', '11:00', '12:00')).toBe(false);
    expect(isTimeOverlapping('10:00', '12:00', '10:30', '11:00')).toBe(true);
    expect(isTimeOverlapping('14:00', '15:00', '09:00', '10:00')).toBe(false);
  });

  it('checks if within window', () => {
    expect(isWithinWindow('09:00', '10:00', '08:00', '18:00')).toBe(true);
    expect(isWithinWindow('07:30', '09:00', '08:00', '18:00')).toBe(false);
    expect(isWithinWindow('17:00', '19:00', '08:00', '18:00')).toBe(false);
  });

  it('categorizes time of day', () => {
    expect(getTimeOfDay('07:00')).toBe('morning');
    expect(getTimeOfDay('13:00')).toBe('afternoon');
    expect(getTimeOfDay('19:00')).toBe('evening');
    expect(getTimeOfDay('02:00')).toBe('night');
  });

  it('formats duration strings cleanly', () => {
    expect(formatDurationDisplay(30)).toBe('30 min');
    expect(formatDurationDisplay(60)).toBe('1h');
    expect(formatDurationDisplay(90)).toBe('1h 30min');
    expect(formatDurationDisplay(125)).toBe('2h 5min');
  });

  it('snaps to grid', () => {
    expect(snapToGrid(14, 15)).toBe(15);
    expect(snapToGrid(22, 15)).toBe(15);
    expect(snapToGrid(24, 15)).toBe(30);
  });
});

