/**
 * A checklist item is a simple step with no identity of its own — no deadline, no priority, no
 * schedule. Compare with a submission (`Mission.parentMissionId`), which is a full `Mission`.
 * See `docs/missions.md#submissão-x-checklist`.
 */
export interface MissionChecklistItem {
  id: string;
  missionId: string;
  text: string;
  completed: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
