import { mockCollections } from '../mocks/collections.mock';
import { mockLeisureItems } from '../mocks/leisureItems.mock';
import { createMockLeisureLog } from '../mocks/leisureLog.mock';
import { createMockLeisurePlan } from '../mocks/leisurePlan.mock';
import { mockNotes } from '../mocks/notes.mock';

/**
 * TEST-ONLY. Tempo Livre's `*Service` modules now call the real kokyu-sam
 * backend (see leisureItemService.ts and friends) — nothing under `src/`
 * reads or writes this store anymore. It survives as the in-memory fixture
 * store behind `test/mocks/leisureApiFetchMock.ts`, a fake backend
 * installed globally for tests (test/setup.ts) so the existing suite of
 * hook/page tests (written against these fixtures, e.g. asserting on "O
 * Hobbit") keeps working without every test individually mocking every
 * endpoint response. Never import this from `src/` — only from `test/`.
 */
export interface MockPlanEntryCompletion {
  planEntryId: string;
  occurrenceDate: string;
}

export const leisureDb = {
  items: [...mockLeisureItems],
  planEntries: createMockLeisurePlan(),
  /** Per-occurrence completions for `recurrence: 'daily'`/`'weekly'` plan entries — mirrors kokyu-sam's `leisure_plan_entry_completions` table. See `leisureApiFetchMock.ts`. */
  planCompletions: [] as MockPlanEntryCompletion[],
  logEntries: createMockLeisureLog(),
  notes: [...mockNotes],
  collections: [...mockCollections],
};

let nextId = 1;

/** Mock-only id generator — a real backend assigns its own ids; this just needs to be unique for one browser session. */
export function generateId(prefix: string): string {
  nextId += 1;
  return `${prefix}-${Date.now()}-${nextId}`;
}

/** Test-only — restores every table to a fresh copy of its starting mock data, so one test's writes never leak into the next. Never called from app code. */
export function resetLeisureDb(): void {
  leisureDb.items = [...mockLeisureItems];
  leisureDb.planEntries = createMockLeisurePlan();
  leisureDb.planCompletions = [];
  leisureDb.logEntries = createMockLeisureLog();
  leisureDb.notes = [...mockNotes];
  leisureDb.collections = [...mockCollections];
}
