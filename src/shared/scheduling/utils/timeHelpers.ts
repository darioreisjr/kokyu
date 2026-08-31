/**
 * Converts a "HH:mm" time string to minutes from midnight (0..1439).
 */
export function timeToMinutes(time: string): number {
  const [hoursStr, minutesStr] = time.split(':');
  const hours = Number.parseInt(hoursStr ?? '0', 10);
  const minutes = Number.parseInt(minutesStr ?? '0', 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
  return hours * 60 + minutes;
}

/**
 * Converts minutes from midnight into a formatted "HH:mm" string.
 */
export function minutesToTime(minutes: number): string {
  const clamped = Math.max(0, Math.min(1439, Math.floor(minutes)));
  const hours = Math.floor(clamped / 60);
  const mins = clamped % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Calculates duration in minutes between start and end "HH:mm".
 */
export function calculateDurationMinutes(startAt: string, endAt: string): number {
  const start = timeToMinutes(startAt);
  const end = timeToMinutes(endAt);
  return Math.max(0, end - start);
}

/**
 * Adds minutes to a "HH:mm" time string, returning a clamped "HH:mm" string.
 */
export function addMinutesToTime(time: string, minutesToAdd: number): string {
  const current = timeToMinutes(time);
  return minutesToTime(current + minutesToAdd);
}

/**
 * Returns true if timeA is strictly earlier than timeB.
 */
export function isTimeBefore(timeA: string, timeB: string): boolean {
  return timeToMinutes(timeA) < timeToMinutes(timeB);
}

/**
 * Returns true if timeA is strictly later than timeB.
 */
export function isTimeAfter(timeA: string, timeB: string): boolean {
  return timeToMinutes(timeA) > timeToMinutes(timeB);
}

/**
 * Checks if two time intervals overlap (strictly: start < otherEnd && end > otherStart).
 */
export function isTimeOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
  bufferMinutes = 0,
): boolean {
  const a1 = timeToMinutes(startA);
  const a2 = timeToMinutes(endA);
  const b1 = timeToMinutes(startB);
  const b2 = timeToMinutes(endB);
  return a1 < b2 + bufferMinutes && a2 + bufferMinutes > b1;
}

/**
 * Checks if an event is entirely within a time window.
 */
export function isWithinWindow(
  eventStart: string,
  eventEnd: string,
  windowStart: string,
  windowEnd: string,
): boolean {
  const e1 = timeToMinutes(eventStart);
  const e2 = timeToMinutes(eventEnd);
  const w1 = timeToMinutes(windowStart);
  const w2 = timeToMinutes(windowEnd);
  return e1 >= w1 && e2 <= w2;
}

/**
 * Categorizes a time into morning, afternoon, evening, or night.
 */
export function getTimeOfDay(time: string): 'morning' | 'afternoon' | 'evening' | 'night' {
  const mins = timeToMinutes(time);
  if (mins >= 360 && mins < 720) return 'morning'; // 06:00 - 11:59
  if (mins >= 720 && mins < 1080) return 'afternoon'; // 12:00 - 17:59
  if (mins >= 1080 && mins < 1380) return 'evening'; // 18:00 - 22:59
  return 'night'; // 23:00 - 05:59
}

/**
 * Formats duration in minutes to pt-BR friendly string (e.g. "45 min", "1h 30min", "2h").
 */
export function formatDurationDisplay(minutes: number): string {
  const total = Math.max(0, Math.floor(minutes));
  const hours = Math.floor(total / 60);
  const remainingMins = total % 60;

  if (hours === 0) {
    return `${remainingMins} min`;
  }
  if (remainingMins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMins}min`;
}

/**
 * Snaps minutes to nearest interval (e.g. 15 min).
 */
export function snapToGrid(minutes: number, step = 15): number {
  return Math.round(minutes / step) * step;
}

