/** `yyyy-MM-dd` in the local timezone — never `toISOString().slice(0, 10)` directly on a `Date` that might be from `new Date()`, which is UTC and can land on the wrong local day. */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year!, (month ?? 1) - 1, day ?? 1);
}

export function isSameDateKey(date: Date, dateKey: string): boolean {
  return toDateKey(date) === dateKey;
}
