import { z } from 'zod';

/** Same limit the API enforces (kokyu-sam `http-url.schema.ts`). */
export const LINK_MAX_LENGTH = 2048;

export const INVALID_LINK_MESSAGE = 'Informe um link válido, começando com https://';

const httpUrl = z.url({ protocol: /^https?$/ }).max(LINK_MAX_LENGTH);

/** True for an http(s) URL within the API's length limit — the exact rule kokyu-sam applies. */
export function isHttpUrl(value: string): boolean {
  return httpUrl.safeParse(value).success;
}

/**
 * Pulls the URL out of text that was pasted as a Markdown link instead of
 * a bare URL, then trims it:
 * - `[Astrobin](https://www.astrobin.com)` -> `https://www.astrobin.com`
 * - `https://www.astrobin.com](https://www.astrobin.com)` (a partial
 *   copy of one) -> `https://www.astrobin.com`
 * - `<https://www.astrobin.com>` -> `https://www.astrobin.com`
 * Anything else is returned trimmed, unchanged, for the validator to judge.
 */
export function extractPastedUrl(raw: string): string {
  const value = raw.trim();
  const markdownTarget = value.match(/\]\(\s*<?(https?:\/\/[^\s)>]+)>?\s*\)$/i);
  if (markdownTarget) return markdownTarget[1]!;
  const angleBracketed = value.match(/^<(https?:\/\/[^\s>]+)>$/i);
  if (angleBracketed) return angleBracketed[1]!;
  return value;
}

/**
 * Optional link form field: empty is fine; anything else is cleaned by
 * `extractPastedUrl` and must be an http(s) URL. The parsed value is the
 * cleaned URL, so what gets submitted is always what the API accepts.
 */
export const optionalHttpLinkSchema = z
  .string()
  .transform(extractPastedUrl)
  .refine((value) => value === '' || isHttpUrl(value), INVALID_LINK_MESSAGE);
