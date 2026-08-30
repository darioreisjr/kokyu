import type { RoutineExercise, SetPrescription, WorkoutRoutine } from '../types';

const SEED_TIMESTAMP = '2026-08-10T12:00:00.000Z';

let setCounter = 0;
/** Local authoring helper only — never exported. Keeps the routine literals below readable. */
function makeSet(overrides: Partial<SetPrescription> & { order: number }): SetPrescription {
  setCounter += 1;
  return {
    id: `set-seed-${setCounter}`,
    setType: 'working',
    restSeconds: 90,
    ...overrides,
  };
}

let routineExerciseCounter = 0;
function makeRoutineExercise(
  exerciseId: string,
  sets: SetPrescription[],
  overrides: Partial<RoutineExercise> = {},
): RoutineExercise {
  routineExerciseCounter += 1;
  return {
    id: `routine-exercise-seed-${routineExerciseCounter}`,
    exerciseId,
    order: routineExerciseCounter,
    sets,
    progression: { strategy: 'manual' },
    ...overrides,
  };
}

// ---- Push A ------------------------------------------------------------

const pushASupino = makeRoutineExercise(
  'exercise-supino-reto',
  [
    makeSet({ order: 1, setType: 'warmup', targetReps: 10, targetLoadKg: 40, restSeconds: 60 }),
    makeSet({ order: 2, targetReps: 6, targetRepsMax: 8, targetLoadKg: 70, restSeconds: 120 }),
    makeSet({ order: 3, targetReps: 6, targetRepsMax: 8, targetLoadKg: 70, restSeconds: 120 }),
    makeSet({ order: 4, targetReps: 6, targetRepsMax: 8, targetLoadKg: 70, restSeconds: 120 }),
  ],
  {
    progression: {
      strategy: 'doubleProgression',
      repRangeMin: 6,
      repRangeMax: 8,
      incrementKg: 2.5,
    },
  },
);

const pushADesenvolvimento = makeRoutineExercise('exercise-desenvolvimento-militar', [
  makeSet({ order: 1, targetReps: 8, targetRepsMax: 10, targetLoadKg: 35 }),
  makeSet({ order: 2, targetReps: 8, targetRepsMax: 10, targetLoadKg: 35 }),
  makeSet({ order: 3, targetReps: 8, targetRepsMax: 10, targetLoadKg: 35 }),
]);

// Superset: elevação lateral + tríceps no pulley — demonstrates `ExerciseGroup`.
const pushAElevacao = makeRoutineExercise(
  'exercise-elevacao-lateral',
  [
    makeSet({ order: 1, targetReps: 12, targetRepsMax: 15, targetLoadKg: 8, restSeconds: 15 }),
    makeSet({ order: 2, targetReps: 12, targetRepsMax: 15, targetLoadKg: 8, restSeconds: 15 }),
    makeSet({ order: 3, targetReps: 12, targetRepsMax: 15, targetLoadKg: 8, restSeconds: 15 }),
  ],
  { groupId: 'group-push-a-superset' },
);
const pushATriceps = makeRoutineExercise(
  'exercise-triceps-pulley',
  [
    makeSet({ order: 1, targetReps: 12, targetRepsMax: 15, targetLoadKg: 20, restSeconds: 75 }),
    makeSet({ order: 2, targetReps: 12, targetRepsMax: 15, targetLoadKg: 20, restSeconds: 75 }),
    makeSet({ order: 3, targetReps: 12, targetRepsMax: 15, targetLoadKg: 20, restSeconds: 75 }),
  ],
  { groupId: 'group-push-a-superset' },
);

export const mockRoutinePushA: WorkoutRoutine = {
  id: 'routine-push-a',
  name: 'Push A',
  description: 'Peito, ombros e tríceps.',
  goal: 'hypertrophy',
  estimatedDurationMinutes: 60,
  exercises: [pushASupino, pushADesenvolvimento, pushAElevacao, pushATriceps],
  groups: [
    { id: 'group-push-a-1', kind: 'single', routineExerciseId: pushASupino.id },
    { id: 'group-push-a-2', kind: 'single', routineExerciseId: pushADesenvolvimento.id },
    {
      id: 'group-push-a-superset',
      kind: 'superset',
      routineExerciseIds: [pushAElevacao.id, pushATriceps.id],
      restBetweenExercisesSeconds: 15,
    },
  ],
  tags: ['push', 'academia'],
  muscleGroups: ['chest', 'shoulders', 'triceps'],
  equipmentIds: ['equipment-barra', 'equipment-banco', 'equipment-halteres', 'equipment-cabos'],
  locationId: 'location-academia',
  favorite: true,
  createdAt: SEED_TIMESTAMP,
  updatedAt: SEED_TIMESTAMP,
};

// ---- Pull A --------------------------------------------------------------

const pullATerra = makeRoutineExercise(
  'exercise-levantamento-terra',
  [
    makeSet({ order: 1, setType: 'warmup', targetReps: 5, targetLoadKg: 60, restSeconds: 90 }),
    makeSet({ order: 2, targetReps: 5, targetLoadKg: 100, restSeconds: 180, targetRpe: 8 }),
    makeSet({ order: 3, targetReps: 5, targetLoadKg: 100, restSeconds: 180, targetRpe: 8 }),
    makeSet({ order: 4, targetReps: 5, targetLoadKg: 100, restSeconds: 180, targetRpe: 8 }),
  ],
  { progression: { strategy: 'linear', incrementKg: 2.5, incrementAfterSuccesses: 1 } },
);

const pullARemada = makeRoutineExercise('exercise-remada-curvada', [
  makeSet({ order: 1, targetReps: 8, targetRepsMax: 10, targetLoadKg: 60 }),
  makeSet({ order: 2, targetReps: 8, targetRepsMax: 10, targetLoadKg: 60 }),
  makeSet({ order: 3, targetReps: 8, targetRepsMax: 10, targetLoadKg: 60 }),
  makeSet({ order: 4, targetReps: 8, targetRepsMax: 10, targetLoadKg: 60 }),
]);

const pullAPuxada = makeRoutineExercise('exercise-puxada-frente', [
  makeSet({ order: 1, targetReps: 10, targetRepsMax: 12, targetLoadKg: 45 }),
  makeSet({ order: 2, targetReps: 10, targetRepsMax: 12, targetLoadKg: 45 }),
  makeSet({ order: 3, targetReps: 10, targetRepsMax: 12, targetLoadKg: 45 }),
]);

const pullABarraFixa = makeRoutineExercise('exercise-barra-fixa', [
  makeSet({ order: 1, setType: 'amrap', restSeconds: 120 }),
  makeSet({ order: 2, setType: 'amrap', restSeconds: 120 }),
  makeSet({ order: 3, setType: 'amrap', restSeconds: 120 }),
]);

const pullARosca = makeRoutineExercise('exercise-rosca-direta', [
  makeSet({ order: 1, targetReps: 10, targetRepsMax: 12, targetLoadKg: 25, restSeconds: 60 }),
  makeSet({ order: 2, targetReps: 10, targetRepsMax: 12, targetLoadKg: 25, restSeconds: 60 }),
  makeSet({ order: 3, targetReps: 10, targetRepsMax: 12, targetLoadKg: 25, restSeconds: 60 }),
]);

export const mockRoutinePullA: WorkoutRoutine = {
  id: 'routine-pull-a',
  name: 'Pull A',
  description: 'Costas e bíceps.',
  goal: 'hypertrophy',
  estimatedDurationMinutes: 65,
  exercises: [pullATerra, pullARemada, pullAPuxada, pullABarraFixa, pullARosca],
  groups: [
    { id: 'group-pull-a-1', kind: 'single', routineExerciseId: pullATerra.id },
    { id: 'group-pull-a-2', kind: 'single', routineExerciseId: pullARemada.id },
    { id: 'group-pull-a-3', kind: 'single', routineExerciseId: pullAPuxada.id },
    { id: 'group-pull-a-4', kind: 'single', routineExerciseId: pullABarraFixa.id },
    { id: 'group-pull-a-5', kind: 'single', routineExerciseId: pullARosca.id },
  ],
  tags: ['pull', 'academia'],
  muscleGroups: ['back', 'biceps', 'lowerBack'],
  equipmentIds: ['equipment-barra', 'equipment-cabos', 'equipment-maquina', 'equipment-barra-fixa'],
  locationId: 'location-academia',
  favorite: true,
  createdAt: SEED_TIMESTAMP,
  updatedAt: SEED_TIMESTAMP,
};

// ---- Legs A ----------------------------------------------------------------

const legsAAgachamento = makeRoutineExercise(
  'exercise-agachamento-livre',
  [
    makeSet({ order: 1, setType: 'warmup', targetReps: 8, targetLoadKg: 40, restSeconds: 90 }),
    makeSet({ order: 2, targetReps: 6, targetRepsMax: 8, targetLoadKg: 90, restSeconds: 150 }),
    makeSet({ order: 3, targetReps: 6, targetRepsMax: 8, targetLoadKg: 90, restSeconds: 150 }),
    makeSet({ order: 4, targetReps: 6, targetRepsMax: 8, targetLoadKg: 90, restSeconds: 150 }),
  ],
  {
    progression: { strategy: 'doubleProgression', repRangeMin: 6, repRangeMax: 8, incrementKg: 5 },
  },
);

const legsALegPress = makeRoutineExercise('exercise-leg-press', [
  makeSet({ order: 1, targetReps: 10, targetRepsMax: 12, targetLoadKg: 160 }),
  makeSet({ order: 2, targetReps: 10, targetRepsMax: 12, targetLoadKg: 160 }),
  makeSet({ order: 3, targetReps: 10, targetRepsMax: 12, targetLoadKg: 160 }),
]);

const legsAExtensora = makeRoutineExercise('exercise-cadeira-extensora', [
  makeSet({ order: 1, targetReps: 12, targetRepsMax: 15, targetLoadKg: 35, restSeconds: 60 }),
  makeSet({ order: 2, targetReps: 12, targetRepsMax: 15, targetLoadKg: 35, restSeconds: 60 }),
  makeSet({ order: 3, targetReps: 12, targetRepsMax: 15, targetLoadKg: 35, restSeconds: 60 }),
]);

const legsAFlexora = makeRoutineExercise('exercise-mesa-flexora', [
  makeSet({ order: 1, targetReps: 12, targetRepsMax: 15, targetLoadKg: 30, restSeconds: 60 }),
  makeSet({ order: 2, targetReps: 12, targetRepsMax: 15, targetLoadKg: 30, restSeconds: 60 }),
  makeSet({ order: 3, targetReps: 12, targetRepsMax: 15, targetLoadKg: 30, restSeconds: 60 }),
]);

const legsAPanturrilha = makeRoutineExercise('exercise-panturrilha-em-pe', [
  makeSet({ order: 1, targetReps: 15, targetRepsMax: 20, targetLoadKg: 60, restSeconds: 45 }),
  makeSet({ order: 2, targetReps: 15, targetRepsMax: 20, targetLoadKg: 60, restSeconds: 45 }),
  makeSet({ order: 3, targetReps: 15, targetRepsMax: 20, targetLoadKg: 60, restSeconds: 45 }),
  makeSet({ order: 4, targetReps: 15, targetRepsMax: 20, targetLoadKg: 60, restSeconds: 45 }),
]);

export const mockRoutineLegsA: WorkoutRoutine = {
  id: 'routine-legs-a',
  name: 'Legs A',
  description: 'Quadríceps, posteriores e panturrilhas.',
  goal: 'hypertrophy',
  estimatedDurationMinutes: 70,
  exercises: [legsAAgachamento, legsALegPress, legsAExtensora, legsAFlexora, legsAPanturrilha],
  groups: [
    { id: 'group-legs-a-1', kind: 'single', routineExerciseId: legsAAgachamento.id },
    { id: 'group-legs-a-2', kind: 'single', routineExerciseId: legsALegPress.id },
    { id: 'group-legs-a-3', kind: 'single', routineExerciseId: legsAExtensora.id },
    { id: 'group-legs-a-4', kind: 'single', routineExerciseId: legsAFlexora.id },
    { id: 'group-legs-a-5', kind: 'single', routineExerciseId: legsAPanturrilha.id },
  ],
  tags: ['legs', 'academia'],
  muscleGroups: ['quads', 'glutes', 'hamstrings', 'calves'],
  equipmentIds: ['equipment-barra', 'equipment-maquina'],
  locationId: 'location-academia',
  createdAt: SEED_TIMESTAMP,
  updatedAt: SEED_TIMESTAMP,
};

// ---- Full Body --------------------------------------------------------------

const fullBodyAgachamento = makeRoutineExercise('exercise-agachamento-livre', [
  makeSet({ order: 1, targetReps: 8, targetRepsMax: 10, targetLoadKg: 70 }),
  makeSet({ order: 2, targetReps: 8, targetRepsMax: 10, targetLoadKg: 70 }),
  makeSet({ order: 3, targetReps: 8, targetRepsMax: 10, targetLoadKg: 70 }),
]);
const fullBodySupino = makeRoutineExercise('exercise-supino-reto', [
  makeSet({ order: 1, targetReps: 8, targetRepsMax: 10, targetLoadKg: 60 }),
  makeSet({ order: 2, targetReps: 8, targetRepsMax: 10, targetLoadKg: 60 }),
  makeSet({ order: 3, targetReps: 8, targetRepsMax: 10, targetLoadKg: 60 }),
]);
const fullBodyRemada = makeRoutineExercise('exercise-remada-curvada', [
  makeSet({ order: 1, targetReps: 8, targetRepsMax: 10, targetLoadKg: 50 }),
  makeSet({ order: 2, targetReps: 8, targetRepsMax: 10, targetLoadKg: 50 }),
  makeSet({ order: 3, targetReps: 8, targetRepsMax: 10, targetLoadKg: 50 }),
]);
const fullBodyDesenvolvimento = makeRoutineExercise('exercise-desenvolvimento-militar', [
  makeSet({ order: 1, targetReps: 8, targetRepsMax: 10, targetLoadKg: 30 }),
  makeSet({ order: 2, targetReps: 8, targetRepsMax: 10, targetLoadKg: 30 }),
]);
const fullBodyPrancha = makeRoutineExercise('exercise-prancha', [
  makeSet({ order: 1, setType: 'timed', targetDurationSeconds: 40, restSeconds: 45 }),
  makeSet({ order: 2, setType: 'timed', targetDurationSeconds: 40, restSeconds: 45 }),
]);

export const mockRoutineFullBody: WorkoutRoutine = {
  id: 'routine-full-body',
  name: 'Full Body',
  description: 'Corpo inteiro em uma sessão só — bom para quem treina 2–3x por semana.',
  goal: 'general',
  estimatedDurationMinutes: 55,
  exercises: [
    fullBodyAgachamento,
    fullBodySupino,
    fullBodyRemada,
    fullBodyDesenvolvimento,
    fullBodyPrancha,
  ],
  groups: [
    { id: 'group-full-body-1', kind: 'single', routineExerciseId: fullBodyAgachamento.id },
    { id: 'group-full-body-2', kind: 'single', routineExerciseId: fullBodySupino.id },
    { id: 'group-full-body-3', kind: 'single', routineExerciseId: fullBodyRemada.id },
    { id: 'group-full-body-4', kind: 'single', routineExerciseId: fullBodyDesenvolvimento.id },
    { id: 'group-full-body-5', kind: 'single', routineExerciseId: fullBodyPrancha.id },
  ],
  tags: ['full-body', 'academia'],
  muscleGroups: ['quads', 'chest', 'back', 'shoulders', 'abs'],
  equipmentIds: ['equipment-barra', 'equipment-peso-corporal'],
  locationId: 'location-academia',
  isTemplate: true,
  createdAt: SEED_TIMESTAMP,
  updatedAt: SEED_TIMESTAMP,
};

// ---- Treino de casa --------------------------------------------------------

const casaFlexao = makeRoutineExercise('exercise-flexao-de-braco', [
  makeSet({ order: 1, setType: 'amrap', restSeconds: 60 }),
  makeSet({ order: 2, setType: 'amrap', restSeconds: 60 }),
  makeSet({ order: 3, setType: 'amrap', restSeconds: 60 }),
]);
const casaAbdominal = makeRoutineExercise('exercise-abdominal-supra', [
  makeSet({ order: 1, targetReps: 15, targetRepsMax: 20, restSeconds: 45 }),
  makeSet({ order: 2, targetReps: 15, targetRepsMax: 20, restSeconds: 45 }),
  makeSet({ order: 3, targetReps: 15, targetRepsMax: 20, restSeconds: 45 }),
]);
const casaPrancha = makeRoutineExercise('exercise-prancha', [
  makeSet({ order: 1, setType: 'timed', targetDurationSeconds: 30, restSeconds: 30 }),
  makeSet({ order: 2, setType: 'timed', targetDurationSeconds: 30, restSeconds: 30 }),
  makeSet({ order: 3, setType: 'timed', targetDurationSeconds: 30, restSeconds: 30 }),
]);

export const mockRoutineTreinoDeCasa: WorkoutRoutine = {
  id: 'routine-treino-de-casa',
  name: 'Treino de casa',
  description: 'Sem equipamento — só peso corporal.',
  goal: 'general',
  estimatedDurationMinutes: 30,
  exercises: [casaFlexao, casaAbdominal, casaPrancha],
  groups: [
    { id: 'group-casa-1', kind: 'single', routineExerciseId: casaFlexao.id },
    { id: 'group-casa-2', kind: 'single', routineExerciseId: casaAbdominal.id },
    { id: 'group-casa-3', kind: 'single', routineExerciseId: casaPrancha.id },
  ],
  tags: ['casa', 'sem-equipamento'],
  muscleGroups: ['chest', 'abs', 'triceps'],
  equipmentIds: ['equipment-peso-corporal'],
  locationId: 'location-casa',
  createdAt: SEED_TIMESTAMP,
  updatedAt: SEED_TIMESTAMP,
};

export const mockRoutines: WorkoutRoutine[] = [
  mockRoutinePushA,
  mockRoutinePullA,
  mockRoutineLegsA,
  mockRoutineFullBody,
  mockRoutineTreinoDeCasa,
];

export function getMockRoutine(id: string): WorkoutRoutine | undefined {
  return mockRoutines.find((routine) => routine.id === id);
}
