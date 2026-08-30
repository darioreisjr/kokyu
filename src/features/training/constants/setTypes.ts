import type { LoadType, SetType } from '../types';

export const setTypeLabels: Record<SetType, string> = {
  warmup: 'Aquecimento',
  working: 'Trabalho',
  drop: 'Drop set',
  backoff: 'Back-off',
  amrap: 'AMRAP',
  failure: 'Falha',
  timed: 'Temporizada',
};

/** `working`/`warmup` show up unconditionally in the Builder; the rest live in an "avançado" menu per the spec's own "não exagerar na interface básica". */
export const basicSetTypes: SetType[] = ['warmup', 'working'];
export const advancedSetTypes: SetType[] = ['drop', 'backoff', 'amrap', 'failure', 'timed'];

export const loadTypeLabels: Record<LoadType, string> = {
  freeWeight: 'Peso livre',
  percent: 'Percentual',
  bodyweight: 'Peso corporal',
  bodyweightPlusLoad: 'Peso corporal + carga',
  assisted: 'Peso corporal assistido',
  manual: 'Manual',
};
