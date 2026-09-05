/**
 * A single directed edge: `blockerMissionId` must be completed before `blockedMissionId` is
 * unblocked. Storing one direction (instead of a `type: 'blocks' | 'blockedBy'` pair) avoids ever
 * having to keep two rows in sync — `missionDependencyEngine` derives both "blocks" and
 * "blockedBy" views for any mission from this single table.
 */
export interface MissionDependency {
  id: string;
  blockerMissionId: string;
  blockedMissionId: string;
  createdAt: string;
}
