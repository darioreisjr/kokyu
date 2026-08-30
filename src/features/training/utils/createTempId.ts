let counter = 0;

/** Client-side id for a row added in a form (routine exercise, set, program week...) before it's ever saved — the real id comes from `trainingMockDb.generateId` once the form is submitted through a service. */
export function createTempId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}
