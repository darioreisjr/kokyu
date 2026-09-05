/** "Where/with what" a mission can be executed — distinct from `MissionArea` (life area, e.g. Work) and `MissionTag` (free-form). */
export interface MissionContext {
  id: string;
  label: string;
  icon?: string;
}

export interface MissionTag {
  id: string;
  label: string;
}
