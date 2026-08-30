import { mockCollections } from '../mocks/collections.mock';
import { mockLeisureItems } from '../mocks/leisureItems.mock';
import { createMockLeisureLog } from '../mocks/leisureLog.mock';
import { createMockLeisurePlan } from '../mocks/leisurePlan.mock';
import { mockNotes } from '../mocks/notes.mock';

/**
 * The single in-memory store every Tempo Livre service reads and
 * writes — mirrors how a real backend owns one data store, so
 * swapping these functions for real HTTP calls later means changing
 * what's *inside* each service function, not how services hand data
 * to each other. Never imported by a component directly; always go
 * through a `*Service` function.
 */
export const leisureDb = {
  items: [...mockLeisureItems],
  planEntries: createMockLeisurePlan(),
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
  leisureDb.logEntries = createMockLeisureLog();
  leisureDb.notes = [...mockNotes];
  leisureDb.collections = [...mockCollections];
}
