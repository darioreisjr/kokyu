/** Every Tempo Livre URL, in one place — components link via these, never a literal `/app/tempo-livre/...` string. */
export const leisureRoutes = {
  today: '/app/tempo-livre',
  planner: '/app/tempo-livre/planejamento',
  later: '/app/tempo-livre/para-depois',
  library: '/app/tempo-livre/biblioteca',
  places: '/app/tempo-livre/lugares',
  hobbies: '/app/tempo-livre/hobbies',
  notes: '/app/tempo-livre/notas',
  history: '/app/tempo-livre/historico',
  item: (id: string) => `/app/tempo-livre/item/${id}`,
  planNew: '/app/tempo-livre/planejamento/nova',
  planEdit: (id: string) => `/app/tempo-livre/planejamento/${id}/editar`,
} as const;

export interface LeisureTabConfig {
  id: string;
  label: string;
  href: string;
}

/** Drives `LeisureTabs` — the internal sub-navigation, kept separate from the app's own `navigationItems`. */
export const leisureTabs: LeisureTabConfig[] = [
  { id: 'hoje', label: 'Hoje', href: leisureRoutes.today },
  { id: 'planejamento', label: 'Planejamento', href: leisureRoutes.planner },
  { id: 'para-depois', label: 'Para depois', href: leisureRoutes.later },
  { id: 'biblioteca', label: 'Biblioteca', href: leisureRoutes.library },
  { id: 'lugares', label: 'Lugares & Passeios', href: leisureRoutes.places },
  { id: 'hobbies', label: 'Hobbies', href: leisureRoutes.hobbies },
  { id: 'notas', label: 'Notas', href: leisureRoutes.notes },
  { id: 'historico', label: 'Histórico', href: leisureRoutes.history },
];
