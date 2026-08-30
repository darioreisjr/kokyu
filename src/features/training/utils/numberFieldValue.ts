/**
 * For number inputs registered via react-hook-form's `setValueAs` (never `valueAsNumber`): an
 * emptied `<input type="number">`'s native `valueAsNumber` is `NaN`, not `undefined` — which fails
 * Zod's `.optional()` (`NaN` is a `number`, so it's never treated as "absent") and silently blocks
 * form submission with no visible error, since the resolver just marks the field invalid without
 * ever calling `onSubmit`. This converts a blank/unparseable value to `undefined` so an optional
 * numeric field can actually be left empty.
 *
 * Accepts `unknown`, not just `string`: react-hook-form re-runs a field's `setValueAs` whenever it
 * revalidates a value already sitting in form state (e.g. right after `useFieldArray.append()`
 * seeds a new row with a real `number`, not a raw DOM event value) — calling `.trim()` on that
 * number would throw and take down the whole page in production. A value that's already a number
 * passes straight through instead.
 */
export function parseOptionalNumberFieldValue(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isNaN(value) ? undefined : value;
  if (typeof value !== 'string' || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}
