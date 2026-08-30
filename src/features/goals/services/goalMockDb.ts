import type { GoalReflection } from '../types';
import { createMockGoalActivities } from '../mocks/goalActivities.mock';
import { createMockGoalCheckIns } from '../mocks/goalCheckIns.mock';
import { createMockGoalLinks } from '../mocks/goalLinks.mock';
import { createMockGoalNotes } from '../mocks/goalNotes.mock';
import { createMockGoalProgressEntries } from '../mocks/goalProgressEntries.mock';
import { mockGoals } from '../mocks/goals.mock';

function createInitialReflections(): GoalReflection[] {
  return [];
}

/**
 * The single in-memory store every Goals service reads and writes — mirrors
 * `features/leisure/services/leisureMockDb.ts`. Never imported by a component directly; always go
 * through `goalService`.
 */
export const goalDb = {
  goals: [...mockGoals],
  progressEntries: createMockGoalProgressEntries(),
  checkIns: createMockGoalCheckIns(),
  activities: createMockGoalActivities(),
  links: createMockGoalLinks(),
  notes: createMockGoalNotes(),
  reflections: createInitialReflections(),
};

let nextId = 1;

/** Mock-only id generator — unique for one browser session, never meant to look like a real backend id. */
export function generateId(prefix: string): string {
  nextId += 1;
  return `${prefix}-${Date.now()}-${nextId}`;
}

/** Test-only — restores every table to a fresh copy of its starting mock data. Never called from app code. */
export function resetGoalDb(): void {
  goalDb.goals = [...mockGoals];
  goalDb.progressEntries = createMockGoalProgressEntries();
  goalDb.checkIns = createMockGoalCheckIns();
  goalDb.activities = createMockGoalActivities();
  goalDb.links = createMockGoalLinks();
  goalDb.notes = createMockGoalNotes();
  goalDb.reflections = createInitialReflections();
}
