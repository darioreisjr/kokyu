import type { TrainingLocation } from '../types';

export const mockTrainingLocations: TrainingLocation[] = [
  {
    id: 'location-academia',
    name: 'Academia',
    type: 'gym',
    isDefault: true,
    equipmentIds: [
      'equipment-barra',
      'equipment-halteres',
      'equipment-kettlebell',
      'equipment-anilhas',
      'equipment-banco',
      'equipment-smith',
      'equipment-cabos',
      'equipment-maquina',
      'equipment-barra-fixa',
      'equipment-paralelas',
      'equipment-peso-corporal',
      'equipment-esteira',
      'equipment-bicicleta',
      'equipment-eliptico',
      'equipment-remo',
    ],
  },
  {
    id: 'location-casa',
    name: 'Casa',
    type: 'home',
    equipmentIds: [
      'equipment-halteres',
      'equipment-elastico',
      'equipment-banco',
      'equipment-peso-corporal',
      'equipment-corda',
    ],
  },
];
