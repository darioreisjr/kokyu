import type {
  ScheduleEntryStatus,
  ScheduleSourceType,
} from '../types';

export const DEFAULT_PRIORITY_WEIGHTS: Record<'low' | 'medium' | 'high' | 'focus', number> = {
  low: 10,
  medium: 25,
  high: 50,
  focus: 100,
};

export const SCHEDULING_CONFIG = {
  defaultDayStartsAt: '06:00',
  defaultDayEndsAt: '23:00',
  defaultBufferMinutes: 5,
  defaultFocusDuration: 25,
  sampleSizeForInsights: 5,
};

export const SCHEDULE_SOURCE_METAS: Record<
  ScheduleSourceType,
  { label: string; badgeLabel: string; defaultColorToken: string; defaultIcon: string; colorTokenKey: string }
> = {
  mission: {
    label: 'Missão',
    badgeLabel: 'Missão',
    defaultColorToken: 'schedule.source.mission',
    colorTokenKey: 'schedule.source.mission',
    defaultIcon: 'AssignmentRounded',
  },
  habit: {
    label: 'Hábito',
    badgeLabel: 'Hábito',
    defaultColorToken: 'schedule.source.habit',
    colorTokenKey: 'schedule.source.habit',
    defaultIcon: 'AutorenewRounded',
  },
  training: {
    label: 'Treinamento',
    badgeLabel: 'Treino',
    defaultColorToken: 'schedule.source.training',
    colorTokenKey: 'schedule.source.training',
    defaultIcon: 'FitnessCenterRounded',
  },
  nutrition: {
    label: 'Nutrição',
    badgeLabel: 'Refeição',
    defaultColorToken: 'schedule.source.nutrition',
    colorTokenKey: 'schedule.source.nutrition',
    defaultIcon: 'RestaurantRounded',
  },
  leisure: {
    label: 'Tempo Livre',
    badgeLabel: 'Lazer',
    defaultColorToken: 'schedule.source.leisure',
    colorTokenKey: 'schedule.source.leisure',
    defaultIcon: 'MovieRounded',
  },
  goal: {
    label: 'Meta',
    badgeLabel: 'Meta',
    defaultColorToken: 'schedule.source.goal',
    colorTokenKey: 'schedule.source.goal',
    defaultIcon: 'TrackChangesRounded',
  },
  routine: {
    label: 'Rotina',
    badgeLabel: 'Rotina',
    defaultColorToken: 'schedule.source.routine',
    colorTokenKey: 'schedule.source.routine',
    defaultIcon: 'WbSunnyRounded',
  },
  calendar: {
    label: 'Calendário Externo',
    badgeLabel: 'Agenda',
    defaultColorToken: 'schedule.source.calendar',
    colorTokenKey: 'schedule.source.calendar',
    defaultIcon: 'EventRounded',
  },
  manual: {
    label: 'Compromisso Manual',
    badgeLabel: 'Agenda',
    defaultColorToken: 'schedule.source.manual',
    colorTokenKey: 'schedule.source.manual',
    defaultIcon: 'ScheduleRounded',
  },
  focus: {
    label: 'Modo de Foco',
    badgeLabel: 'Foco',
    defaultColorToken: 'schedule.source.focus',
    colorTokenKey: 'schedule.source.focus',
    defaultIcon: 'CenterFocusStrongRounded',
  },
  break: {
    label: 'Pausa',
    badgeLabel: 'Pausa',
    defaultColorToken: 'schedule.source.break',
    colorTokenKey: 'schedule.source.break',
    defaultIcon: 'CoffeeRounded',
  },
  travel: {
    label: 'Deslocamento',
    badgeLabel: 'Deslocamento',
    defaultColorToken: 'schedule.source.travel',
    colorTokenKey: 'schedule.source.travel',
    defaultIcon: 'DirectionsWalkRounded',
  },
  blockedTime: {
    label: 'Horário Indisponível',
    badgeLabel: 'Bloqueado',
    defaultColorToken: 'schedule.source.blockedTime',
    colorTokenKey: 'schedule.source.blockedTime',
    defaultIcon: 'BlockRounded',
  },
};

export const SCHEDULE_STATUS_METAS: Record<
  ScheduleEntryStatus,
  { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'error' }
> = {
  planned: { label: 'Planejado', color: 'default' },
  inProgress: { label: 'Em andamento', color: 'primary' },
  completed: { label: 'Concluído', color: 'success' },
  skipped: { label: 'Pulado', color: 'default' },
  rescheduled: { label: 'Reagendado', color: 'warning' },
  cancelled: { label: 'Cancelado', color: 'error' },
  missed: { label: 'Perdido', color: 'error' },
  unscheduled: { label: 'Sem horário', color: 'default' },
};

