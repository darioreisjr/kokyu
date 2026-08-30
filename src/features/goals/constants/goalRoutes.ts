/** Every Metas URL, in one place — components link via these, never a literal `/app/metas/...` string. */
export const goalRoutes = {
  overview: '/app/metas',
  inProgress: '/app/metas/em-andamento',
  planning: '/app/metas/planejamento',
  checkIns: '/app/metas/check-ins',
  completed: '/app/metas/concluidas',
  history: '/app/metas/historico',
  new: '/app/metas/nova',
  detail: (id: string) => `/app/metas/${id}`,
  edit: (id: string) => `/app/metas/${id}/editar`,
} as const;

export interface GoalTabConfig {
  id: string;
  label: string;
  href: string;
}

/** Drives `GoalTabs` — the internal sub-navigation, kept separate from the app's own `navigationItems`. */
export const goalTabs: GoalTabConfig[] = [
  { id: 'visao-geral', label: 'Visão geral', href: goalRoutes.overview },
  { id: 'em-andamento', label: 'Em andamento', href: goalRoutes.inProgress },
  { id: 'planejamento', label: 'Planejamento', href: goalRoutes.planning },
  { id: 'check-ins', label: 'Check-ins', href: goalRoutes.checkIns },
  { id: 'concluidas', label: 'Concluídas', href: goalRoutes.completed },
  { id: 'historico', label: 'Histórico', href: goalRoutes.history },
];
