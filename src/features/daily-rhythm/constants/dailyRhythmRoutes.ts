export const dailyRhythmRoutes = {
  today: '/app/ritmo-diario',
  week: '/app/ritmo-diario/semana',
  calendar: '/app/ritmo-diario/calendario',
  inbox: '/app/ritmo-diario/inbox',
  routines: '/app/ritmo-diario/rotinas',
  focus: '/app/ritmo-diario/foco',
  review: '/app/ritmo-diario/revisao',
} as const;

export interface DailyRhythmTabConfig {
  id: string;
  label: string;
  href: string;
}

export const dailyRhythmTabs: DailyRhythmTabConfig[] = [
  { id: 'today', label: 'Hoje', href: dailyRhythmRoutes.today },
  { id: 'week', label: 'Semana', href: dailyRhythmRoutes.week },
  { id: 'calendar', label: 'Calendário', href: dailyRhythmRoutes.calendar },
  { id: 'inbox', label: 'Caixa de entrada', href: dailyRhythmRoutes.inbox },
  { id: 'routines', label: 'Rotinas', href: dailyRhythmRoutes.routines },
  { id: 'focus', label: 'Foco', href: dailyRhythmRoutes.focus },
  { id: 'review', label: 'Revisão', href: dailyRhythmRoutes.review },
];

