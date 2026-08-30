import type { Equipment } from '../types';

/** Centralized starter library — matches the spec's own "EQUIPAMENTOS INICIAIS" list. */
export const mockEquipment: Equipment[] = [
  { id: 'equipment-barra', name: 'Barra', category: 'barbell', active: true },
  { id: 'equipment-halteres', name: 'Halteres', category: 'dumbbell', active: true },
  { id: 'equipment-kettlebell', name: 'Kettlebell', category: 'kettlebell', active: true },
  { id: 'equipment-anilhas', name: 'Anilhas', category: 'plate', active: true },
  { id: 'equipment-banco', name: 'Banco', category: 'bench', active: true },
  { id: 'equipment-smith', name: 'Smith Machine', category: 'machine', active: true },
  { id: 'equipment-cabos', name: 'Cabos', category: 'cable', active: true },
  { id: 'equipment-maquina', name: 'Máquina', category: 'machine', active: true },
  { id: 'equipment-elastico', name: 'Elástico', category: 'band', active: true },
  { id: 'equipment-trx', name: 'TRX', category: 'trx', active: true },
  { id: 'equipment-barra-fixa', name: 'Barra fixa', category: 'pullupBar', active: true },
  { id: 'equipment-paralelas', name: 'Paralelas', category: 'parallelBars', active: true },
  { id: 'equipment-peso-corporal', name: 'Peso corporal', category: 'bodyweight', active: true },
  { id: 'equipment-medicine-ball', name: 'Medicine Ball', category: 'medicineBall', active: true },
  { id: 'equipment-bola-suica', name: 'Bola suíça', category: 'stabilityBall', active: true },
  { id: 'equipment-step', name: 'Step', category: 'step', active: true },
  { id: 'equipment-esteira', name: 'Esteira', category: 'treadmill', active: true },
  { id: 'equipment-bicicleta', name: 'Bicicleta', category: 'bike', active: true },
  { id: 'equipment-eliptico', name: 'Elíptico', category: 'elliptical', active: true },
  { id: 'equipment-remo', name: 'Remo', category: 'rower', active: true },
  { id: 'equipment-corda', name: 'Corda', category: 'jumpRope', active: true },
  { id: 'equipment-outros', name: 'Outros', category: 'other', active: true },
];

export function getMockEquipment(id: string): Equipment | undefined {
  return mockEquipment.find((item) => item.id === id);
}
