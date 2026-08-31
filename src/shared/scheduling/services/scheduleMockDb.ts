import type {
  DayTemplate,
  FocusSession,
  ScheduleActivity,
  ScheduleEntry,
  ScheduleInboxItem,
} from '../types';

let idCounter = 1;

export function generateScheduleId(prefix = 'sched'): string {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

export const defaultDayTemplates: DayTemplate[] = [
  {
    id: 'template-workday',
    name: 'Dia de Escritório',
    description: 'Rotina de trabalho presencial com blocos de foco e deslocamento.',
    context: 'work',
    items: [
      {
        id: 'tpl-1',
        title: 'Deslocamento até o trabalho',
        startAt: '07:30',
        endAt: '08:15',
        duration: 45,
        sourceType: 'travel',
        locked: true,
      },
      {
        id: 'tpl-2',
        title: 'Bloco de Foco: Trabalho',
        startAt: '09:00',
        endAt: '12:00',
        duration: 180,
        sourceType: 'focus',
        locked: false,
      },
      {
        id: 'tpl-3',
        title: 'Almoço',
        startAt: '12:00',
        endAt: '13:00',
        duration: 60,
        sourceType: 'nutrition',
        locked: true,
      },
      {
        id: 'tpl-4',
        title: 'Deslocamento de retorno',
        startAt: '18:00',
        endAt: '18:45',
        duration: 45,
        sourceType: 'travel',
        locked: true,
      },
    ],
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 'template-homeoffice',
    name: 'Home Office',
    description: 'Dia focado em casa com menos deslocamento e pausas flexíveis.',
    context: 'work',
    items: [
      {
        id: 'tpl-ho-1',
        title: 'Rotina Matinal',
        startAt: '07:30',
        endAt: '08:30',
        duration: 60,
        sourceType: 'routine',
        locked: true,
      },
      {
        id: 'tpl-ho-2',
        title: 'Foco Profundo - Manhã',
        startAt: '09:00',
        endAt: '12:00',
        duration: 180,
        sourceType: 'focus',
        locked: false,
      },
      {
        id: 'tpl-ho-3',
        title: 'Almoço e Descanso',
        startAt: '12:00',
        endAt: '13:30',
        duration: 90,
        sourceType: 'nutrition',
        locked: true,
      },
    ],
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 'template-weekend',
    name: 'Fim de Semana',
    description: 'Ritmo mais leve para recuperação, hobbies e lazer.',
    context: 'leisure',
    items: [
      {
        id: 'tpl-wk-1',
        title: 'Café da manhã relaxado',
        startAt: '09:00',
        endAt: '10:00',
        duration: 60,
        sourceType: 'nutrition',
        locked: false,
      },
      {
        id: 'tpl-wk-2',
        title: 'Tempo Livre e Hobbies',
        startAt: '15:00',
        endAt: '18:00',
        duration: 180,
        sourceType: 'leisure',
        locked: false,
      },
    ],
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
  },
];

export function createInitialManualEntries(): ScheduleEntry[] {
  const todayStr = new Date().toISOString().split('T')[0]!;
  return [
    {
      id: 'manual-reuniao-1',
      sourceType: 'manual',
      sourceId: 'meeting-101',
      title: 'Reunião de Alinhamento Semanal',
      description: 'Sincronização de projetos com equipe.',
      date: todayStr,
      startAt: '14:00',
      endAt: '15:00',
      duration: 60,
      locked: true,
      status: 'planned',
      priority: 'high',
      context: 'work',
      location: { type: 'online', name: 'Google Meet' },
      createdAt: '2026-08-30T10:00:00Z',
      updatedAt: '2026-08-30T10:00:00Z',
    },
    {
      id: 'manual-consulta-1',
      sourceType: 'manual',
      sourceId: 'doctor-102',
      title: 'Consulta Médica de Rotina',
      description: 'Checkup semestral.',
      date: todayStr,
      startAt: '16:30',
      endAt: '17:30',
      duration: 60,
      locked: true,
      status: 'planned',
      priority: 'high',
      context: 'health',
      location: { type: 'other', name: 'Clínica Saúde' },
      createdAt: '2026-08-25T14:00:00Z',
      updatedAt: '2026-08-25T14:00:00Z',
    },
  ];
}

export function createInitialInboxItems(): ScheduleInboxItem[] {
  return [
    {
      id: 'inbox-1',
      title: 'Ligar para o banco para resolver chave Pix',
      note: 'Falar com o gerente sobre o limite diário.',
      createdAt: '2026-08-30T14:30:00Z',
      source: 'manual',
      processed: false,
    },
    {
      id: 'inbox-2',
      title: 'Comprar presente de aniversário',
      note: 'Pesquisar opções de livros.',
      createdAt: '2026-08-30T18:00:00Z',
      source: 'manual',
      processed: false,
    },
    {
      id: 'inbox-3',
      title: 'Assistir Duna: Parte Dois',
      note: 'Salvar no catálogo de Tempo Livre.',
      createdAt: '2026-08-31T08:00:00Z',
      source: 'manual',
      processed: false,
    },
  ];
}

export const scheduleDb: {
  manualEntries: ScheduleEntry[];
  inboxItems: ScheduleInboxItem[];
  dayTemplates: DayTemplate[];
  activeFocusSession: FocusSession | null;
  focusHistory: FocusSession[];
  activities: ScheduleActivity[];
} = {
  manualEntries: createInitialManualEntries(),
  inboxItems: createInitialInboxItems(),
  dayTemplates: [...defaultDayTemplates],
  activeFocusSession: null,
  focusHistory: [],
  activities: [],
};

export function resetScheduleDb(): void {
  scheduleDb.manualEntries = createInitialManualEntries();
  scheduleDb.inboxItems = createInitialInboxItems();
  scheduleDb.dayTemplates = [...defaultDayTemplates];
  scheduleDb.activeFocusSession = null;
  scheduleDb.focusHistory = [];
  scheduleDb.activities = [];
}

