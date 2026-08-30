export type TrainingLocationType = 'gym' | 'home' | 'condo' | 'outdoor' | 'other';

/** Each location has its own equipment set — powers "filtrar por local" in the Routine Builder and the "Hoje estou treinando em" quick action. */
export interface TrainingLocation {
  id: string;
  name: string;
  type: TrainingLocationType;
  equipmentIds: string[];
  isDefault?: boolean;
}

export type TrainingLocationInput = Omit<TrainingLocation, 'id'>;
