/**
 * Small numeric/behavioral constants that must never get re-typed
 * inline in a component — exactly the kind of magic number that
 * quietly drifts (one screen says 3 days, another says 5) once it's
 * copy-pasted instead of imported.
 */
export const nutritionConfig = {
  /** A pantry item within this many days of `expirationDate` is "Vence em breve", not just "Válido". */
  expiringSoonDays: 3,
} as const;
