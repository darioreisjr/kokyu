/** The single place minutes become human-readable text — "45 min", "1h30", "2h". Internal calculations always stay in plain minutes. */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours}h` : `${hours}h${String(remainder).padStart(2, '0')}`;
}

/** Drops seconds from a backend "HH:mm:ss" time — display always shows "HH:mm". */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
}
