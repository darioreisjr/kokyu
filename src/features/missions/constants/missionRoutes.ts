export const missionRoutes = {
  today: '/app/missoes',
  inbox: '/app/missoes/inbox',
  upcoming: '/app/missoes/proximas',
  backlog: '/app/missoes/backlog',
  projects: '/app/missoes/projetos',
  waiting: '/app/missoes/aguardando',
  completed: '/app/missoes/concluidas',
  review: '/app/missoes/revisao',
  new: '/app/missoes/nova',
  detail: (id: string) => `/app/missoes/${id}`,
  edit: (id: string) => `/app/missoes/${id}/editar`,
  projectDetail: (id: string) => `/app/missoes/projetos/${id}`,
};

export const missionTabs = [
  { id: 'hoje', label: 'Hoje', href: missionRoutes.today },
  { id: 'inbox', label: 'Inbox', href: missionRoutes.inbox },
  { id: 'proximas', label: 'Próximas', href: missionRoutes.upcoming },
  { id: 'projetos', label: 'Projetos', href: missionRoutes.projects },
  { id: 'backlog', label: 'Backlog', href: missionRoutes.backlog },
  { id: 'aguardando', label: 'Aguardando', href: missionRoutes.waiting },
  { id: 'concluidas', label: 'Concluídas', href: missionRoutes.completed },
  { id: 'revisao', label: 'Revisão', href: missionRoutes.review },
];
