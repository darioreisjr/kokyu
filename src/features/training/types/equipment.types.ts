export type EquipmentCategory =
  | 'barbell'
  | 'dumbbell'
  | 'kettlebell'
  | 'plate'
  | 'bench'
  | 'machine'
  | 'cable'
  | 'band'
  | 'trx'
  | 'pullupBar'
  | 'parallelBars'
  | 'bodyweight'
  | 'medicineBall'
  | 'stabilityBall'
  | 'step'
  | 'treadmill'
  | 'bike'
  | 'elliptical'
  | 'rower'
  | 'jumpRope'
  | 'other';

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  active: boolean;
}

export type EquipmentInput = Omit<Equipment, 'id'>;
