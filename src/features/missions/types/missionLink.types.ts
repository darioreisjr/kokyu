/**
 * Generic relation from a Mission to an entity in another module — for the "auxiliary action"
 * cases the spec calls out explicitly (buying tickets for a Leisure item, buying containers
 * related to Nutrition) without ever pulling the target module's data into Missions.
 */
export type MissionLinkEntityType =
  | 'goal'
  | 'habit'
  | 'leisure'
  | 'training'
  | 'nutrition'
  | 'scheduleEntry';

export type MissionLinkRelationshipType = 'contributesTo' | 'relatesTo' | 'auxiliaryFor';

export interface MissionLink {
  id: string;
  missionId: string;
  entityType: MissionLinkEntityType;
  entityId: string;
  entityLabel: string;
  relationshipType: MissionLinkRelationshipType;
  createdAt: string;
}
