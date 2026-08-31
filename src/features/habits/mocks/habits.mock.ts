import type { Habit } from '../types/habit.types';
import type { HabitLog } from '../types/log.types';
import type { HabitReview } from '../types/review.types';
import type { HabitRoutine } from '../types/routine.types';

export function createMockHabits(): Habit[] {
  return [
    {
      id: 'habit-water',
      name: 'Beber 2.5L de água',
      description: 'Manter hidratação ao longo de todo o dia.',
      area: 'nutrition',
      direction: 'build',
      trackingType: 'quantity',
      status: 'active',
      target: {
        type: 'quantity',
        targetValue: 2500,
        unit: 'units',
        customUnitLabel: 'ml',
        allowOverachievement: true,
      },
      schedule: {
        frequencyType: 'daily',
        effectiveFrom: '2026-01-01',
        startDate: '2026-01-01',
      },
      reminders: [{ id: 'rem-1', time: '08:00', enabled: true }, { id: 'rem-2', time: '14:00', enabled: true }],
      timeOfDay: 'anytime',
      priority: 'high',
      icon: 'RestaurantRounded',
      tags: ['saúde', 'hidratação'],
      cue: 'Depois de sentar na mesa de trabalho',
      motivation: 'Ter mais energia e foco.',
      reward: 'Sentir o corpo hidratado e leve.',
      source: 'nutrition',
      sourceRef: {
        module: 'nutrition',
        metricId: 'nutrition.waterIntakeMl',
        autoLog: true,
      },
      goalIds: ['goal-health-1'],
      routineIds: ['routine-morning-1'],
      startDate: '2026-01-01',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-01-01T08:00:00.000Z',
    },
    {
      id: 'habit-reading',
      name: 'Ler 20 páginas',
      description: 'Leitura focada de não-ficção ou desenvolvimento.',
      area: 'leisure',
      direction: 'build',
      trackingType: 'quantity',
      status: 'active',
      target: {
        type: 'quantity',
        targetValue: 20,
        unit: 'pages',
        allowOverachievement: true,
      },
      schedule: {
        frequencyType: 'daily',
        effectiveFrom: '2026-01-01',
        startDate: '2026-01-01',
      },
      reminders: [{ id: 'rem-3', time: '21:30', enabled: true }],
      timeOfDay: 'evening',
      preferredTime: '21:30',
      priority: 'high',
      icon: 'MenuBookRounded',
      tags: ['leitura', 'estudo'],
      cue: 'Depois de deitar na cama',
      motivation: 'Expandir conhecimento sem telas.',
      reward: 'Dormir com a mente tranquila.',
      source: 'leisure',
      sourceRef: {
        module: 'leisure',
        metricId: 'leisure.pagesRead',
        autoLog: true,
      },
      goalIds: ['goal-read-20-books'],
      routineIds: ['routine-evening-1'],
      startDate: '2026-01-01',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-01-01T08:00:00.000Z',
    },
    {
      id: 'habit-meditation',
      name: 'Meditação Mindfulness',
      description: 'Sessão de respiração e presença plena.',
      area: 'personal',
      direction: 'build',
      trackingType: 'duration',
      status: 'active',
      target: {
        type: 'duration',
        targetMinutes: 15,
        minimumMinutes: 5,
        timerPresets: [5, 10, 15, 20, 30],
      },
      schedule: {
        frequencyType: 'daily',
        effectiveFrom: '2026-01-01',
        startDate: '2026-01-01',
      },
      reminders: [{ id: 'rem-4', time: '07:00', enabled: true }],
      timeOfDay: 'morning',
      preferredTime: '07:15',
      priority: 'medium',
      icon: 'SelfImprovementRounded',
      tags: ['mente', 'calma'],
      cue: 'Depois de lavar o rosto pela manhã',
      motivation: 'Iniciar o dia centrado.',
      reward: 'Sensação de clareza mental.',
      source: 'manual',
      goalIds: [],
      routineIds: ['routine-morning-1'],
      startDate: '2026-01-01',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-01-01T08:00:00.000Z',
    },
    {
      id: 'habit-workout',
      name: 'Treino de Força',
      description: 'Musculação ou calistenia programada.',
      area: 'training',
      direction: 'build',
      trackingType: 'count',
      status: 'active',
      target: {
        type: 'count',
        targetValue: 4,
      },
      schedule: {
        frequencyType: 'flexibleWeekly',
        timesPerPeriod: 4,
        effectiveFrom: '2026-01-01',
        startDate: '2026-01-01',
      },
      reminders: [{ id: 'rem-5', time: '17:30', enabled: true }],
      timeOfDay: 'afternoon',
      preferredTime: '18:00',
      priority: 'high',
      icon: 'FitnessCenterRounded',
      tags: ['corpo', 'força'],
      cue: 'Ao encerrar o expediente de trabalho',
      motivation: 'Longevidade e saúde física.',
      reward: 'Pós-treino revigorante.',
      source: 'training',
      sourceRef: {
        module: 'training',
        metricId: 'training.workoutCompleted',
        autoLog: true,
      },
      goalIds: [],
      routineIds: [],
      startDate: '2026-01-01',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-01-01T08:00:00.000Z',
    },
    {
      id: 'habit-caffeine-limit',
      name: 'Evitar café após 16h',
      description: 'Proteger o sono profundo limitando estimulantes à tarde.',
      area: 'personal',
      direction: 'reduce',
      trackingType: 'limit',
      status: 'active',
      target: {
        type: 'limit',
        maxLimit: 0,
        unit: 'cups',
        period: 'day',
      },
      schedule: {
        frequencyType: 'daily',
        effectiveFrom: '2026-01-01',
        startDate: '2026-01-01',
      },
      reminders: [{ id: 'rem-6', time: '16:00', enabled: true }],
      timeOfDay: 'afternoon',
      priority: 'medium',
      icon: 'BedtimeRounded',
      tags: ['sono', 'saúde'],
      cue: 'Quando der vontade de tomar café às 16h',
      motivation: 'Dormir mais rápido sem insônia.',
      reward: 'Substituir por chá de camomila ou hortelã.',
      source: 'manual',
      goalIds: [],
      routineIds: [],
      startDate: '2026-01-01',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-01-01T08:00:00.000Z',
    },
  ];
}

export function createMockRoutines(): HabitRoutine[] {
  return [
    {
      id: 'routine-morning-1',
      name: 'Rotina Matinal de Alta Energia',
      description: 'Sequência matinal para despertar com foco e energia.',
      timeOfDay: 'morning',
      preferredTime: '07:00',
      estimatedDurationMinutes: 35,
      habitIds: ['habit-water', 'habit-meditation'],
      items: [
        { routineId: 'routine-morning-1', habitId: 'habit-water', order: 0 },
        { routineId: 'routine-morning-1', habitId: 'habit-meditation', order: 1, delayAfterPreviousMinutes: 5 },
      ],
      active: true,
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-01-01T08:00:00.000Z',
    },
    {
      id: 'routine-evening-1',
      name: 'Desaceleração Noturna',
      description: 'Preparar a mente e o corpo para um sono reparador.',
      timeOfDay: 'evening',
      preferredTime: '21:30',
      estimatedDurationMinutes: 30,
      habitIds: ['habit-reading'],
      items: [
        { routineId: 'routine-evening-1', habitId: 'habit-reading', order: 0 },
      ],
      active: true,
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-01-01T08:00:00.000Z',
    },
  ];
}

export function createMockHabitLogs(): HabitLog[] {
  const logs: HabitLog[] = [];
  const today = new Date();

  // Generate 45 days of realistic historical logs
  for (let i = 45; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0]!;
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    // Water habit (completed almost every day)
    logs.push({
      id: `log-water-${dateStr}`,
      habitId: 'habit-water',
      date: dateStr,
      timestamp: `${dateStr}T18:00:00.000Z`,
      status: 'completed',
      value: 2500,
      source: 'nutrition',
      sourceEventId: `water-event-${dateStr}`,
      createdAt: `${dateStr}T18:00:00.000Z`,
      updatedAt: `${dateStr}T18:00:00.000Z`,
    });

    // Reading habit (completed 85% of days, with some notes)
    if (i % 6 !== 0) {
      logs.push({
        id: `log-read-${dateStr}`,
        habitId: 'habit-reading',
        date: dateStr,
        timestamp: `${dateStr}T22:00:00.000Z`,
        status: 'completed',
        value: 20 + (i % 5),
        note: i === 1 ? 'Capítulo incrível sobre hábitos e identidade.' : undefined,
        source: 'leisure',
        sourceEventId: `reading-event-${dateStr}`,
        createdAt: `${dateStr}T22:00:00.000Z`,
        updatedAt: `${dateStr}T22:00:00.000Z`,
      });
    }

    // Meditation habit (weekdays mostly)
    if (!isWeekend || i % 3 === 0) {
      logs.push({
        id: `log-med-${dateStr}`,
        habitId: 'habit-meditation',
        date: dateStr,
        timestamp: `${dateStr}T07:30:00.000Z`,
        status: 'completed',
        value: 15,
        source: 'manual',
        createdAt: `${dateStr}T07:30:00.000Z`,
        updatedAt: `${dateStr}T07:30:00.000Z`,
      });
    }

    // Workout habit (4x/week: Mon, Wed, Fri, Sat)
    if ([1, 3, 5, 6].includes(d.getDay())) {
      logs.push({
        id: `log-work-${dateStr}`,
        habitId: 'habit-workout',
        date: dateStr,
        timestamp: `${dateStr}T19:00:00.000Z`,
        status: 'completed',
        value: 1,
        source: 'training',
        sourceEventId: `workout-event-${dateStr}`,
        createdAt: `${dateStr}T19:00:00.000Z`,
        updatedAt: `${dateStr}T19:00:00.000Z`,
      });
    }
  }

  return logs;
}

export function createMockHabitReviews(): HabitReview[] {
  return [
    {
      id: 'rev-1',
      periodStart: '2026-02-16',
      periodEnd: '2026-02-22',
      type: 'weekly',
      reflections: {
        whatWorked: 'A sequência da rotina matinal (água + meditação) funcionou muito bem.',
        whatWasHard: 'O treino de sexta ficou apertado por conta de reuniões no fim da tarde.',
        changesPlanned: 'Mudar o treino de sexta para a manhã.',
      },
      adjustmentsMade: [],
      createdAt: '2026-02-22T20:00:00.000Z',
    },
    {
      id: 'rev-2',
      periodStart: '2026-02-23',
      periodEnd: '2026-03-01',
      type: 'weekly',
      reflections: {
        whatWorked: 'Consistência de leitura excelente antes de dormir.',
        whatWasHard: 'Consumo de água caiu no fim de semana.',
        changesPlanned: 'Manter a garrafa cheia na sala aos sábados e domingos.',
      },
      adjustmentsMade: [],
      createdAt: '2026-03-01T20:00:00.000Z',
    },
  ];
}
