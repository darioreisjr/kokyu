import { test } from '@playwright/test';

const API_URL = process.env.E2E_API_URL ?? 'http://localhost:3000/api/v1';

let flagsPromise: Promise<Record<string, boolean>> | null = null;

/** The backend's navigation feature flags (public endpoint), fetched once per worker. */
export function navigationFlags(): Promise<Record<string, boolean>> {
  flagsPromise ??= fetch(`${API_URL}/feature-flags/navigation`)
    .then((response) => response.json() as Promise<{ flags: Record<string, boolean> }>)
    .then((body) => body.flags);
  return flagsPromise;
}

/**
 * Skips every test in the current describe block while the app section
 * behind `flag` is switched off in the backend (it redirects away, so the
 * tests can't pass). Once the section ships, they run again on their own.
 */
export function skipUnlessSectionEnabled(flag: string, sectionName: string): void {
  test.beforeEach(async () => {
    const flags = await navigationFlags();
    test.skip(!flags[flag], `${sectionName} está desativada por feature flag (${flag}).`);
  });
}
