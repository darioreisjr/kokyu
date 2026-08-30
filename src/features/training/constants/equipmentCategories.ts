import type { EquipmentCategory, TrainingLocationType } from '../types';

export const equipmentCategoryLabels: Record<EquipmentCategory, string> = {
  barbell: 'Barra',
  dumbbell: 'Halteres',
  kettlebell: 'Kettlebell',
  plate: 'Anilhas',
  bench: 'Banco',
  machine: 'Máquina',
  cable: 'Cabos',
  band: 'Elástico',
  trx: 'TRX',
  pullupBar: 'Barra fixa',
  parallelBars: 'Paralelas',
  bodyweight: 'Peso corporal',
  medicineBall: 'Medicine Ball',
  stabilityBall: 'Bola suíça',
  step: 'Step',
  treadmill: 'Esteira',
  bike: 'Bicicleta',
  elliptical: 'Elíptico',
  rower: 'Remo',
  jumpRope: 'Corda',
  other: 'Outros',
};

export const trainingLocationTypeLabels: Record<TrainingLocationType, string> = {
  gym: 'Academia',
  home: 'Casa',
  condo: 'Condomínio',
  outdoor: 'Parque',
  other: 'Outro',
};
